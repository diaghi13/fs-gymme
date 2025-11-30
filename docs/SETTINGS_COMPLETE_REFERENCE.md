# Settings - Riferimento Completo

**Ultimo aggiornamento**: 2025-01-20
**Status**: Production Ready

---

## 📋 Indice

1. [Impostazioni Regionali](#impostazioni-regionali)
2. [Impostazioni Email](#impostazioni-email)
3. [Notifiche](#notifiche)
4. [Impostazioni Cliente](#impostazioni-cliente)
5. [Impostazioni IVA](#impostazioni-iva)
6. [Metodi di Pagamento](#metodi-di-pagamento)
7. [Impostazioni Fatturazione](#impostazioni-fatturazione)
8. [GDPR Compliance](#gdpr-compliance)

---

## Impostazioni Regionali

**Menu**: Configurazioni → Localizzazione
**Controller**: `RegionalSettingsController`
**Frontend**: `regional-settings.tsx`

### Settings Disponibili

| Key | Type | Default | Descrizione |
|-----|------|---------|-------------|
| `regional.language` | string | `'it'` | Lingua interfaccia (it, en, es, fr, de) |
| `regional.timezone` | string | `'Europe/Rome'` | Fuso orario |
| `regional.date_format` | string | `'d/m/Y'` | Formato data (PHP format) |
| `regional.time_format` | string | `'H:i'` | Formato ora (H:i o h:i A) |
| `regional.currency` | string | `'EUR'` | Valuta predefinita |
| `regional.decimal_separator` | string | `','` | Separatore decimale |
| `regional.thousands_separator` | string | `'.'` | Separatore migliaia |

### Utilizzo

```php
// Backend
$language = TenantSetting::get('regional.language', 'it');
$dateFormat = TenantSetting::get('regional.date_format', 'd/m/Y');

// Frontend
import { useRegionalSettings, useDateFormat } from '@/hooks/useRegionalSettings';

const settings = useRegionalSettings();
const dateFormat = useDateFormat();
const formatted = format(new Date(), dateFormat);
```

---

## Impostazioni Email

**Menu**: Configurazioni → Email e Notifiche → Tab "Configurazione Email"
**Controller**: `EmailSettingsController`
**Frontend**: `email-settings.tsx`

### Settings Disponibili

| Key | Type | Default | Descrizione |
|-----|------|---------|-------------|
| `email.sender` | string | `tenant('email')` | Email mittente |
| `email.sender_name` | string | `tenant('name')` | Nome mittente |
| `email.reply_to` | string | `tenant('email')` | Email reply-to |
| `email.signature` | string | `''` | Firma email (opzionale) |
| `email.admin_recipients` | array | `[]` | Email admin per notifiche |

### Utilizzo

```php
// In Mailable classes
use App\Mail\TenantMailable;

class MyMail extends TenantMailable
{
    public function build()
    {
        return $this->view('emails.my-email')
                    ->withSignature(); // Aggiunge firma automaticamente
    }
}

// Get admin recipients
$admins = TenantSetting::get('email.admin_recipients', []);
```

---

## Notifiche

**Menu**: Configurazioni → Email e Notifiche → Tab "Preferenze Notifiche"
**Controller**: `EmailSettingsController::updateNotifications()`
**Frontend**: `email-settings.tsx`

### Settings Disponibili

| Key | Type | Default | Descrizione |
|-----|------|---------|-------------|
| `notifications.invoice_accepted` | boolean | `true` | Fattura accettata da SDI |
| `notifications.invoice_rejected` | boolean | `true` | Fattura rifiutata da SDI |
| `notifications.customer_created` | boolean | `false` | Nuovo cliente creato |
| `notifications.subscription_expiring` | boolean | `true` | Abbonamento in scadenza |
| `notifications.subscription_expired` | boolean | `true` | Abbonamento scaduto |
| `notifications.medical_cert_expiring` | boolean | `true` | Certificato medico in scadenza |
| `notifications.sports_registration_expiring` | boolean | `true` | Tesseramento sportivo in scadenza |

### Utilizzo

```php
// In Mailable classes
if ($this->shouldSendNotification('invoice_accepted')) {
    Mail::to($admins)->send(new InvoiceAccepted($invoice));
}

// Oppure usa TenantMailable che lo fa automaticamente
class InvoiceAccepted extends TenantMailable
{
    protected string $notificationKey = 'invoice_accepted';

    // Mail viene inviata solo se la notifica è attiva
}
```

---

## Impostazioni Cliente

**Menu**: Configurazioni → Email e Notifiche → Tab "Preferenze Notifiche"
**Controller**: `EmailSettingsController::updateNotifications()`
**Frontend**: `email-settings.tsx`

### Settings Disponibili

| Key | Type | Default | Range | Descrizione |
|-----|------|---------|-------|-------------|
| `customer.warning_threshold` | integer | `7` | 1-90 | Giorni preavviso scadenze |

### Utilizzo

```php
// In Customer model
public function getCustomerAlertsAttribute(): array
{
    $warningThreshold = TenantSetting::get('customer.warning_threshold', 7);

    $daysUntilExpiry = $now->diffInDays($effectiveEndDate, false);
    if ($daysUntilExpiry >= 0 && $daysUntilExpiry <= $warningThreshold) {
        $alerts[] = [
            'type' => 'subscription_expiring',
            'severity' => 'warning',
            'message' => "Abbonamento in scadenza tra {$daysUntilExpiry} giorni",
        ];
    }

    return $alerts;
}
```

**Impatto**: Determina quando mostrare badge/avvisi di scadenza nella customer card per:
- Abbonamenti
- Certificati medici
- Tesseramenti sportivi

**Posizionamento UI**: Tab "Preferenze Notifiche" → Sezione "Soglia Avvisi Scadenze" (Alert warning all'inizio della tab)

---

## Impostazioni IVA

**Menu**: Configurazioni → IVA e Tasse
**Controller**: `VatSettingsController`
**Frontend**: `vat-settings.tsx`

### Settings Disponibili

| Key | Type | Default | Descrizione |
|-----|------|---------|-------------|
| `vat.default_sales_rate_id` | integer\|null | `null` | ID aliquota IVA vendite |
| `vat.default_purchase_rate_id` | integer\|null | `null` | ID aliquota IVA acquisti |
| `vat.split_payment_enabled` | boolean | `false` | Split payment PA |
| `vat.reverse_charge_enabled` | boolean | `false` | Reverse charge |

### Gestione Dinamica

Le aliquote IVA, nature, tipi e gruppi sono gestiti dinamicamente tramite tabelle database:
- `vat_rates` - Aliquote IVA con flag `is_active`
- `vat_natures` - Nature IVA (N1-N7)
- `vat_types` - Tipi IVA
- `vat_groups` - Gruppi IVA

**UI Avanzata**: Permette di attivare/disattivare aliquote specifiche e creare aliquote custom.

---

## Metodi di Pagamento

**Menu**: Configurazioni → Metodi di Pagamento
**Controller**: `PaymentSettingsController`
**Frontend**: `payment-settings.tsx`

### Gestione Dinamica

**Tabelle**:
- `payment_methods` - 23 metodi FatturaPA (MP01-MP23)
- `payment_conditions` - 91 condizioni di pagamento

**Flags**:
- `is_active` - Attivo/disattivo per il tenant
- `is_system` - Metodo di sistema (non eliminabile)

### UI Features

- **Tab 1: Metodi di Pagamento** (23 metodi)
  - Toggle attivazione/disattivazione
  - Badge Sistema/Custom
  - Contatore condizioni associate
  - Filtro ricerca

- **Tab 2: Condizioni di Pagamento** (91 condizioni)
  - Toggle attivazione/disattivazione
  - Visualizza metodo associato
  - Numero rate e fine mese
  - Filtro ricerca

### Metodi FatturaPA Standard

| Codice | Descrizione |
|--------|-------------|
| MP01 | Contanti |
| MP02 | Assegno |
| MP03 | Assegno circolare |
| MP04 | Contanti presso Tesoreria |
| MP05 | Bonifico |
| MP08 | Carta di pagamento |
| MP12 | RIBA |
| MP13 | MAV |
| MP19 | SEPA Direct Debit |
| MP22 | Trattenuta su somme già riscosse |
| MP23 | PagoPA |
| ... | (23 totali) |

---

## Impostazioni Fatturazione

**Menu**: Configurazioni → Fatturazione
**Controller**: `InvoiceConfigurationController`
**Frontend**: `invoice-configuration.tsx` / `invoice-configuration-new.tsx`

### Settings Disponibili

| Key | Type | Default | Descrizione |
|-----|------|---------|-------------|
| `invoice.default_notes` | string | `''` | Note predefinite fattura |
| `invoice.stamp_duty.charge_customer` | boolean | `true` | Addebita bollo al cliente |
| `invoice.stamp_duty.amount` | integer | `200` | Importo bollo (centesimi) |
| `invoice.stamp_duty.threshold` | float | `77.47` | Soglia applicazione bollo (€) |
| `invoice.pdf_logo_path` | string\|null | `null` | Path logo PDF |
| `invoice.pdf_footer` | string | `''` | Footer PDF |
| `invoice.pdf_legal_notes` | string | `''` | Note legali PDF |
| `invoice.pdf_show_stamp` | boolean | `true` | Mostra bollo nel PDF |
| `invoice.pdf_template` | string | `'classic'` | Template PDF (classic/modern/minimal) |

### Template PDF Disponibili

1. **Classic** - Layout tradizionale a due colonne
2. **Modern** - Design moderno con colori accent
3. **Minimal** - Design minimalista bianco/nero

### Utilizzo

```php
// In SaleService
$defaultNotes = TenantSetting::get('invoice.default_notes', '');
if (empty($validated['notes'])) {
    $validated['notes'] = $defaultNotes;
}

// In DownloadPdfController
$template = TenantSetting::get('invoice.pdf_template', 'classic');
return view("pdf.electronic-invoice-{$template}", $data);
```

---

## GDPR Compliance

**Menu**: Configurazioni → GDPR Compliance
**Controller**: `GdprComplianceController`
**Frontend**: `gdpr-compliance.tsx`

### Features

- Dashboard con statistiche fatture da anonimizzare
- Preview fatture che verranno anonimizzate
- Report CSV esportabile
- Anonimizzazione dati sensibili clienti

### Criteri Anonimizzazione

Le fatture vengono anonimizzate dopo:
- 10 anni dalla data emissione (obbligo fiscale)
- Solo fatture già conservate sostitutivamente
- Mantiene dati fiscalmente rilevanti

---

## 🗂️ Struttura Settings Database

### Tabella: `tenant_settings`

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `id` | bigint | Primary key |
| `key` | string | Chiave univoca (es: 'regional.language') |
| `value` | json | Valore (supporta string, int, bool, array) |
| `group` | string | Gruppo logico |
| `description` | text | Descrizione |
| `created_at` | timestamp | - |
| `updated_at` | timestamp | - |

### Model: TenantSetting

```php
// Get
$value = TenantSetting::get('regional.language', 'it');

// Set
TenantSetting::set(
    key: 'regional.language',
    value: 'en',
    group: 'regional',
    description: 'Interface language'
);

// All in group
$regionalSettings = TenantSetting::group('regional');
```

---

## 🎯 Best Practices

### 1. Sempre Fornire Default
```php
// ✅ CORRETTO
$language = TenantSetting::get('regional.language', 'it');

// ❌ SBAGLIATO
$language = TenantSetting::get('regional.language'); // può ritornare null
```

### 2. Validazione Server-Side
```php
$validated = $request->validate([
    'warning_threshold' => 'required|integer|min:1|max:90',
]);
```

### 3. Documentare Nuovi Settings
Quando aggiungi un nuovo setting:
1. Aggiungi al seeder con valore default
2. Documenta tipo, range, descrizione
3. Aggiungi validazione
4. Aggiorna questa documentazione

### 4. Gruppi Logici
Usa gruppi coerenti:
- `regional` - Localizzazione
- `email` - Configurazione email
- `notifications` - Preferenze notifiche
- `customer` - Impostazioni cliente
- `vat` - Imposte IVA
- `invoice` - Fatturazione

---

## 📚 Riferimenti

### Seeders
- `TenantSettingsSeeder.php` - Tutti i settings predefiniti
- `CompletePaymentMethodsSeeder.php` - 23 metodi FatturaPA

### Controllers
- `RegionalSettingsController.php`
- `EmailSettingsController.php`
- `VatSettingsController.php`
- `PaymentSettingsController.php`
- `InvoiceConfigurationController.php`
- `GdprComplianceController.php`

### Frontend Pages
- `regional-settings.tsx`
- `email-settings.tsx`
- `vat-settings.tsx`
- `payment-settings.tsx`
- `invoice-configuration.tsx`
- `gdpr-compliance.tsx`

### Hooks
- `useRegionalSettings()` - Settings regionali
- `useDateFormat()` - Formato data per date-fns
- `useDateTimeFormat()` - Formato data+ora
- `useFormatCurrency()` - Formattazione valuta
- `useFormatNumber()` - Formattazione numeri

---

## 🚀 Status Implementazione

| Sezione | Backend | Frontend | Tests | Docs | Status |
|---------|---------|----------|-------|------|--------|
| Regional Settings | ✅ | ✅ | ✅ | ✅ | **DONE** |
| Email Settings | ✅ | ✅ | ✅ | ✅ | **DONE** |
| Notifications | ✅ | ✅ | ✅ | ✅ | **DONE** |
| Customer Settings | ✅ | ✅ | ✅ | ✅ | **DONE** |
| VAT Settings | ✅ | ✅ | ✅ | ✅ | **DONE** |
| Payment Settings | ✅ | ✅ | ✅ | ✅ | **DONE** |
| Invoice Settings | ✅ | ✅ | ✅ | ✅ | **DONE** |
| GDPR Compliance | ✅ | ✅ | ✅ | ✅ | **DONE** |

**Overall**: 100% Complete ✨

---

**Ultimo aggiornamento**: 2025-01-20
**Versione**: 1.0.0
**Status**: Production Ready
