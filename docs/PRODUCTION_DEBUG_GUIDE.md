# Guida Debug Produzione - Pagina Bianca

## Problema Identificato
Dai log del browser, l'errore è causato da **Laravel Debugbar attivo in produzione** che intercetta le richieste WebSocket di Echo restituendo HTML invece di JSON, bloccando il rendering React.

---

## Script di Diagnostica

Esegui questi comandi **sul server di produzione** per diagnosticare:

```bash
# 1. Verifica configurazione ambiente
echo "=== CONFIGURAZIONE AMBIENTE ==="
grep -E "APP_ENV|APP_DEBUG|DEBUGBAR_ENABLED" /path/to/gymme/.env

# 2. Verifica se debugbar è installato
echo "=== DEBUGBAR INSTALLATO ==="
cd /path/to/gymme
composer show | grep debugbar

# 3. Controlla errori Laravel
echo "=== ULTIMI ERRORI LARAVEL ==="
tail -50 /path/to/gymme/storage/logs/laravel.log

# 4. Verifica build Vite
echo "=== BUILD VITE ==="
ls -lh /path/to/gymme/public/build/manifest.json
cat /path/to/gymme/public/build/manifest.json | head -20

# 5. Controlla permessi storage
echo "=== PERMESSI STORAGE ==="
ls -ld /path/to/gymme/storage
ls -ld /path/to/gymme/storage/logs
```

---

## Soluzione Rapida

### Step 1: Disabilita Debugbar

**Sul server**, modifica il file `.env`:

```bash
nano /path/to/gymme/.env
```

Assicurati che contenga:
```env
APP_ENV=production
APP_DEBUG=false
DEBUGBAR_ENABLED=false
```

### Step 2: Pulisci Cache

```bash
cd /path/to/gymme

php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear
php artisan optimize
```

### Step 3: Rimuovi Debugbar da Produzione (Opzionale ma Raccomandato)

```bash
cd /path/to/gymme

# Backup composer.json
cp composer.json composer.json.backup

# Rimuovi debugbar dalle dipendenze di produzione
composer remove barryvdh/laravel-debugbar --no-update

# Oppure, se vuoi tenerlo solo per sviluppo:
composer install --no-dev --optimize-autoloader
```

### Step 4: Verifica Build Frontend

```bash
# Controlla che esista il manifest
ls -lh /path/to/gymme/public/build/manifest.json

# Se manca, devi rifare il build
cd /path/to/gymme
npm run build
```

### Step 5: Riavvia Servizi

```bash
# Riavvia PHP-FPM
sudo systemctl restart php8.3-fpm

# Riavvia Nginx/Apache
sudo systemctl restart nginx
# OPPURE
sudo systemctl restart apache2

# Se usi queue workers
php artisan queue:restart
```

---

## Verifica Funzionamento

Dopo aver eseguito i fix, verifica:

1. **Browser**: Apri https://gymme-v2.ddns.net/ in modalità incognito
2. **Console Browser**:
   - Apri DevTools (F12)
   - Tab Console
   - Cerca errori JavaScript (dovrebbero sparire)
3. **Network Tab**:
   - Verifica che `/broadcasting/auth` restituisca JSON, non HTML
   - Tutti gli asset `/build/*` devono caricare con status 200

---

## Problemi Comuni Aggiuntivi

### Problema 1: Asset Non Trovati (404)

**Sintomo**: Nella console browser vedi errori 404 per `/build/assets/*.js`

**Soluzione**:
```bash
# Rifai il build in locale
npm run build

# Carica i file sul server
rsync -avz public/build/ user@server:/path/to/gymme/public/build/
```

### Problema 2: CORS / Mixed Content

**Sintomo**: Errori CORS nella console

**Soluzione** - Verifica configurazione Nginx:
```nginx
# /etc/nginx/sites-available/gymme

location / {
    try_files $uri $uri/ /index.php?$query_string;
}

# Asset statici
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Problema 3: WebSocket Non Funziona

**Sintomo**: Echo continua a dare errori anche dopo fix debugbar

**Soluzione**:
```bash
# Verifica configurazione .env
grep BROADCAST /path/to/gymme/.env

# Dovrebbe essere:
# BROADCAST_CONNECTION=pusher (se usi Pusher)
# OPPURE
# BROADCAST_CONNECTION=log (se non usi broadcasting)
```

Se non usi broadcasting, **disabilita Echo** in `resources/js/app.tsx`:
```typescript
// Commenta queste righe se non usi WebSocket
// import Echo from 'laravel-echo';
// window.Echo = new Echo({ ... });
```

### Problema 4: Permessi Storage

**Sintomo**: Errori di scrittura nei log

**Soluzione**:
```bash
cd /path/to/gymme

# Imposta permessi corretti
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

---

## Script Completo di Fix (Copia-Incolla)

```bash
#!/bin/bash
# fix-production.sh - Esegui sul server di produzione

set -e

echo "=== FIX GYMME PRODUZIONE ==="

# Path applicazione
APP_PATH="/path/to/gymme"  # MODIFICA QUESTO
cd $APP_PATH

# 1. Backup
echo "1. Backup .env..."
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# 2. Disabilita debug
echo "2. Disabilita debug mode..."
sed -i 's/APP_ENV=.*/APP_ENV=production/' .env
sed -i 's/APP_DEBUG=.*/APP_DEBUG=false/' .env
grep -q "DEBUGBAR_ENABLED" .env && sed -i 's/DEBUGBAR_ENABLED=.*/DEBUGBAR_ENABLED=false/' .env || echo "DEBUGBAR_ENABLED=false" >> .env

# 3. Pulisci cache
echo "3. Pulizia cache..."
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# 4. Ottimizza
echo "4. Ottimizzazione..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# 5. Rimuovi debugbar (opzionale)
echo "5. Rimozione debugbar..."
composer remove barryvdh/laravel-debugbar --no-update || true
composer install --no-dev --optimize-autoloader

# 6. Permessi
echo "6. Fix permessi..."
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# 7. Riavvia servizi
echo "7. Riavvio servizi..."
sudo systemctl restart php8.3-fpm
sudo systemctl restart nginx

echo "=== FIX COMPLETATO ==="
echo "Verifica il sito: https://gymme-v2.ddns.net/"
```

**Uso**:
```bash
# Sul server
nano fix-production.sh
# Incolla lo script sopra
# MODIFICA la riga APP_PATH="/path/to/gymme"
chmod +x fix-production.sh
./fix-production.sh
```

---

## Checklist Pre-Deploy (Per Il Futuro)

Prima di ogni deploy in produzione:

- [ ] `APP_ENV=production` in `.env`
- [ ] `APP_DEBUG=false` in `.env`
- [ ] `composer install --no-dev --optimize-autoloader`
- [ ] `npm run build` (assets compilati)
- [ ] `php artisan config:cache`
- [ ] `php artisan route:cache`
- [ ] `php artisan view:cache`
- [ ] Verifica che `public/build/manifest.json` esista
- [ ] Permessi storage: `775` owner `www-data:www-data`

---

## Log da Controllare

Se il problema persiste dopo i fix, controlla questi log **sul server**:

```bash
# Laravel log
tail -f /path/to/gymme/storage/logs/laravel.log

# Nginx error log
tail -f /var/log/nginx/error.log

# Nginx access log
tail -f /var/log/nginx/access.log

# PHP-FPM log
tail -f /var/log/php8.3-fpm.log
```

---

## Contattami Con

Se il problema persiste, mandami questi output:

1. `cat /path/to/gymme/.env | grep -E "APP_ENV|APP_DEBUG|BROADCAST"`
2. `ls -lh /path/to/gymme/public/build/`
3. `tail -50 /path/to/gymme/storage/logs/laravel.log`
4. Screenshot della console browser (F12 > Console) con errori
5. Screenshot della tab Network (F12 > Network) filtrata per `/broadcasting/auth`