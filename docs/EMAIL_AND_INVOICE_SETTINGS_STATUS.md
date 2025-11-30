# 📧 Email & Invoice Settings - Stato Attuale

**Data**: 19 Novembre 2025
**Stato**: Controllers e UI pronti - Manca integrazione nel codice

## ✅ Cosa Abbiamo

### 1. Email Settings - Backend & Frontend ✅

**Controller**: `EmailSettingsController.php` - ✅ COMPLETO
- ✅ Metodo `show()` - carica settings e notifiche
- ✅ Metodo `update()` - salva email settings
- ✅ Metodo `updateNotifications()` - salva preferenze notifiche

**Settings Disponibili**:
```php
'email.sender'              // Email mittente
'email.sender_name'         // Nome mittente
'email.reply_to'            // Reply-to email
'email.signature'           // Firma email
'email.admin_recipients'    // Array email admin
```

**Notification Settings**:
```php
'notifications.invoice_accepted'                // FE accettata
'notifications.invoice_rejected'                // FE rifiutata
'notifications.customer_created'                // Nuovo cliente
'notifications.subscription_expiring'           // Abbonamento in scadenza
'notifications.subscription_expired'            // Abbonamento scaduto
'notifications.medical_cert_expiring'           // Certificato medico in scadenza
'notifications.sports_registration_expiring'    // Tesseramento in scadenza
```

**Frontend**: `email-settings.tsx` - ✅ COMPLETO
- ✅ Tab 1: Configurazione Email (sender, reply-to, signature, admin recipients)
- ✅ Tab 2: Preferenze Notifiche (7 toggle per notifiche)
- ✅ Anteprima email
- ✅ Validazione form
- ✅ Save funzionante

### 2. Invoice Settings - Backend & Frontend ✅

**Controller**: `InvoiceConfigurationController.php` - ✅ COMPLETO
- ✅ Metodo `show()` - carica tutti i settings
- ✅ Metodo `update()` - salva tutti i settings

**Settings Disponibili**:
```php
// Progressive Numbering
'invoice.progressive_format'        // "FT-{year}-{number}"
'invoice.progressive_start'         // 1
'invoice.progressive_prefix'        // "FT-"
'invoice.progressive_reset_yearly'  // true
'invoice.progressive_padding'       // 4

// Defaults
'invoice.default_vat_rate_id'       // ID aliquota IVA default
'invoice.default_payment_terms_days' // 30
'invoice.default_payment_method_id' // ID metodo pagamento
'invoice.default_notes'             // Note predefinite

// PDF
'invoice.pdf_logo_path'             // Path logo
'invoice.pdf_footer'                // Footer PDF
'invoice.pdf_show_stamp'            // Mostra bollo
'invoice.pdf_legal_notes'           // Note legali

// Stamp Duty (già implementato)
'invoice.stamp_duty_charge_customer' // true/false
'invoice.stamp_duty_amount'          // 200 (cents)
'invoice.stamp_duty_threshold'       // 77.47
```

**Frontend**: `invoice-configuration.tsx` - ✅ COMPLETO
- ✅ Sezione numerazione progressiva con anteprima
- ✅ Sezione valori predefiniti
- ✅ Sezione impostazioni PDF
- ✅ Sezione imposta di bollo
- ✅ Validazione form
- ✅ Save funzionante

## ❌ Cosa Manca - APPLICAZIONE NEL CODICE

### 1. Email Settings - NON APPLICATI ❌

**Problema**: I Mailable esistenti NON usano i settings configurati

**File da verificare**:
- `app/Mail/ElectronicInvoiceAccepted.php` - ✅ Esiste
- `app/Mail/ElectronicInvoiceRejected.php` - ✅ Esiste
- `app/Mail/GdprComplianceAlert.php` - ✅ Esiste

**Cosa serve**:
1. ✅ Creare `app/Mail/TenantMailable.php` - Base class per tutte le mail
2. ❌ Aggiornare tutti i Mailable per estendere TenantMailable
3. ❌ Override metodi `from()`, `replyTo()` usando TenantSettings
4. ❌ Aggiungere firma automatica al body

**Esempio Implementazione**:
```php
// app/Mail/TenantMailable.php
abstract class TenantMailable extends Mailable
{
    public function __construct()
    {
        $this->from(
            TenantSetting::get('email.sender', config('mail.from.address')),
            TenantSetting::get('email.sender_name', config('mail.from.name'))
        );

        $replyTo = TenantSetting::get('email.reply_to');
        if ($replyTo) {
            $this->replyTo($replyTo);
        }
    }

    protected function addSignature(string $content): string
    {
        $signature = TenantSetting::get('email.signature', '');
        return $signature ? $content . "\n\n---\n" . $signature : $content;
    }
}
```

### 2. Notification Settings - NON APPLICATI ❌

**Problema**: Le notifiche vengono inviate senza controllare le preferenze

**File coinvolti**:
- `FatturaElettronicaApiWebhookController.php` - Webhook SDI
- Eventuali Listener/Event per notifiche

**Cosa serve**:
```php
// Prima di inviare una mail, controllare:
if (TenantSetting::get('notifications.invoice_accepted', true)) {
    Mail::to($admins)->send(new ElectronicInvoiceAccepted($invoice));
}
```

### 3. Invoice Settings - PARZIALMENTE APPLICATI ⚠️

**Usati correttamente** ✅:
- ✅ `stamp_duty.*` - Già usato in SaleService per calcolo bollo
- ✅ Numerazione progressiva - Usata in ProgressiveNumberService

**NON usati** ❌:
- ❌ `invoice.default_vat_rate_id` - Non applicato in creazione sale
- ❌ `invoice.default_payment_terms_days` - Non applicato
- ❌ `invoice.default_payment_method_id` - Non applicato
- ❌ `invoice.default_notes` - Non applicato
- ❌ `invoice.pdf_*` - Non usati nella generazione PDF

**Dove applicare**:
1. **SaleService::create()** - Applicare defaults quando si crea una vendita
2. **ElectronicInvoiceService::generatePdf()** - Usare PDF settings
3. **Sale create form** - Pre-popolare con defaults

## 📋 TODO - Piano di Implementazione

### Fase 1: Email Settings (2-3h)

1. ✅ **Creare TenantMailable base class** (30min)
   - Override `from()` e `replyTo()`
   - Metodo `addSignature()`

2. **Aggiornare Mailable esistenti** (1h)
   ```bash
   - ElectronicInvoiceAccepted extends TenantMailable
   - ElectronicInvoiceRejected extends TenantMailable
   - GdprComplianceAlert extends TenantMailable
   ```

3. **Implementare controllo notifiche** (1h)
   - Creare helper `shouldSendNotification($type)`
   - Aggiornare webhook FE per controllare prima di inviare
   - Aggiornare altri punti di invio email

4. **Testing** (30min)
   - Testare invio email con settings custom
   - Testare toggle notifiche

### Fase 2: Invoice Settings (2h)

1. **Applicare defaults in SaleService::create()** (1h)
   ```php
   $sale->vat_rate_id = TenantSetting::get('invoice.default_vat_rate_id');
   $sale->payment_terms_days = TenantSetting::get('invoice.default_payment_terms_days', 30);
   // etc...
   ```

2. **Applicare PDF settings** (1h)
   - Aggiornare vista PDF per usare `pdf_logo_path`
   - Usare `pdf_footer` e `pdf_legal_notes`
   - Rispettare `pdf_show_stamp`

3. **Testing** (30min)

### Fase 3: Documentazione & Testing (1h)

1. Documentare uso settings
2. Testing end-to-end
3. Creare esempi

## 🎯 Priorità

### ALTA (Fare Subito) 🔥
1. ✅ **TenantMailable** - Base per tutte le email
2. ✅ **Controllo notifiche** - Rispettare preferenze utente
3. ⚠️ **Invoice defaults** - Migliorare UX creazione vendite

### MEDIA (Prossimi giorni) ⚡
1. PDF settings applicati
2. Testing completo
3. Documentazione

## 📊 Riepilogo Stato

| Componente | Backend | Frontend | Applicato | Status |
|------------|---------|----------|-----------|--------|
| Email Settings | ✅ | ✅ | ❌ | 66% |
| Notification Preferences | ✅ | ✅ | ❌ | 66% |
| Invoice Numbering | ✅ | ✅ | ✅ | 100% |
| Invoice Defaults | ✅ | ✅ | ❌ | 66% |
| Invoice PDF Settings | ✅ | ✅ | ❌ | 66% |
| Stamp Duty | ✅ | ✅ | ✅ | 100% |

**Media Completamento**: 77% (UI/Settings) + 33% (Applicazione) = **55% TOTALE**

## 🚀 Prossimi Passi

1. Implementare Fase 1 (Email Settings)
2. Implementare Fase 2 (Invoice Defaults)
3. Testing completo
4. Deploy e monitoring

---

**Conclusione**: Abbiamo un'ottima base (UI e storage funzionano), ma dobbiamo collegare i settings al codice applicativo per renderli effettivamente funzionali.
