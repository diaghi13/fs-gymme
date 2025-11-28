# Multi-Tenant Asset Loading Fix

## 📋 Indice
- [Problema](#problema)
- [Causa Tecnica](#causa-tecnica)
- [Soluzione Implementata](#soluzione-implementata)
- [File Modificati](#file-modificati)
- [Come Testare](#come-testare)
- [Rollback](#rollback)
- [Troubleshooting](#troubleshooting)

---

## 🔴 Problema

### Sintomi
Quando si accedeva all'applicazione multi-tenant, si verificava una **schermata bianca** con errori nella console del browser:

```
GET http://localhost:8000/assets/app-BoeSpg6_.js 404 (Not Found)
GET http://localhost:8000/tenant60876426.../build/assets/email-settings-xxx.js 404 (Not Found)
Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/html"
```

### Impatto
- **Schermata bianca** per tutti gli utenti tenant
- **Impossibile utilizzare l'applicazione** dopo il build di produzione
- Funzionava solo con `npm run dev` (server di sviluppo Vite)

---

## 🔍 Causa Tecnica

### Il problema aveva 3 livelli:

#### 1. **Import Dinamici JavaScript con Path Relativi**
Vite compila il codice generando import dinamici con percorsi relativi:

```javascript
// Inside app-BoeSpg6_.js
import('./email-settings-D7vIb3PK.js')
import('./formik.esm-Cf71ckry.js')
```

Il browser risolve questi path relativi in base alla **posizione corrente**.

#### 2. **Routing Multi-Tenant Complesso**
Con route come `/app/{tenant}/configurations/email`, il browser a volte perdeva il contesto e risolveva gli import come:

- ❌ `/assets/email-settings-xxx.js` (manca `/build/`)
- ❌ `/tenant60876426.../build/assets/email-settings-xxx.js` (prefisso errato)

Invece del corretto:
- ✅ `/build/assets/email-settings-xxx.js`

#### 3. **Laravel Vite Plugin e URL Base**
Il Laravel Vite plugin non supporta bene configurazioni `base` custom, quindi gli URL nei file JavaScript compilati rimanevano relativi.

---

## ✅ Soluzione Implementata

### Strategia Multi-Livello

La soluzione usa un approccio a **3 livelli** che lavora insieme:

1. **Middleware `ServeStaticAssets`**: Intercetta richieste con percorsi errati e fa redirect al percorso corretto
2. **Configurazione `ASSET_URL`**: Forza Laravel a usare URL assoluti
3. **Vite Config Pulita**: Mantiene la configurazione semplice per compatibilità

### Come Funziona il Flusso

```
Browser richiede: /tenant.../build/assets/app.js
         ↓
Middleware intercetta
         ↓
Redirect 301 → /build/assets/app.js
         ↓
Browser segue redirect e aggiorna contesto
         ↓
Middleware serve il file da public/build/
         ↓
Import successivi usano il path corretto ✅
```

**Il redirect è la chiave**: resetta il contesto del browser facendo sì che gli import() dinamici successivi usino il path corretto.

---

## 📝 File Modificati

### 1. `app/Http/Middleware/ServeStaticAssets.php`

**MODIFICATO** - Questo è il cuore della soluzione.

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class ServeStaticAssets
{
    public function handle(Request $request, Closure $next): Response
    {
        $path = $request->path();

        // PARTE 1: Redirect richieste con prefissi errati
        if (preg_match('#^(.+?)/build/(.+)$#', $path, $matches)) {
            $prefix = $matches[1];
            $assetPath = $matches[2];
            
            if (!empty($prefix)) {
                return redirect('/build/' . $assetPath, 301);
            }
        }

        // PARTE 2: Serve assets dal path corretto
        if (preg_match('#^build/(.+)$#', $path, $matches)) {
            $assetPath = public_path('build/' . $matches[1]);
            
            if (is_file($assetPath)) {
                return new BinaryFileResponse($assetPath);
            }
        }

        $response = $next($request);

        // PARTE 3: Post-processa HTML per correggere tag src/href
        if ($response instanceof \Illuminate\Http\Response &&
            str_contains($response->headers->get('Content-Type', ''), 'text/html')) {

            $content = $response->getContent();

            if ($content) {
                $content = preg_replace(
                    '#((?:src|href)=["\'])[^"\']*?/build/#',
                    '$1/build/',
                    $content
                );

                $response->setContent($content);
            }
        }

        return $response;
    }
}
```

**Cosa fa:**
- Intercetta richieste a `/tenant.../build/assets/...` o simili
- Fa redirect 301 a `/build/assets/...`
- Serve i file direttamente da `public/build/`
- Corregge eventuali URL errati nell'HTML

### 2. `.env`

**AGGIUNTO**:
```env
ASSET_URL=http://localhost:8000
```

In **produzione**, sostituire con l'URL reale:
```env
ASSET_URL=https://tuodominio.com
```

### 3. `config/app.php`

**AGGIUNTO** dopo `'url' => env('APP_URL', 'http://localhost'),`:

```php
'asset_url' => env('ASSET_URL'),
```

### 4. `app/Providers/AppServiceProvider.php`

**MODIFICATO** - Callback Vite per accettare parametri nullable:

```php
// Nella funzione boot(), circa linea 45-60:

\Illuminate\Support\Facades\Vite::useScriptTagAttributes(function (?string $src, string $url, ?array $chunk, ?array $manifest) {
    return [
        'type' => 'module',
        'crossorigin' => true,
    ];
});

\Illuminate\Support\Facades\Vite::useStyleTagAttributes(function (?string $src, string $url, ?array $chunk, ?array $manifest) {
    return [];
});
```

**Nota**: Il cambio da `string $src` a `?string $src` è necessario perché Laravel Vite a volte passa `null`.

### 5. `app/Providers/ViteServiceProvider.php`

**CREATO** - Nuovo service provider per configurazioni Vite:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class ViteServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Vite::useScriptTagAttributes([
            'data-navigate-track' => 'reload',
        ]);

        Vite::useStyleTagAttributes([
            'data-navigate-track' => 'reload',
        ]);

        Vite::useBuildDirectory('build');
        
        Vite::prefetch(concurrency: 3);
    }
}
```

### 6. `bootstrap/providers.php`

**AGGIUNTO** `ViteServiceProvider`:

```php
return [
    App\Providers\AppServiceProvider::class,
    App\Providers\DtoServiceProvider::class,
    App\Providers\TenancyServiceProvider::class,
    App\Providers\ViteServiceProvider::class, // ← NUOVO
];
```

### 7. `resources/views/app.blade.php`

**NESSUNA MODIFICA FINALE** - Abbiamo rimosso il tag `<base>` che avevamo provato inizialmente perché causava problemi.

### 8. `vite.config.ts`

**NESSUNA MODIFICA** - Configurazione mantenuta pulita e semplice.

---

## 🧪 Come Testare

### Test 1: Build e Accesso Tenant
```bash
# 1. Build per produzione
npm run build

# 2. Pulire cache
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# 3. Accedere a una route tenant
# Aprire: http://localhost:8000/app/{tenant-id}/configurations/email

# 4. Verificare nella console del browser:
# ✅ Nessun errore 404
# ✅ Tutti gli asset caricano correttamente
# ✅ La pagina si visualizza normalmente
```

### Test 2: Verifica Redirect
```bash
# Test manuale del redirect
curl -I http://localhost:8000/tenant60876426.../build/assets/app-xxx.js

# Dovrebbe rispondere:
# HTTP/1.1 301 Moved Permanently
# Location: /build/assets/app-xxx.js
```

### Test 3: Verifica Asset Diretti
```bash
# Accesso diretto agli asset
curl -I http://localhost:8000/build/assets/app-xxx.js

# Dovrebbe rispondere:
# HTTP/1.1 200 OK
# Content-Type: application/javascript
```

---

## ⏮️ Rollback

### Se la soluzione causa problemi, ecco come fare rollback completo:

#### Step 1: Ripristinare Middleware (Obbligatorio)

Sostituire `app/Http/Middleware/ServeStaticAssets.php` con una versione più semplice:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class ServeStaticAssets
{
    public function handle(Request $request, Closure $next): Response
    {
        $path = $request->path();

        // Serve asset da /build/ direttamente
        if (preg_match('#^build/(.+)$#', $path, $matches)) {
            $assetPath = public_path('build/' . $matches[1]);
            
            if (is_file($assetPath)) {
                return new BinaryFileResponse($assetPath);
            }
        }

        return $next($request);
    }
}
```

#### Step 2: Rimuovere ViteServiceProvider (Opzionale)

```bash
# Eliminare il file
rm app/Providers/ViteServiceProvider.php

# Rimuovere da bootstrap/providers.php
# Eliminare la riga: App\Providers\ViteServiceProvider::class,
```

#### Step 3: Ripristinare AppServiceProvider (Opzionale)

In `app/Providers/AppServiceProvider.php`, cambiare:
```php
// Da:
function (?string $src, string $url, ?array $chunk, ?array $manifest)

// A:
function (string $src, string $url, ?array $chunk, ?array $manifest)
```

#### Step 4: Rimuovere ASSET_URL (Opzionale)

```bash
# In .env, rimuovere:
# ASSET_URL=http://localhost:8000

# In config/app.php, rimuovere:
# 'asset_url' => env('ASSET_URL'),
```

#### Step 5: Pulire Cache e Rebuild

```bash
php artisan config:clear
php artisan cache:clear
php artisan view:clear
npm run build
```

#### Step 6: Workaround Temporaneo

Se dopo il rollback non funziona, usare **solo il dev server** finché non si trova una soluzione alternativa:

```bash
# In un terminale:
npm run dev

# In un altro terminale:
php artisan serve
```

Con il dev server Vite, gli asset vengono serviti dinamicamente e non c'è il problema dei path relativi.

---

## 🐛 Troubleshooting

### Problema: Ancora errori 404 dopo il fix

**Soluzione:**
```bash
# 1. Verificare che i file build esistano
ls -la public/build/assets/

# 2. Rifare build da zero
rm -rf public/build
npm run build

# 3. Pulire TUTTE le cache
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# 4. Hard refresh nel browser
# Mac: Cmd + Shift + R
# Windows/Linux: Ctrl + Shift + R
```

### Problema: Redirect loop infinito

**Causa**: Il regex del middleware cattura anche path corretti.

**Soluzione**: Verificare che il regex in `ServeStaticAssets.php` sia esattamente:
```php
preg_match('#^(.+?)/build/(.+)$#', $path, $matches)
```

Il `?` dopo `.+` è importante per il matching non-greedy.

### Problema: Alcuni asset caricano, altri no

**Causa**: Cache del browser o service worker.

**Soluzione:**
```bash
# 1. Aprire DevTools (F12)
# 2. Andare su Application/Storage
# 3. "Clear site data"
# 4. Disabilitare service worker se presente
# 5. Hard refresh
```

### Problema: Funziona in locale ma non in produzione

**Verifica**:
```bash
# 1. Controllare ASSET_URL in produzione
echo $ASSET_URL

# 2. Deve essere l'URL corretto del dominio
# Corretto:   ASSET_URL=https://tuodominio.com
# Sbagliato:  ASSET_URL=http://localhost:8000

# 3. Rigenerare config cache in produzione
php artisan config:cache
```

### Problema: Performance degradata

**Causa**: Troppi redirect.

**Soluzione**: I redirect 301 sono cacheable. Se vedi performance degradata:
```bash
# 1. Verificare quanti redirect vengono fatti
# Apri DevTools → Network → filtra per "301"

# 2. Se troppi redirect, potrebbe essere un problema di routing
# Verificare che le route tenant non interferiscano con /build/
```

---

## 📊 Vantaggi della Soluzione

✅ **Compatibile con Multi-Tenancy**: Funziona con qualsiasi prefisso route  
✅ **Non modifica Vite/Laravel standard**: Lascia che facciano il loro lavoro  
✅ **Performance**: I redirect 301 sono cacheable dal browser  
✅ **Robusto**: Gestisce tutti i casi di URL errati  
✅ **Trasparente**: L'utente non vede nulla, tutto automatico  
✅ **Facilmente reversibile**: Rollback semplice e documentato  

---

## 📚 Riferimenti

- [Laravel Vite Plugin Documentation](https://laravel.com/docs/11.x/vite)
- [Vite Base Path Configuration](https://vitejs.dev/config/shared-options.html#base)
- [Inertia.js Multi-Tenancy](https://inertiajs.com/)
- [JavaScript Module Import Resolution](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)

---

## ✍️ Metadata

**Data Implementazione**: 19 Novembre 2025  
**Versioni Coinvolte**:
- Laravel: 12.37.0
- Vite: 6.3.5
- Laravel Vite Plugin: (da verificare in package.json)
- Inertia Laravel: v2

**Autore**: Implementato tramite GitHub Copilot  
**Test**: ✅ Verificato in locale su macOS con Chrome

---

## 🔄 Change Log

### v1.0.0 (19 Nov 2025)
- ✅ Implementato middleware ServeStaticAssets con redirect
- ✅ Aggiunto ASSET_URL configuration
- ✅ Creato ViteServiceProvider
- ✅ Modificato AppServiceProvider per parametri nullable
- ✅ Documentazione completa creata

---

**NOTA IMPORTANTE**: Conservare questo documento nel repository per riferimento futuro. Se si modifica qualcosa nella gestione degli asset, aggiornare questa documentazione.

