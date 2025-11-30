# Setup Fatturazione Elettronica - FS Gymme

## ✅ Implementazione Completata

Tutti i componenti della fatturazione elettronica sono stati implementati e sono pronti per l'uso!

### 📦 File Creati

#### Backend
- ✅ `app/Services/Sale/FatturaElettronicaApiService.php` - Service per API calls
- ✅ `app/Http/Controllers/Application/Sales/ElectronicInvoice/GenerateController.php`
- ✅ `app/Http/Controllers/Application/Sales/ElectronicInvoice/SendController.php`
- ✅ `app/Http/Controllers/Application/Sales/ElectronicInvoice/DownloadXmlController.php`
- ✅ `app/Http/Controllers/Webhooks/FatturaElettronicaApiWebhookController.php`
- ✅ `config/services.php` - Configurazione API aggiunta
- ✅ `routes/webhooks.php` - Route webhook
- ✅ `routes/tenant/web/routes.php` - Route fatturazione aggiunte

#### Frontend
- ✅ `resources/js/components/sales/ElectronicInvoiceCard.tsx` - Componente UI
- ✅ `resources/js/types/index.d.ts` - Types TypeScript aggiunti

#### Model
- ✅ `app/Models/Sale/ElectronicInvoice.php` - Campo `external_id` aggiunto a $fillable

#### Documentazione
- ✅ `docs/FE_INDEX.md` - Indice documentazione
- ✅ `docs/FE_MULTITENANT_FAQ.md` - FAQ complete
- ✅ `docs/FE_PROVIDER_COMPARISON.md` - Comparazione provider
- ✅ `docs/FE_API_INTEGRATION.md` - Guida integrazione
- ✅ `docs/ELECTRONIC_INVOICE_GUIDE.md` - Guida tecnica completa
- ✅ `docs/FE_XML_EXAMPLES.md` - Esempi XML
- ✅ `docs/FE_IMPLEMENTATION_CHECKLIST.md` - Checklist
- ✅ `docs/FE_ROADMAP.md` - Roadmap
- ✅ `docs/FE_SETUP.md` - Questo file

---

## 🚀 Setup Iniziale (5 minuti)

### 1. Registrazione Fattura Elettronica API

1. Vai su https://www.fattura-elettronica-api.it/
2. Crea account (30 giorni gratis)
3. Nella dashboard, copia:
   - **API Key**
   - **Webhook Secret**

### 2. Configurazione .env

Aggiungi al tuo file `.env`:

```env
# Fattura Elettronica API
FE_API_ENABLED=true
FE_API_KEY=your_api_key_here
FE_API_ENDPOINT=https://api.fattura-elettronica-api.it/v1
FE_API_WEBHOOK_SECRET=your_webhook_secret_here
FE_API_SANDBOX=true  # false in produzione
```

### 3. Configura Webhook URL

Nella dashboard di Fattura Elettronica API:

**Webhook URL**: 
```
https://tuodominio.it/webhooks/fattura-elettronica-api/notifications
```

**Esempio locale (ngrok)**:
```
https://abc123.ngrok.io/webhooks/fattura-elettronica-api/notifications
```

### 4. Verifica Database

Il campo `external_id` è già presente nella tabella `electronic_invoices`.
Se per qualche motivo non c'è, esegui:

```bash
php artisan tinker
Schema::table('electronic_invoices', function($table) {
    $table->string('external_id')->nullable()->after('transmission_id')->index();
});
```

---

## 🧪 Test in Sandbox

### 1. Completa una vendita

```
1. Crea una vendita in FS Gymme
2. Aggiungi prodotti
3. Seleziona cliente con dati fiscali completi
4. Completa la vendita
```

### 2. Genera Fattura Elettronica

```
1. Vai in dettaglio vendita
2. Vedi card "Fattura Elettronica"
3. Click "Genera Fattura Elettronica"
4. Attendi conferma (vedi Transmission ID)
```

### 3. Invia a SDI (Sandbox)

```
1. Nella stessa card, click "Invia a SDI"
2. Controlla logs: storage/logs/laravel.log
3. In sandbox, riceverai webhook simulato dopo pochi minuti
4. Status cambierà da "Inviata" a "Accettata"
```

### 4. Verifica Webhook

Nel file `storage/logs/laravel.log` dovresti vedere:

```
[INFO] Fattura Elettronica API Webhook received
[INFO] Invoice accepted by SDI
```

---

## 📋 Checklist Pre-Produzione

### Dati Obbligatori Structure

Verifica che ogni structure (palestra) abbia:

- [ ] `vat_number` o `tax_code`
- [ ] `company_name` o `name`
- [ ] `address`
- [ ] `postal_code`
- [ ] `city`
- [ ] `province` (se Italia)
- [ ] `fiscal_regime` (default: RF01)
- [ ] `pec_email` o `sdi_code`

**Query verifica**:
```sql
SELECT id, company_name, vat_number, tax_code, address, postal_code, city, province, pec_email
FROM structures
WHERE vat_number IS NULL OR address IS NULL OR postal_code IS NULL;
```

### Dati Obbligatori Customer

Ogni customer deve avere:

- [ ] `vat_number` (se azienda) o `tax_code` (CF)
- [ ] `company_name` (azienda) o `first_name` + `last_name` (privato)
- [ ] `address`
- [ ] `postal_code`
- [ ] `city`
- [ ] `country_code` (default: IT)

**Query verifica**:
```sql
SELECT id, first_name, last_name, company_name, tax_code, vat_number, address, postal_code, city
FROM customers
WHERE (vat_number IS NULL AND tax_code IS NULL)
   OR address IS NULL
   OR postal_code IS NULL;
```

### Settings Produzione

Prima di andare in produzione:

```env
FE_API_SANDBOX=false  # ⚠️ IMPORTANTE: disabilita sandbox
```

---

## 🎯 Come Usare

### Flow Completo

```
1. Operatore completa vendita in FS Gymme
2. Nella pagina dettaglio vendita, vede card "Fattura Elettronica"
3. Click "Genera Fattura Elettronica"
   → XML generato e salvato in storage/app/electronic_invoices/
4. Click "Invia a SDI"
   → Chiamata API a Fattura Elettronica API
   → Status: "Inviata a SDI"
5. Dopo qualche minuto, webhook ricevuto
   → Status automaticamente aggiornato a "Accettata" o "Scartata"
6. Se accettata: ✅ Fattura consegnata al cliente
7. Se scartata: ❌ Vedi errori nella card, correggi e rigenera
```

### Scaricare XML

```
1. Nella card Fattura Elettronica
2. Click "Scarica XML"
3. Browser scarica file: IT12345678901_00001_ABC12.xml
```

---

## 🔧 Troubleshooting

### Errore: "API Key non valida"

**Causa**: API Key errata o scaduta

**Soluzione**:
1. Verifica `.env`: `FE_API_KEY=...`
2. Controlla dashboard Fattura Elettronica API
3. Rigenera API Key se necessario

### Errore: "Webhook signature invalid"

**Causa**: Webhook secret errato

**Soluzione**:
1. Verifica `.env`: `FE_API_WEBHOOK_SECRET=...`
2. Copia il secret corretto dalla dashboard

### Errore: "P.IVA o CF mancante"

**Causa**: Dati structure o customer incompleti

**Soluzione**:
1. Vai in anagrafica structure/customer
2. Compila tutti i campi obbligatori
3. Salva
4. Rigenera fattura

### Webhook non arrivano

**Causa**: URL webhook non raggiungibile

**Soluzione**:
1. Verifica URL pubblico (non localhost)
2. Usa ngrok per sviluppo locale:
   ```bash
   ngrok http 8000
   ```
3. Configura URL ngrok nella dashboard API

### Status rimane "Inviata"

**Causa**: Webhook non ricevuto o errore processing

**Soluzione**:
1. Controlla logs: `tail -f storage/logs/laravel.log`
2. Testa webhook manualmente dalla dashboard API
3. Verifica signature secret

---

## 📊 Monitoring

### Log Files

Tutti gli eventi sono loggati in `storage/logs/laravel.log`:

```bash
# Vedi ultimi 50 log
tail -50 storage/logs/laravel.log

# Filtra solo Fattura Elettronica
tail -f storage/logs/laravel.log | grep "Electronic invoice"

# Filtra webhook
tail -f storage/logs/laravel.log | grep "Webhook"
```

### Eventi Loggati

- ✅ `Electronic invoice sent successfully` - Invio riuscito
- ❌ `Failed to send electronic invoice` - Invio fallito
- 📥 `Fattura Elettronica API Webhook received` - Webhook ricevuto
- ✅ `Invoice accepted by SDI` - Fattura accettata
- ❌ `Invoice rejected by SDI` - Fattura scartata

---

## 💰 Costi

### Piano Consigliato

**STARTER** - €29/mese
- 50 fatture/mese (condivise tra TUTTI i tenant)
- Tutte le funzionalità incluse
- Webhook automatici
- Conservazione sostitutiva

**Upgrade quando necessario**:
- 50-200 fatture: PROFESSIONAL €79/mese
- 200-500 fatture: BUSINESS €149/mese

### Monitoraggio Utilizzo

Dashboard Fattura Elettronica API mostra:
- Fatture inviate questo mese
- Fatture rimanenti nel piano
- Alert quando arrivi a 80% del limite

---

## 🎓 Risorse

### Documentazione

- `docs/FE_INDEX.md` - Inizia da qui
- `docs/FE_MULTITENANT_FAQ.md` - FAQ architettura
- `docs/ELECTRONIC_INVOICE_GUIDE.md` - Guida tecnica completa

### Link Utili

- Dashboard API: https://app.fattura-elettronica-api.it/
- Documentazione API: https://docs.fattura-elettronica-api.it/
- Agenzia Entrate: https://www.agenziaentrate.gov.it/portale/fattura-elettronica
- Validatore XML: https://sdi.fatturapa.gov.it/

---

## ✅ Checklist Go-Live

Prima di lanciare in produzione:

- [ ] Account Fattura Elettronica API attivato
- [ ] API Key configurata in `.env`
- [ ] Webhook URL configurato nella dashboard
- [ ] `FE_API_SANDBOX=false` in produzione
- [ ] Tutti i structures hanno dati fiscali completi
- [ ] Test completo fatto in sandbox
- [ ] Webhook ricevuti e processati correttamente
- [ ] Log monitoring configurato
- [ ] Alert email per errori configurati (TODO)

---

## 🆘 Supporto

**Problemi tecnici**: Consulta `docs/FE_MULTITENANT_FAQ.md`

**Errori SDI**: Forum Agenzia Entrate

**Problemi API**: Ticket support Fattura Elettronica API

**Bug applicazione**: Check `storage/logs/laravel.log`

---

**Ultimo aggiornamento**: 11 Novembre 2025  
**Status**: ✅ Implementazione Completa  
**Ready for production**: ✅ SÌ (dopo test sandbox)

