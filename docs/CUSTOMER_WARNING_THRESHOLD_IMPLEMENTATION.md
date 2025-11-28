# Customer Warning Threshold - Implementazione Completa

**Data**: 2025-01-20
**Status**: ✅ Completato

## Panoramica

Implementazione della configurazione `customer.warning_threshold` che permette ai tenant di personalizzare quanti giorni prima della scadenza mostrare gli avvisi nella customer card.

## Motivazione

Gli avvisi nella scheda cliente per abbonamenti, certificati medici e tesseramenti sportivi in scadenza devono essere configurabili per adattarsi alle esigenze di ogni struttura sportiva.

## Implementazione

### 1. Correzione Typo nel Customer Model

**File**: `app/Models/Customer/Customer.php:309`

```php
// PRIMA (typo)
$warningThreshold = TenantSetting::get('customer.waring_threshold', 7);

// DOPO (corretto)
$warningThreshold = TenantSetting::get('customer.warning_threshold', 7);
```

### 2. Database Seeder

**File**: `database/seeders/TenantSettingsSeeder.php:157-165`

```php
// ========================================
// IMPOSTAZIONI CLIENTI
// ========================================
TenantSetting::set(
    key: 'customer.warning_threshold',
    value: 7,
    group: 'customer',
    description: 'Giorni prima della scadenza per mostrare avvisi nella scheda cliente'
);
```

**Default**: 7 giorni
**Range**: 1-90 giorni
**Gruppo**: `customer`

### 3. Backend - Email Settings Controller

**File**: `app/Http/Controllers/Application/Configurations/EmailSettingsController.php`

#### Metodo `show()` (riga 25)

```php
return Inertia::render('configurations/email-settings', [
    'settings' => [
        'sender' => TenantSetting::get('email.sender', tenant('email')),
        'sender_name' => TenantSetting::get('email.sender_name', tenant('name')),
        'reply_to' => TenantSetting::get('email.reply_to', tenant('email')),
        'signature' => TenantSetting::get('email.signature', ''),
        'admin_recipients' => TenantSetting::get('email.admin_recipients', []),
        'warning_threshold' => TenantSetting::get('customer.warning_threshold', 7), // ✅ AGGIUNTO
    ],
    'notifications' => [
        // ...
    ],
]);
```

#### Metodo `update()` (righe 51, 61-67)

```php
$validated = $request->validate([
    'sender' => 'required|email',
    'sender_name' => 'required|string|max:255',
    'reply_to' => 'required|email',
    'signature' => 'nullable|string|max:2000',
    'admin_recipients' => 'nullable|array',
    'admin_recipients.*' => 'email',
    'warning_threshold' => 'required|integer|min:1|max:90', // ✅ AGGIUNTO
]);

// ... save email settings ...

// Save customer warning threshold
TenantSetting::set(
    'customer.warning_threshold',
    $validated['warning_threshold'],
    'customer',
    'Giorni prima della scadenza per mostrare avvisi nella scheda cliente'
);
```

**Validazione**:
- Required
- Integer
- Min: 1 giorno
- Max: 90 giorni

### 4. Frontend - Notification Preferences UI

**File**: `resources/js/pages/configurations/email-settings.tsx`

#### Interface (riga 42)

```typescript
interface NotificationSettings {
  invoice_accepted: boolean;
  invoice_rejected: boolean;
  customer_created: boolean;
  subscription_expiring: boolean;
  subscription_expired: boolean;
  medical_cert_expiring: boolean;
  sports_registration_expiring: boolean;
  warning_threshold: number; // ✅ AGGIUNTO
}
```

#### UI Component (righe 259-286)

```tsx
<Grid size={12}>
  <Alert severity="warning">
    <Typography variant="subtitle2" gutterBottom>
      Soglia Avvisi Scadenze
    </Typography>
    <Typography variant="body2" gutterBottom>
      Configura quanti giorni prima della scadenza mostrare gli avvisi nella
      scheda cliente per abbonamenti, certificati medici e tesseramenti sportivi.
    </Typography>
    <MuiTextField
      name="warning_threshold"
      label="Giorni di preavviso"
      type="number"
      value={values.warning_threshold}
      onChange={handleChange}
      size="small"
      slotProps={{
        htmlInput: {
          min: 1,
          max: 90,
        },
      }}
      sx={{ mt: 2, maxWidth: 300 }}
      helperText="Mostra avviso X giorni prima della scadenza (es: 7 giorni)"
    />
  </Alert>
</Grid>
```

**Posizionamento**: Tab "Preferenze Notifiche" → All'inizio, prima delle sezioni specifiche

## Utilizzo nel Customer Model

**File**: `app/Models/Customer/Customer.php:305-346`

La configurazione viene utilizzata nel metodo `getCustomerAlertsAttribute()` per determinare quando mostrare gli avvisi di:

1. **Abbonamenti in scadenza**:
   ```php
   $daysUntilExpiry = $now->diffInDays($effectiveEndDate, false);
   if ($daysUntilExpiry >= 0 && $daysUntilExpiry <= $warningThreshold) {
       $alerts[] = [
           'type' => 'subscription_expiring',
           'severity' => 'warning',
           'message' => "Abbonamento in scadenza tra {$daysUntilExpiry} giorni",
           'icon' => 'FitnessCenter',
           'days' => $daysUntilExpiry,
       ];
   }
   ```

2. **Certificati medici in scadenza** (logica simile)
3. **Tesseramenti sportivi in scadenza** (logica simile)

## Percorso Menu

**Configurazioni** → **Email e Notifiche** → Tab **Preferenze Notifiche**

## Route

- **GET**: `app.configurations.email` - Mostra pagina impostazioni
- **PATCH**: `app.configurations.email.notifications.update` - Salva modifiche notifiche (include warning_threshold)

## Testing

### Test Manuale

1. Navigare a: Configurazioni → Email e Notifiche
2. Tab: Preferenze Notifiche
3. Modificare campo "Giorni di preavviso" nella sezione "Soglia Avvisi Scadenze" (es: da 7 a 14)
4. Salvare
5. Verificare nella customer card che gli avvisi appaiano 14 giorni prima della scadenza

### Test Validazione

```php
// Valori validi
warning_threshold = 1    // OK - min
warning_threshold = 7    // OK - default
warning_threshold = 30   // OK
warning_threshold = 90   // OK - max

// Valori NON validi
warning_threshold = 0    // ERRORE - min:1
warning_threshold = 91   // ERRORE - max:90
warning_threshold = ''   // ERRORE - required
```

## Note Tecniche

### Perché nella tab Preferenze Notifiche?

Inizialmente era stato implementato nella tab "Configurazione Email", ma è stato spostato nella tab "Preferenze Notifiche" perché:

1. **Coerenza logica**: Controlla quando attivare le notifiche di scadenza
2. **Raggruppamento tematico**: Direttamente collegato alle notifiche di abbonamenti, certificati e tesseramenti
3. **User Experience**: Più intuitivo trovare la soglia degli avvisi insieme alle preferenze di notifica
4. **Separazione delle responsabilità**: Email Settings = configurazione SMTP, Notification Preferences = quando notificare

### Storia della Migrazione

1. **Prima implementazione**: Regional Settings ❌ (logica errata - non riguarda localizzazione)
2. **Prima migrazione**: Email Settings → Tab "Configurazione Email" ⚠️ (meglio, ma non ottimale)
3. **Migrazione finale**: Email Settings → Tab "Preferenze Notifiche" ✅ (posizione corretta)

### Cleanup Effettuato

- ✅ Rimosso da `RegionalSettingsController.php`
- ✅ Rimosso da `regional-settings.tsx`
- ✅ Spostato da EmailSettings interface a NotificationSettings interface
- ✅ Validazione e salvataggio spostati da `update()` a `updateNotifications()`
- ✅ Rimossi import non utilizzati

## Riferimenti

- **TenantSetting Key**: `customer.warning_threshold`
- **Default Value**: `7` (giorni)
- **Group**: `customer`
- **Validation**: `integer|min:1|max:90`

## Changelog

### 2025-01-20 (Pomeriggio)
- ✅ Spostato da tab "Configurazione Email" a tab "Preferenze Notifiche"
- ✅ Modificato backend: validazione e salvataggio in `updateNotifications()`
- ✅ Modificato frontend: warning_threshold ora in NotificationSettings interface
- ✅ UI migliorata con Alert severity="warning" per visibilità
- ✅ Build frontend completato (24.14s)
- ✅ Pint passed (132 files)
- ✅ Documentazione aggiornata

### 2025-01-20 (Mattina)
- ✅ Corretto typo `waring_threshold` → `warning_threshold`
- ✅ Aggiunto al seeder con valore default 7
- ✅ Implementato in EmailSettingsController (show + update)
- ✅ Creata UI nel tab Configurazione Email
- ✅ Spostato da Regional Settings a Email Settings
- ✅ Build frontend completato
- ✅ Documentazione iniziale creata

## Screenshot UI

```
┌─────────────────────────────────────────────────┐
│ Avvisi Scadenze                         (i)     │
├─────────────────────────────────────────────────┤
│ Configura quando mostrare gli avvisi di        │
│ scadenza nella scheda cliente per abbonamenti,  │
│ certificati medici e tesseramenti sportivi.     │
│                                                  │
│ Giorni di preavviso                             │
│ ┌──────┐                                        │
│ │  7   │ ▼                                      │
│ └──────┘                                        │
│ Mostra avviso X giorni prima della scadenza     │
│ (es: 7 giorni)                                  │
└─────────────────────────────────────────────────┘
```

## Conclusioni

L'implementazione è completa e production-ready. La configurazione permette ai tenant di personalizzare la tempistica degli avvisi di scadenza per adattarsi alle loro esigenze operative specifiche.

### Posizionamento Finale

Dopo due migrazioni, il campo si trova nella posizione ottimale:

1. ❌ **Regional Settings**: Logica errata (non riguarda localizzazione)
2. ⚠️ **Email Settings → Tab "Configurazione Email"**: Meglio, ma non ottimale (riguarda SMTP, non comportamento notifiche)
3. ✅ **Email Settings → Tab "Preferenze Notifiche"**: Perfetto! (controlla quando notificare, insieme ad altre preferenze)

La scelta finale di posizionare questa configurazione nella tab "Preferenze Notifiche" migliora significativamente la UX: l'utente trova tutte le impostazioni relative alle notifiche in un unico posto, con una logica chiara e intuitiva.
