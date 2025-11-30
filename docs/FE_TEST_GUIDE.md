# 🧪 Guida Test Fattura Elettronica API - Seguendo Documentazione Ufficiale

**Riferimento**: https://www.fattura-elettronica-api.it/documentazione2.0/

---

## ✅ VERIFICA CONFIGURAZIONE ATTUALE

### Config Files ✅
- [x] `config/services.php` - Configurazione presente e corretta
- [x] `.env` - Variabili presenti (FE_API_*)
- [x] Service implementato - `FatturaElettronicaApiService`
- [x] Webhook implementato - `FatturaElettronicaApiWebhookController`

### Stato Attuale `.env`
```env
FE_API_ENABLED=false       # ⚠️ Cambieremo a true per test
FE_API_KEY=                # ⚠️ Da compilare dopo registrazione
FE_API_ENDPOINT=https://api.fattura-elettronica-api.it/v1  # ✅ Corretto
FE_API_WEBHOOK_SECRET=     # ⚠️ Da compilare dopo registrazione
FE_API_SANDBOX=true        # ✅ Corretto per test
```

---

## 📋 STEP 1: Registrazione e Setup API (5 minuti)

### 1.1 Registrazione Account

1. Vai su: https://www.fattura-elettronica-api.it/
2. Click "Registrati" o "Prova Gratis"
3. Compila form registrazione:
   - Email
   - Password
   - Ragione Sociale (del tuo tenant)
   - P.IVA
4. Conferma email
5. Login su: https://app.fattura-elettronica-api.it/

### 1.2 Recupera Credenziali API

Una volta loggato nella dashboard:

1. **API Key**:
   - Vai su "Impostazioni" → "API"
   - Copia la tua API Key
   - Formato: `fe_live_xxxxxxxxxxxxxxxxxxxxxxxx` (o `fe_test_` per sandbox)

2. **Webhook Secret**:
   - Vai su "Impostazioni" → "Webhook"
   - Copia il Webhook Secret
   - Formato: stringa alfanumerica ~32 caratteri

3. **Configura Webhook URL**:
   - Nella stessa pagina "Webhook"
   - URL: `https://tuodominio.it/webhooks/fattura-elettronica-api/notifications`
   - Per sviluppo locale usa **ngrok**:
     ```bash
     # In un terminale
     ngrok http 8000
     # Usa URL tipo: https://abc123.ngrok.io/webhooks/fattura-elettronica-api/notifications
     ```
   - Eventi da abilitare:
     - ✅ `invoice.accepted` (Fattura accettata)
     - ✅ `invoice.rejected` (Fattura scartata)
     - ✅ `invoice.delivered` (Fattura consegnata)
     - ✅ `invoice.expired` (Decorrenza termini)

### 1.3 Aggiorna `.env`

```env
# Fattura Elettronica API
FE_API_ENABLED=true                                          # ✅ Abilita
FE_API_KEY=fe_test_xxxxxxxxxxxxxxxxxxxxxxxx                  # ⚠️ Tua API Key
FE_API_ENDPOINT=https://api.fattura-elettronica-api.it/v1   # ✅ OK
FE_API_WEBHOOK_SECRET=your_webhook_secret_here               # ⚠️ Tuo Secret
FE_API_SANDBOX=true                                          # ✅ Sandbox per test
```

### 1.4 Clear Cache

```bash
cd /Users/davidedonghi/Apps/fs-gymme
php artisan config:clear
php artisan cache:clear
```

---

## 📋 STEP 2: Popola Dati Master (2 minuti)

### 2.1 Dati Fiscali Tenant

```bash
php artisan tinker

# Trova il tuo tenant (cambia l'ID se necessario)
$tenant = App\Models\Tenant::first();

# Popola dati fiscali (⚠️ USA DATI REALI O DI TEST VALIDI)
$tenant->update([
    'vat_number' => '01234567890',              # P.IVA test (11 cifre)
    'tax_code' => '01234567890',                # CF (uguale o diverso)
    'address' => 'Via Test 1',
    'city' => 'Milano',
    'postal_code' => '20100',
    'province' => 'MI',
    'country' => 'IT',
    'pec_email' => 'test@pec.test',             # PEC test
    'sdi_code' => null,                         # Oppure codice SDI 7 cifre
    'fiscal_regime' => 'RF01',                  # Regime ordinario
]);

echo "✅ Tenant configurato!\n";
echo "P.IVA: " . $tenant->vat_number . "\n";
exit
```

### 2.2 Verifica/Crea Customer Test

```bash
php artisan tinker

# Crea customer privato di test
$customer = App\Models\Customer\Customer::create([
    'first_name' => 'Mario',
    'last_name' => 'Rossi',
    'tax_code' => 'RSSMRA80A01H501U',           # CF test valido
    'email' => 'mario.rossi@test.it',
    'street' => 'Via Roma',
    'number' => '10',
    'city' => 'Milano',
    'zip' => '20100',
    'province' => 'MI',
    'country' => 'IT',
    'structure_id' => 1,                         # Cambia se necessario
]);

echo "✅ Customer creato! ID: " . $customer->id . "\n";
exit
```

**O per azienda**:
```bash
php artisan tinker

$customerAzienda = App\Models\Customer\Customer::create([
    'company_name' => 'Acme SRL',
    'vat_number' => '09876543210',              # P.IVA test
    'tax_code' => '09876543210',
    'email' => 'info@acme.test',
    'street' => 'Via Verdi',
    'number' => '20',
    'city' => 'Roma',
    'zip' => '00100',
    'province' => 'RM',
    'country' => 'IT',
    'structure_id' => 1,
]);

echo "✅ Customer azienda creato! ID: " . $customerAzienda->id . "\n";
exit
```

---

## 📋 STEP 3: Test Ambiente Sandbox (15 minuti)

### 3.1 Preparazione Frontend

```bash
# Build frontend per applicare tutte le modifiche
npm run build

# Oppure in sviluppo
npm run dev
```

### 3.2 Crea Vendita di Test

**Via UI** (consigliato):
1. Vai su: http://localhost:8000/app/{tenant_id}/sales/create
2. Compila form:
   - Customer: Seleziona customer creato
   - Data vendita: Oggi
   - Structure: Seleziona una palestra
   - Aggiungi almeno 1 riga prodotto:
     - Descrizione: "Abbonamento mensile"
     - Quantità: 1
     - Prezzo: €50.00
     - IVA: 22%
3. **Salva** (status deve essere `saved`, non `draft`)

**Via Tinker** (alternativo):
```bash
php artisan tinker

$sale = App\Models\Sale\Sale::create([
    'customer_id' => 1,                          # ID customer creato prima
    'structure_id' => 1,
    'date' => now(),
    'year' => 2025,
    'progressive_number' => 'FT2025/TEST001',
    'status' => 'saved',                         # ⚠️ Importante: saved!
    'payment_status' => 'paid',
    'payment_condition_id' => 1,
    'financial_resource_id' => 1,
    'currency' => 'EUR',
]);

# Aggiungi riga vendita
$row = $sale->rows()->create([
    'description' => 'Abbonamento mensile test',
    'quantity' => 1,
    'unit_price' => 50.00,                       # Verrà salvato come 5000 centesimi
    'vat_rate_id' => 1,                          # IVA 22% (verifica ID corretto)
]);

echo "✅ Vendita creata! ID: " . $sale->id . "\n";
exit
```

### 3.3 Test Generazione XML

1. Hard refresh browser: `Cmd+Shift+R` (Mac) o `Ctrl+Shift+R` (Windows)
2. Vai su dettaglio vendita: `/app/{tenant}/sales/{sale_id}`
3. Scroll fino a **"Fattura Elettronica"** card
4. Dovresti vedere:
   ```
   ℹ️ La vendita è pronta. Puoi generare la fattura elettronica...
   [📄 Genera Fattura Elettronica]
   ```
5. **Click "Genera Fattura Elettronica"**
6. ✅ Success! Dovresti vedere:
   - Badge "🟦 Generata"
   - Transmission ID: IT01234_20251111_ABC12
   - Bottone "📥 Scarica XML"
   - Bottone "📤 Invia a SDI"

### 3.4 Verifica XML Generato

1. Click "📥 Scarica XML"
2. Apri il file XML
3. Verifica:
   - ✅ `<IdCodice>01234567890</IdCodice>` (P.IVA tenant)
   - ✅ `<PrezzoUnitario>50.00</PrezzoUnitario>` (importo corretto)
   - ✅ `<ImportoTotaleDocumento>61.00</ImportoTotaleDocumento>` (50 + 22% IVA)
   - ✅ `<RiferimentoAmministrazione>Sede: ...</RiferimentoAmministrazione>` (se structure)
   - ✅ `<CodiceFiscale>RSSMRA80A01H501U</CodiceFiscale>` (CF customer)

**Esempio XML atteso**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<p:FatturaElettronica versione="1.9" xmlns:p="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.9">
  <FatturaElettronicaHeader>
    <DatiTrasmissione>
      <IdTrasmittente>
        <IdPaese>IT</IdPaese>
        <IdCodice>01234567890</IdCodice>
      </IdTrasmittente>
      <ProgressivoInvio>IT012_20251111_ABC12</ProgressivoInvio>
      <FormatoTrasmissione>FPR12</FormatoTrasmissione>
      <CodiceDestinatario>0000000</CodiceDestinatario>
      <PECDestinatario>test@pec.test</PECDestinatario>
    </DatiTrasmissione>
    <CedentePrestatore>
      <DatiAnagrafici>
        <IdFiscaleIVA>
          <IdPaese>IT</IdPaese>
          <IdCodice>01234567890</IdCodice>
        </IdFiscaleIVA>
        <Anagrafica>
          <Denominazione>Fitness Company SRL</Denominazione>
        </Anagrafica>
        <RegimeFiscale>RF01</RegimeFiscale>
      </DatiAnagrafici>
      <Sede>
        <Indirizzo>Via Test 1</Indirizzo>
        <CAP>20100</CAP>
        <Comune>Milano</Comune>
        <Provincia>MI</Provincia>
        <Nazione>IT</Nazione>
      </Sede>
    </CedentePrestatore>
    <CessionarioCommittente>
      <DatiAnagrafici>
        <CodiceFiscale>RSSMRA80A01H501U</CodiceFiscale>
        <Anagrafica>
          <Nome>Mario</Nome>
          <Cognome>Rossi</Cognome>
        </Anagrafica>
      </DatiAnagrafici>
      <Sede>
        <Indirizzo>Via Roma 10</Indirizzo>
        <CAP>20100</CAP>
        <Comune>Milano</Comune>
        <Nazione>IT</Nazione>
      </Sede>
    </CessionarioCommittente>
  </FatturaElettronicaHeader>
  <FatturaElettronicaBody>
    <DatiGenerali>
      <DatiGeneraliDocumento>
        <TipoDocumento>TD01</TipoDocumento>
        <Divisa>EUR</Divisa>
        <Data>2025-11-11</Data>
        <Numero>FT2025/TEST001</Numero>
        <ImportoTotaleDocumento>61.00</ImportoTotaleDocumento>
      </DatiGeneraliDocumento>
    </DatiGenerali>
    <DatiBeniServizi>
      <DettaglioLinee>
        <NumeroLinea>1</NumeroLinea>
        <Descrizione>Abbonamento mensile test</Descrizione>
        <Quantita>1.00</Quantita>
        <UnitaMisura>PZ</UnitaMisura>
        <PrezzoUnitario>50.00</PrezzoUnitario>
        <PrezzoTotale>50.00</PrezzoTotale>
        <AliquotaIVA>22.00</AliquotaIVA>
      </DettaglioLinee>
      <DatiRiepilogo>
        <AliquotaIVA>22.00</AliquotaIVA>
        <ImponibileImporto>50.00</ImponibileImporto>
        <Imposta>11.00</Imposta>
      </DatiRiepilogo>
    </DatiBeniServizi>
  </FatturaElettronicaBody>
</p:FatturaElettronica>
```

---

## 📋 STEP 4: Test Invio a SDI (Sandbox)

### 4.1 Invio Fattura

1. Nella card "Fattura Elettronica"
2. Click **"📤 Invia a SDI"**
3. Conferma l'azione
4. ✅ Success! Badge diventa "🟡 Inviata"

### 4.2 Cosa Succede Backend

**Secondo la documentazione API**:

```
POST https://api.fattura-elettronica-api.it/v1/invoices
Headers:
  Authorization: Bearer fe_test_xxxxx
  Content-Type: application/json

Body:
{
  "xml": "<base64_encoded_xml>",
  "metadata": {
    "tenant_id": "uuid-tenant",
    "sale_id": 123,
    "progressive_number": "FT2025/TEST001"
  }
}

Response 200:
{
  "id": "inv_xxxxxxxxxxxxx",
  "transmission_id": "IT012_20251111_ABC12",
  "status": "sent",
  "created_at": "2025-11-11T12:00:00Z"
}
```

### 4.3 Verifica Dashboard API

1. Login su: https://app.fattura-elettronica-api.it/
2. Vai su "Fatture" → "Elenco"
3. Dovresti vedere la fattura inviata:
   - Numero: FT2025/TEST001
   - Status: "In attesa risposta SDI"
   - Transmission ID: IT012_xxx

### 4.4 Logs Laravel

```bash
# In un altro terminale
tail -f storage/logs/laravel.log | grep "Electronic"

# Output atteso:
# [2025-11-11 12:00:00] local.INFO: Generating XML for sale 123
# [2025-11-11 12:00:01] local.INFO: XML generated successfully
# [2025-11-11 12:00:05] local.INFO: Sending invoice to API...
# [2025-11-11 12:00:06] local.INFO: Invoice sent! External ID: inv_xxxxx
```

---

## 📋 STEP 5: Test Webhook Notifiche (2-5 minuti)

### 5.1 Attesa Webhook

In ambiente **SANDBOX**, il SDI risponde velocemente:
- ⏱️ 2-5 minuti per notifica `invoice.accepted`
- In produzione: 24-48h

### 5.2 Verifica Webhook Ricevuto

**Logs Laravel**:
```bash
tail -f storage/logs/laravel.log | grep "Webhook"

# Output atteso:
# [2025-11-11 12:03:00] local.INFO: Webhook received from Fattura Elettronica API
# [2025-11-11 12:03:00] local.INFO: Event: invoice.accepted
# [2025-11-11 12:03:00] local.INFO: Invoice inv_xxxxx marked as ACCEPTED
```

**Ngrok Logs** (se usi ngrok):
```bash
# Nel terminale ngrok vedrai:
POST /webhooks/fattura-elettronica-api/notifications 200 OK
```

### 5.3 Frontend Aggiornamento

1. Refresh pagina vendita
2. Badge dovrebbe essere: **"🟩 Accettata"**
3. Dovresti vedere:
   ```
   ✅ Fattura accettata dal Sistema di Interscambio e consegnata al cliente.
   ```
4. Nuovo bottone: **"🔴 Genera Nota di Credito"**

---

## 📋 STEP 6: Test Nota di Credito (Opzionale)

### 6.1 Genera Nota di Credito

1. Nella vendita con fattura **ACCEPTED**
2. Click **"🔴 Genera Nota di Credito (TD04)"**
3. Conferma azione
4. Viene creata una nuova vendita con:
   - Type: `credit_note`
   - Original_sale_id: ID vendita originale
   - Total_price: Negativo

### 6.2 Verifica XML Nota di Credito

Scarica XML e verifica:
```xml
<TipoDocumento>TD04</TipoDocumento> <!-- ✅ TD04 invece di TD01 -->
<Numero>NC2025/001</Numero>
<ImportoTotaleDocumento>-61.00</ImportoTotaleDocumento> <!-- ✅ Negativo -->
```

---

## 🧪 Test Casi Limite

### Test 1: Fattura con Ritenuta d'Acconto (TD06)

```bash
php artisan tinker

$saleRitenuta = App\Models\Sale\Sale::create([
    'customer_id' => 1,
    'structure_id' => 1,
    'date' => now(),
    'progressive_number' => 'PAR2025/001',
    'status' => 'saved',
    'withholding_tax_amount' => 40.00,           # €40 ritenuta
    'withholding_tax_rate' => 20.00,             # 20%
    'withholding_tax_type' => 'RT01',
    // ...altri campi
]);

exit
```

Genera fattura → XML dovrebbe avere:
```xml
<TipoDocumento>TD06</TipoDocumento>
<DatiRitenuta>
  <TipoRitenuta>RT01</TipoRitenuta>
  <ImportoRitenuta>40.00</ImportoRitenuta>
  <AliquotaRitenuta>20.00</AliquotaRitenuta>
</DatiRitenuta>
```

### Test 2: Errore Dati Mancanti

1. Crea vendita senza customer
2. Prova a generare fattura
3. ✅ Dovrebbe dare errore: "Cliente mancante"

### Test 3: Vendita in Draft

1. Crea vendita con status `draft`
2. Prova a generare fattura
3. ✅ Dovrebbe dare errore: "La vendita deve essere salvata..."

---

## 📊 Dashboard API - Monitoring

### Verifica Utilizzo

Login su https://app.fattura-elettronica-api.it/

**Dashboard mostra**:
- Fatture inviate questo mese
- Fatture rimanenti (limite piano)
- Status fatture (Accepted/Rejected/Pending)
- Logs eventi webhook

### API Endpoints Disponibili

Secondo documentazione ufficiale:

```bash
# List invoices
curl -X GET "https://api.fattura-elettronica-api.it/v1/invoices" \
  -H "Authorization: Bearer fe_test_xxxxx"

# Get single invoice
curl -X GET "https://api.fattura-elettronica-api.it/v1/invoices/inv_xxxxx" \
  -H "Authorization: Bearer fe_test_xxxxx"

# Download receipt (ricevuta SDI)
curl -X GET "https://api.fattura-elettronica-api.it/v1/invoices/inv_xxxxx/receipt" \
  -H "Authorization: Bearer fe_test_xxxxx"
```

---

## 🚨 Troubleshooting

### Errore: "Unauthorized" (401)

**Causa**: API Key errata o non configurata  
**Fix**:
```bash
# Verifica .env
cat .env | grep FE_API_KEY

# Clear config
php artisan config:clear
```

### Errore: "Webhook signature invalid"

**Causa**: Webhook secret errato  
**Fix**:
1. Verifica secret nella dashboard API
2. Aggiorna `.env`
3. `php artisan config:clear`

### Errore: "P.IVA tenant mancante"

**Causa**: Tenant non ha vat_number  
**Fix**:
```bash
php artisan tinker
$tenant = App\Models\Tenant::first();
$tenant->update(['vat_number' => '01234567890']);
exit
```

### Webhook non ricevuti

**Causa**: URL non raggiungibile  
**Fix per sviluppo locale**:
```bash
# Installa ngrok
brew install ngrok  # Mac
# o scarica da https://ngrok.com/

# Avvia tunnel
ngrok http 8000

# Usa URL tipo: https://abc123.ngrok.io/webhooks/...
# nella dashboard API
```

### Importi errati nell'XML

**Verifica**: Controlla che MoneyCast funzioni  
```bash
php artisan tinker
$row = App\Models\Sale\SaleRow::first();
dd([
    'raw' => $row->getRawOriginal('unit_price'),  # 5000
    'cast' => $row->unit_price,                   # 50.00
]);
```

---

## ✅ Checklist Test Completo

### Setup
- [ ] Account registrato su fattura-elettronica-api.it
- [ ] API Key copiata e in `.env`
- [ ] Webhook Secret copiato e in `.env`
- [ ] Webhook URL configurato (ngrok per locale)
- [ ] `FE_API_ENABLED=true`
- [ ] Config cache cleared

### Dati Master
- [ ] Tenant con P.IVA completa
- [ ] Customer con dati fiscali (CF o P.IVA)
- [ ] Structure configurata

### Test Generazione
- [ ] Vendita creata (status: saved)
- [ ] XML generato senza errori
- [ ] XML scaricato e verificato
- [ ] Importi corretti (no 100x più piccoli)
- [ ] Dati tenant corretti nell'XML
- [ ] Dati customer corretti nell'XML

### Test Invio
- [ ] Fattura inviata a SDI
- [ ] Response API 200 OK
- [ ] External ID salvato nel DB
- [ ] Status aggiornato a SENT
- [ ] Visibile nella dashboard API

### Test Webhook
- [ ] Webhook ricevuto (2-5 min)
- [ ] Signature validata
- [ ] Status aggiornato a ACCEPTED
- [ ] Badge frontend aggiornato
- [ ] Logs corretti

### Test Casi Limite
- [ ] Nota di Credito (TD04)
- [ ] Ritenuta d'Acconto (TD06)
- [ ] Errore dati mancanti
- [ ] Errore vendita draft

---

## 🎉 Test Superati → Go to Production!

### Switch da Sandbox a Produzione

1. **Dashboard API**:
   - Switch da "Test Mode" a "Live Mode"
   - Copia nuova API Key (inizia con `fe_live_`)

2. **`.env`**:
   ```env
   FE_API_ENABLED=true
   FE_API_KEY=fe_live_xxxxxxxxxxxxxxxxxxxxxxxx  # ⚠️ Live key!
   FE_API_SANDBOX=false                          # ⚠️ Produzione!
   ```

3. **Clear cache**:
   ```bash
   php artisan config:clear
   ```

4. **Test 1-2 fatture reali**

5. **Monitor 24-48h** per prime risposte SDI reali

---

## 📚 Riferimenti Utili

- **Documentazione ufficiale**: https://www.fattura-elettronica-api.it/documentazione2.0/
- **Dashboard**: https://app.fattura-elettronica-api.it/
- **Support**: support@fattura-elettronica-api.it
- **Status page**: https://status.fattura-elettronica-api.it/

- **Docs interne**:
  - `FE_IMPLEMENTATION_CHECKLIST.md` - Checklist completa
  - `FE_SETUP.md` - Setup e troubleshooting
  - `FE_API_INTEGRATION.md` - Integrazione API dettagliata

---

**🎉 BUONI TEST! SISTEMA PRONTO!** 🚀

