# 🔧 DEBUG: Vendita non genera fattura

## ✅ Modifiche Applicate

1. ✅ Controller aggiornato con `SaleStatusEnum`
2. ✅ Frontend aggiornato (no più 'completed')
3. ✅ Build frontend completato
4. ✅ Cache Laravel cleared
5. ✅ Route debug aggiunta

---

## 🧪 Come Verificare il Problema

### Opzione 1: Route Debug (VELOCE)

Vai su questa URL nel browser:
```
https://tuodominio.it/app/{tenant}/sales/{sale_id}/debug-status
```

Vedrai JSON con:
```json
{
  "sale_id": 123,
  "progressive_number": "0001",
  "status": "draft",  // <-- QUESTO È IL PROBLEMA!
  "can_generate": false,
  "all_statuses": {...}
}
```

### Opzione 2: Controlla Database Direttamente

```sql
SELECT id, progressive_number, status, type 
FROM sales 
WHERE id = YOUR_SALE_ID;
```

---

## 🎯 Possibili Cause

### Causa 1: Status è "draft"
**Problema**: La vendita è ancora in bozza  
**Soluzione**: Devi salvare/confermare la vendita

**Come cambiare**:
```php
$sale = Sale::find(YOUR_ID);
$sale->update(['status' => 'saved']); // o 'sent'
```

### Causa 2: Browser Cache
**Problema**: Il browser ha ancora il vecchio JS in cache  
**Soluzione**: Hard refresh

- **Chrome/Edge**: `Ctrl+Shift+R` (Windows) o `Cmd+Shift+R` (Mac)
- **Firefox**: `Ctrl+F5` (Windows) o `Cmd+Shift+R` (Mac)
- **Safari**: `Cmd+Option+R`

### Causa 3: npm run dev Attivo
**Problema**: Se hai `npm run dev` in esecuzione, potrebbe usare vecchio codice  
**Soluzione**: 
```bash
# Stoppa npm run dev (Ctrl+C)
# Poi fai build
npm run build
```

---

## ✅ Soluzione Rapida (3 step)

### Step 1: Verifica Status Vendita

Vai su: `/app/{tenant}/sales/{sale_id}/debug-status`

Se vedi `"status": "draft"` → **Questo è il problema!**

### Step 2: Cambia Status

**Opzione A - Via Database**:
```sql
UPDATE sales 
SET status = 'saved' 
WHERE id = YOUR_SALE_ID;
```

**Opzione B - Via Tinker**:
```bash
php artisan tinker
$sale = App\Models\Sale\Sale::find(YOUR_ID);
$sale->update(['status' => 'saved']);
```

**Opzione C - Via Form** (se implementato):
Nel form vendita, clicca "Salva" invece di "Salva Bozza"

### Step 3: Hard Refresh Browser

`Cmd+Shift+R` (Mac) o `Ctrl+Shift+R` (Windows)

---

## 🎨 Come Dovrebbe Apparire

### Con Status = 'draft' ❌
```
┌─────────────────────────────────┐
│ Fattura Elettronica             │
├─────────────────────────────────┤
│ ⚠️ Salva o completa la vendita  │
│   per poter generare...         │
│                                 │
│ (Nessun bottone)                │
└─────────────────────────────────┘
```

### Con Status = 'saved' ✅
```
┌─────────────────────────────────┐
│ Fattura Elettronica             │
├─────────────────────────────────┤
│ ℹ️ La vendita è pronta.         │
│   Puoi generare...              │
│                                 │
│ [📄 Genera Fattura Elettronica] │
└─────────────────────────────────┘
```

---

## 🐛 Se Ancora Non Funziona

### Check 1: Vite Manifest
```bash
ls -lah public/build/manifest.json
# Se non esiste o è vecchio:
npm run build
```

### Check 2: Asset Compilato
```bash
ls -lah public/build/assets/app-*.js
# Verifica che la data sia recente (oggi)
```

### Check 3: Console Browser
Apri DevTools → Console → Cerca errori JavaScript

### Check 4: Network Tab
DevTools → Network → Reload → Cerca `app-*.js`  
Verifica che carichi il file nuovo

---

## 📝 Note per il Form Vendita

Se stai creando vendite via form, assicurati che:

1. **Default status**: `draft` (OK)
2. **Al salvataggio**: Cambia a `saved`
3. **All'invio**: Cambia a `sent`

**Esempio Controller Store**:
```php
public function store(StoreSaleRequest $request)
{
    $sale = Sale::create([
        'status' => 'draft', // Default
        // ...altri campi
    ]);
    
    // Se l'utente clicca "Salva e Conferma"
    if ($request->input('confirm')) {
        $sale->update(['status' => 'saved']);
    }
    
    return redirect()->route('app.sales.show', $sale);
}
```

---

## 🎯 Quick Fix Command

Se vuoi cambiare tutte le vendite 'draft' a 'saved':

```bash
php artisan tinker

# Cambia TUTTE le bozze (⚠️ usa con cautela!)
App\Models\Sale\Sale::where('status', 'draft')->update(['status' => 'saved']);

# Oppure solo una specifica
$sale = App\Models\Sale\Sale::find(YOUR_ID);
$sale->update(['status' => 'saved']);
exit
```

---

## ✅ Checklist Finale

Prima di contattarmi di nuovo, verifica:

- [ ] Build frontend fatto (`npm run build`)
- [ ] Cache cleared (`php artisan cache:clear`)
- [ ] Hard refresh browser (`Cmd+Shift+R`)
- [ ] Controllato status vendita via route debug
- [ ] Status è `saved` o `sent` (non `draft`)
- [ ] Nessun errore in console browser
- [ ] File `app-*.js` ha timestamp recente

---

## 🆘 Se Niente Funziona

Mandami:
1. Screenshot della card
2. Output della route debug: `/sales/{id}/debug-status`
3. Console browser (F12 → Console tab)
4. Quale browser usi

---

**Aggiornato**: 11 Novembre 2025 - 03:30

