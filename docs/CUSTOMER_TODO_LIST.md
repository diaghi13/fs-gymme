# Customer System - TODO List
**Aggiornato**: 13 Gennaio 2025

## 📋 Checklist Implementazione

Basandomi sul documento CUSTOMER_MANAGEMENT.md, ecco cosa **MANCA** da implementare:

---

## ❌ DA FARE - Priorità ALTA

### 1. SportsRegistrationCard Component
**Status**: ✅ COMPLETATO (13 Gennaio 2025)

**Implementato**:
- ✅ Component card per visualizzare tesseramento ente sportivo (ASI, CONI, FIF, FIPE)
- ✅ Visualizzazione: ente, numero tessera, data scadenza, status
- ✅ Pulsante "Nuovo Tesseramento" con dialog
- ✅ Alert scadenza imminente (warning se < 30 giorni)
- ✅ Edit e delete per ogni tesseramento
- ✅ Storico tesseramenti scaduti

**File creati**:
- ✅ `resources/js/components/customers/cards/SportsRegistrationCard.tsx`
- ✅ `resources/js/components/customers/dialogs/AddSportsRegistrationDialog.tsx`
- ✅ `app/Http/Controllers/Application/Customers/SportsRegistrationController.php`
- ✅ `database/factories/SportsRegistrationFactory.php`
- ✅ `tests/Feature/Customer/SportsRegistrationControllerTest.php`

**Backend**:
- ✅ Migration esiste
- ✅ Model `SportsRegistration` esiste con HasFactory
- ✅ Controller implementato (CRUD completo)
- ✅ API routes registrate (5 endpoints RESTful)
- ✅ Factory con stati (active, expired, expiringSoon)
- ✅ Test suite (8 scenari)

**Features**:
- Select con 10+ enti sportivi italiani comuni (ASI, CONI, FIF, FIPE, etc.)
- Auto-detect status (active/expired) based on end_date
- Warning chip quando manca < 30 giorni alla scadenza
- Validazione date (end_date must be after start_date)
- Integrato in GeneralTab (colonna 3)

**Tempo impiegato**: ~3 ore

---

### 2. Charts per MeasurementsTab
**Status**: ✅ COMPLETATO (13 Gennaio 2025)

**Implementato**:
- ✅ 4 tipi di grafici interattivi (AreaChart, LineChart, BarChart, RadarChart)
- ✅ Period selector con 5 opzioni (1m, 3m, 6m, 1y, tutto)
- ✅ AreaChart progressione peso con gradient fill
- ✅ LineChart BMI con reference lines (18.5-25 range normale)
- ✅ BarChart composizione corporea (grasso rosso vs magra verde)
- ✅ RadarChart circonferenze ultima misurazione
- ✅ Conditional rendering (solo grafici con dati disponibili)
- ✅ Empty states (no data, 1 measurement, no data in period)
- ✅ Tab system in MeasurementsTab (Tabella/Grafici)

**Libreria**: Recharts v2.x installato

**File creati**:
- ✅ `resources/js/components/customers/measurements/MeasurementChartsSection.tsx` (360 linee)
- ✅ `resources/js/components/customers/tabs/MeasurementsTab.tsx` (modificato con TabContext)

**Features**:
- useMemo optimization per data transformation
- Responsive design (weight/BMI side-by-side su desktop)
- Custom tooltips con formattazione (kg, %, cm)
- Date formatting italiano (dd/MM)
- Color coding semantico (blu peso, arancio BMI, rosso grasso, verde magra, viola circonferenze)

**Tempo impiegato**: ~4 ore

---

### 3. Activity Timeline Enhancement
**Status**: ⚠️ FILE ESISTE MA PROBABILMENTE INCOMPLETO

**Cosa serve**:
- Verificare se ActivityTimeline è completo
- Mostrare ultime 10 attività cliente:
  - Vendite create
  - Pagamenti ricevuti  
  - Abbonamenti attivati/scaduti
  - Certificati caricati
  - Note aggiunte
  - Misurazioni inserite
  - Sospensioni/proroghe

**File esistente**: `resources/js/components/customers/ActivityTimeline.tsx`

**Tempo stimato**: 2-3 ore (se da completare)

---

## ❌ DA FARE - Priorità MEDIA

### 4. Password Reset Flow per Clienti
**Status**: ❌ NON IMPLEMENTATO

**Cosa serve**:
- Inviare link reset password nella welcome email
- Customer portal login page
- Self-service password reset

**Implementazione**:
```php
// In SendWelcomeEmail listener
$resetToken = Password::createToken($event->customer->user);
$resetUrl = route('password.reset', ['token' => $resetToken, 'email' => $customer->email]);

// Include in welcome email
```

**Tempo stimato**: 3-4 ore

---

### 5. City/CAP Dataset Optimization
**Status**: ⚠️ PARZIALE (esiste CityAutocompleteAsyncNew ma da ottimizzare)

**Cosa serve**:
- Dataset ISTAT comuni italiani completo
- Cache Redis per performance
- Fuzzy search ottimizzato

**File esistente**: `resources/js/components/ui/CityAutocompleteAsyncNew.tsx`

**Tempo stimato**: 4-5 ore

---

### 6. Customer Import/Export
**Status**: ❌ NON IMPLEMENTATO

**Cosa serve**:
- Export clienti in Excel/CSV
- Import clienti da Excel/CSV con validazione
- Template file esempio
- Gestione duplicati durante import

**Libreria**: Laravel Excel (da installare)

**Tempo stimato**: 6-8 ore

---

### 7. Duplicate Detection
**Status**: ❌ NON IMPLEMENTATO

**Cosa serve**:
- API endpoint per check duplicati (fuzzy matching)
- Dialog pre-submit nel CustomerForm
- Lista potenziali duplicati con azioni

**Tempo stimato**: 4-5 ore

---

### 8. Customer Merge
**Status**: ❌ NON IMPLEMENTATO

**Cosa serve**:
- Service method `mergeCustomers()`
- Merge storico: vendite, abbonamenti, misurazioni, file
- Transaction-safe
- UI per selezionare cliente da unire

**Tempo stimato**: 5-6 ore

---

## ❌ DA FARE - Priorità BASSA

### 9. Goal Tracking System
**Status**: ❌ NON IMPLEMENTATO

**Cosa serve**:
- Migration `customer_measurement_goals`
- Model `CustomerMeasurementGoal`
- CRUD endpoints
- UI cards per visualizzare obiettivi
- Progress tracking automatico
- Achievement notifications

**Tempo stimato**: 8-10 ore

---

### 10. Email Template Branding
**Status**: ⚠️ BASIC IMPLEMENTATO

**Cosa serve**:
- Template HTML branded
- Logo tenant dinamico
- Colori tenant personalizzati
- Responsive email design
- Multi-language support (IT/EN)

**Tempo stimato**: 4-5 ore

---

### 11. GDPR Activity Log
**Status**: ❌ NON IMPLEMENTATO

**Cosa serve**:
- Audit trail modifiche dati cliente
- Log accessi file sensibili
- Export dati GDPR-compliant
- Right to be forgotten automation

**Tempo stimato**: 6-8 ore

---

## ✅ GIÀ COMPLETATO

### Backend
- ✅ CustomerService con multi-tenant logic
- ✅ CustomerController CRUD
- ✅ CustomerStoreRequest validations
- ✅ Event system (CustomerCreated, SendWelcomeEmail, CustomerWelcomeNotification)
- ✅ CodiceFiscale library integration
- ✅ CustomerMeasurement system completo (model, controller, API, tests)
- ✅ File management system (polymorphic, GDPR-compliant)

### Database
- ✅ customers table
- ✅ customer_measurements table + migration
- ✅ customer_subscription_suspensions table + migration
- ✅ customer_subscription_extensions table + migration
- ✅ membership_fees table + migration
- ✅ sports_registrations table + migration
- ✅ files table + migration (polymorphic)

### Models
- ✅ Customer con relationships
- ✅ CustomerMeasurement con BMI auto-calculate
- ✅ CustomerSubscriptionSuspension
- ✅ CustomerSubscriptionExtension
- ✅ MembershipFee
- ✅ SportsRegistration
- ✅ File (polymorphic)

### Frontend Components
- ✅ CustomerForm (completo con stepper, validations, autocomplete)
- ✅ MeasurementsTab (lista, add/edit dialog, trend indicators)
- ✅ ExtensionsTab (sospensioni e proroghe)
- ✅ DocumentsTab (upload, download, GDPR compliance)
- ✅ MembershipFeeCard
- ✅ ActivityTimeline (file esiste)
- ✅ GeneralTab layout 4-4-4

### Testing
- ✅ CustomerServiceTest (7 scenari)
- ✅ CustomerMeasurementControllerTest (9 scenari)

---

## 📊 Riepilogo Tempi

| Feature | Status | Priorità | Tempo |
|---------|--------|----------|-------|
| SportsRegistrationCard | ❌ TODO | ⭐⭐⭐ ALTA | 3-4h |
| Charts Measurements | ❌ TODO | ⭐⭐⭐ ALTA | 4-6h |
| ActivityTimeline Enhancement | ⚠️ CHECK | ⭐⭐⭐ ALTA | 2-3h |
| Password Reset Flow | ❌ TODO | ⭐⭐ MEDIA | 3-4h |
| City/CAP Optimization | ⚠️ PARTIAL | ⭐⭐ MEDIA | 4-5h |
| Import/Export | ❌ TODO | ⭐⭐ MEDIA | 6-8h |
| Duplicate Detection | ❌ TODO | ⭐⭐ MEDIA | 4-5h |
| Customer Merge | ❌ TODO | ⭐⭐ MEDIA | 5-6h |
| Goal Tracking | ❌ TODO | ⭐ BASSA | 8-10h |
| Email Branding | ⚠️ BASIC | ⭐ BASSA | 4-5h |
| GDPR Activity Log | ❌ TODO | ⭐ BASSA | 6-8h |

**Totale stimato**: 50-64 ore (6-8 giorni lavorativi)

---

## 🎯 Roadmap Consigliata

### Sprint 1 (Giorno 1): SportsRegistration + Charts Base
1. SportsRegistrationCard component (3h)
2. Controller + API per sports_registrations (1h)
3. Installare Recharts e creare primo grafico peso (2h)

**Output**: Tesseramenti sportivi gestibili, primo grafico visibile

---

### Sprint 2 (Giorno 2): Charts Complete + ActivityTimeline
1. Completare tutti i grafici (BMI, composizione, circonferenze) (3h)
2. Period selector (1h)
3. Verificare/completare ActivityTimeline (2h)

**Output**: Dashboard progressi completa, timeline attività

---

### Sprint 3 (Giorno 3-4): Import/Export + Duplicate Detection
1. Laravel Excel setup + CustomersExport (3h)
2. CustomersImport con validazione (4h)
3. Duplicate detection API + UI (5h)

**Output**: Gestione anagrafica massiva, prevenzione duplicati

---

### Sprint 4 (Giorno 5): Password Reset + City Optimization
1. Password reset flow per clienti (3h)
2. Ottimizzare CityAutocomplete con dataset ISTAT (4h)

**Output**: Clienti possono accedere autonomamente, autocomplete veloce

---

### Sprint 5 (Giorno 6-7): Customer Merge + Goal Tracking
1. Merge service + UI (5h)
2. Goal tracking system completo (10h)

**Output**: Database pulito, clienti motivati con obiettivi

---

### Sprint 6 (Giorno 8): Polish & Nice-to-have
1. Email branding (4h)
2. GDPR activity log (se tempo)

**Output**: Esperienza professionale completa

---

## 🚀 Prossimo Step IMMEDIATO

**Consiglio di iniziare con**:

### Opzione A: SportsRegistration (3-4h, impatto visivo)
- Card mancante in GeneralTab
- Feature già usata (tesseramenti enti)
- Backend quasi pronto (manca solo controller)

### Opzione B: Charts Measurements (4-6h, wow factor)
- Alto valore percepito dai clienti
- Usa dati già presenti
- Motivazione clienti

### Opzione C: ActivityTimeline Check (30min-2h)
- Verificare se è completo o da implementare
- Quick win se manca poco

**Quale preferisci iniziare?** 🎯

