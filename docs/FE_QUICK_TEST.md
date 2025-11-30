# ⚡ Quick Reference - Test Fatturazione Elettronica

## 🔥 Setup Veloce (5 minuti)

### 1. Registrati e Configura
```bash
# 1. Vai su: https://www.fattura-elettronica-api.it/
# 2. Registrati e ottieni API Key + Webhook Secret
# 3. Aggiorna .env:

FE_API_ENABLED=true
FE_API_KEY=fe_test_xxxxxxxxxxxxxxxxxxxxxxxx
FE_API_WEBHOOK_SECRET=your_secret_here
FE_API_SANDBOX=true

# 4. Clear cache
php artisan config:clear && php artisan cache:clear
```

### 2. Popola Dati (2 minuti)
```bash
php artisan tinker

# Tenant
$t = App\Models\Tenant::first();
$t->update(['vat_number'=>'01234567890','address'=>'Via Test 1','city'=>'Milano','postal_code'=>'20100','pec_email'=>'test@pec.test']);

# Customer
$c = App\Models\Customer\Customer::create(['first_name'=>'Mario','last_name'=>'Rossi','tax_code'=>'RSSMRA80A01H501U','email'=>'test@test.it','street'=>'Via Roma','zip'=>'20100','city'=>'Milano','structure_id'=>1]);

exit
```

### 3. Build Frontend
```bash
npm run build
# Oppure: npm run dev
```

---

## 🧪 Test Flow Completo (10 minuti)

### Step 1: Crea Vendita
```bash
php artisan tinker

$sale = App\Models\Sale\Sale::create([
    'customer_id' => 1,
    'structure_id' => 1,
    'date' => now(),
    'year' => 2025,
    'progressive_number' => 'FT2025/TEST001',
    'status' => 'saved',  # ⚠️ Importante!
    'payment_status' => 'paid',
    'payment_condition_id' => 1,
    'financial_resource_id' => 1,
    'currency' => 'EUR',
]);

$sale->rows()->create([
    'description' => 'Test prodotto',
    'quantity' => 1,
    'unit_price' => 50.00,
    'vat_rate_id' => 1,
]);

echo "✅ Vendita ID: " . $sale->id;
exit
```

### Step 2: Genera XML
1. Hard refresh: `Cmd+Shift+R`
2. Vai su: `/app/{tenant}/sales/{sale_id}`
3. Click **"Genera Fattura Elettronica"**
4. ✅ Badge diventa "Generata"

### Step 3: Verifica XML
1. Click **"Scarica XML"**
2. Verifica importi corretti (no 0.50 invece di 50.00)

### Step 4: Invia a SDI
1. Click **"Invia a SDI"**
2. ✅ Badge diventa "Inviata"

### Step 5: Attendi Webhook (2-5 min)
```bash
# Monitor logs
tail -f storage/logs/laravel.log | grep "Webhook"
```

3. Refresh pagina → Badge "Accettata" ✅

---

## 🐛 Debug Veloce

### Verifica Config
```bash
php artisan tinker
echo config('services.fattura_elettronica_api.enabled') ? 'ON' : 'OFF';
echo "\nAPI Key: " . substr(config('services.fattura_elettronica_api.api_key'), 0, 10) . '...';
exit
```

### Verifica Dati Tenant
```bash
php artisan tinker
$t = App\Models\Tenant::first();
dd(['vat'=>$t->vat_number,'pec'=>$t->pec_email,'address'=>$t->address]);
```

### Verifica Status Vendita
```bash
# Browser: /app/{tenant}/sales/{id}/debug-status
# Deve mostrare: "can_generate": true
```

### Logs Real-Time
```bash
# Tutti i log FE
tail -f storage/logs/laravel.log | grep "Electronic\|Webhook"

# Solo errori
tail -f storage/logs/laravel.log | grep "ERROR"
```

---

## 🔧 Fix Comuni

### Errore: "P.IVA tenant mancante"
```bash
php artisan tinker
App\Models\Tenant::first()->update(['vat_number'=>'01234567890']);
exit
```

### Errore: "CF customer mancante"
```bash
php artisan tinker
App\Models\Customer\Customer::find(1)->update(['tax_code'=>'RSSMRA80A01H501U']);
exit
```

### Errore: "Vendita deve essere salvata"
```bash
php artisan tinker
App\Models\Sale\Sale::find(1)->update(['status'=>'saved']);
exit
```

### Webhook non arrivano (sviluppo locale)
```bash
# Installa ngrok
brew install ngrok

# Avvia tunnel
ngrok http 8000

# Usa URL in dashboard API:
# https://abc123.ngrok.io/webhooks/fattura-elettronica-api/notifications
```

---

## 📱 Ngrok Setup (Sviluppo Locale)

```bash
# Terminal 1: Laravel
php artisan serve

# Terminal 2: Ngrok
ngrok http 8000

# Output:
# Forwarding: https://abc123.ngrok.io -> http://localhost:8000

# Copia URL e vai su:
# https://app.fattura-elettronica-api.it/settings/webhooks
# Webhook URL: https://abc123.ngrok.io/webhooks/fattura-elettronica-api/notifications
```

---

## ✅ Checklist Go-Live

### Pre-Flight
- [ ] `FE_API_ENABLED=true`
- [ ] API Key configurata
- [ ] Webhook Secret configurato
- [ ] Tenant con P.IVA
- [ ] Customer di test pronto
- [ ] Frontend buildato

### Test Sandbox
- [ ] XML generato ✅
- [ ] Importi corretti (50.00 non 0.50) ✅
- [ ] Invio API success ✅
- [ ] Webhook ricevuto ✅
- [ ] Status ACCEPTED ✅

### Produzione
- [ ] `FE_API_SANDBOX=false`
- [ ] API Key live (`fe_live_...`)
- [ ] Test 1-2 fatture reali
- [ ] Monitor 24-48h

---

## 📞 Help

**Problemi?**
1. Leggi: `docs/FE_TEST_GUIDE.md` (guida completa)
2. Leggi: `docs/FE_SETUP.md` (troubleshooting)
3. Logs: `tail -f storage/logs/laravel.log`
4. Support API: support@fattura-elettronica-api.it

**Tutto OK?**
→ Vai in produzione! 🚀

