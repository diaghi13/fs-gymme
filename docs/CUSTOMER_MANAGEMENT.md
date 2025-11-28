# Customer Management Guidelines

## Overview
Gestione anagrafica clienti con creazione automatica utenza multi-tenant per accesso app/webapp futuro.

## Database Structure

### Current
- **customers** (tenant): anagrafica locale per ogni tenant
  - `user_id` → FK a `users.id` (tenant)
  - Campi: nome, cognome, company, birth_date, gender, tax_code, vat_number, indirizzo, GDPR

- **users** (tenant): utenti tenant, sincronizzati con central
  - `global_id` → FK a central users.global_id
  - Synced fields: first_name, last_name, email, password
  - Relationship: `hasOne(Customer)`

- **users** (central): CentralUser model
  - `global_id`: identificatore unico globale
  - Relationship: `belongsToMany(Tenant)` via `tenant_users` pivot

### Target Architecture
```
CentralUser (1) ←→ (N) Tenant via tenant_users
     ↓
User (tenant) (1) ←→ (1) Customer (tenant)
```

**Flow**: Cliente si iscrive a Palestra A → crea CentralUser + User (tenant A) + Customer (tenant A). Stessa persona si iscrive a Palestra B → aggancia stesso CentralUser, crea User (tenant B) + Customer (tenant B).

## Implementation Requirements

### 1. Uniqueness
- **Email univoca per tenant** (un cliente = una email per palestra)
- **CentralUser.email univoca globale** (stessa email = stesso CentralUser)
- **Validation**: verificare email non esista già nel tenant

### 2. Form Customer Create
**Required Fields:**
- first_name, last_name (o company_name per aziende)
- email (auto-create user)
- phone
- birth_date, birthplace, gender (per CF)
- tax_code (codice fiscale)
- vat_number (se azienda)
- street, number, city, zip, province, country

**Features:**
- ✅ Calcolo automatico CF da dati (bottone "Calcola CF")
- ✅ Autocomplete CAP + Provincia da Città (API/dataset italiano)
- ✅ Toggle "È un'azienda" (mostra/nasconde company_name, vat_number)
- ✅ Validazione email univoca tenant
- ✅ GDPR consents (checkboxes)

**Backend Logic:**
1. Check if `CentralUser` with email exists
   - YES → Aggancia a tenant, crea `User` (tenant) + `Customer`
   - NO → Crea `CentralUser`, `User` (tenant) + `Customer`
2. Assign role `user` to User (tenant)
3. Link via `tenant_users` pivot

### 3. API Endpoints Needed
- `POST /api/customers/calculate-tax-code` - Calcola CF
- `GET /api/locations/city/{city}` - Ritorna CAP + provincia
- `POST /api/customers/check-email` - Verifica email disponibile

### 4. UI/UX Improvements
- **Stepper multi-step**: Dati personali → Indirizzo → Consensi
- **Validation real-time**: email, CF, VAT
- **Autocomplete smart**: città italiane con ricerca fuzzy
- **Mobile-first**: form responsive, input grandi touch-friendly
- **Success feedback**: toast + redirect a scheda cliente

### 5. Models Relationships

**Customer.php:**
```php
public function user() {
    return $this->belongsTo(User::class, 'user_id');
}
```

**User.php (tenant):**
```php
public function customer() {
    return $this->hasOne(Customer::class, 'user_id');
}

public function centralUser() {
    return $this->belongsTo(CentralUser::class, 'global_id', 'global_id');
}
```

**CentralUser.php:**
```php
public function tenants() {
    return $this->belongsToMany(Tenant::class, 'tenant_users', 'global_user_id', 'tenant_id', 'global_id');
}

public function tenantUsers() {
    return $this->hasMany(User::class, 'global_id', 'global_id');
}
```

## Migration Required

```php
// customers table already has user_id
// Check users table has global_id
// Check tenant_users pivot exists with: global_user_id, tenant_id
```

## Service Layer

**CustomerService.php** (new):
```php
class CustomerService {
    public function createWithUser(array $data, Tenant $tenant): Customer
    {
        DB::transaction(function() use ($data, $tenant) {
            // 1. Find or create CentralUser
            $centralUser = CentralUser::firstOrCreate(
                ['email' => $data['email']],
                [/* user data */]
            );

            // 2. Attach tenant if not already
            if (!$centralUser->tenants()->where('tenant_id', $tenant->id)->exists()) {
                $centralUser->tenants()->attach($tenant->id);
            }

            // 3. Create tenant User (synced via ResourceSyncing)
            $user = User::create([
                'global_id' => $centralUser->global_id,
                // synced fields
            ]);
            $user->assignRole('user');

            // 4. Create Customer
            return Customer::create([
                'user_id' => $user->id,
                // customer data
            ]);
        });
    }

    public function calculateTaxCode(array $data): string { /* logic */ }
}
```

## Testing Scenarios
1. ✅ Nuovo cliente → crea tutto
2. ✅ Email esistente stesso tenant → errore validazione
3. ✅ Email esistente altro tenant → aggancia CentralUser, crea User + Customer
4. ✅ CF calcolato correttamente
5. ✅ Autocomplete città funziona
6. ✅ GDPR consents salvati

## Frontend Components

**CustomerForm.tsx**: Form principale con stepper
**TaxCodeCalculator.tsx**: Modale calcolo CF
**CityAutocomplete.tsx**: Autocomplete città con CAP/provincia
**GDPRConsents.tsx**: Checkboxes GDPR raggruppati

## Implementation Status

### ✅ Completed (2025-01-13)
- [x] **CustomerService** (`app/Services/Customer/CustomerService.php`)
  - `createWithUser()`: Multi-tenant customer creation with CentralUser reuse
  - `calculateTaxCode()`: CF calculation (placeholder, needs proper library)
  - `isEmailAvailable()`: Email uniqueness check per tenant

- [x] **CustomerController** updated with CustomerService injection
  - `store()` now uses `CustomerService::createWithUser()`
  - `checkEmail()` API endpoint for email availability
  - `calculateTaxCode()` API endpoint for CF calculation

- [x] **CustomerStoreRequest** enhanced validations
  - Complete field validation (personal, tax, address, GDPR)
  - Custom error messages in Italian
  - Regex validation for CF, VAT, ZIP, Province

- [x] **API Routes** added (`routes/tenant/api/routes.php`)
  - `POST /api/customers/check-email` - Check email availability
  - `POST /api/customers/calculate-tax-code` - Calculate CF

- [x] **Customer Model** relationships fixed
  - `user()` → belongsTo User (tenant)
  - `centralUser()` → hasOneThrough CentralUser via User
  - Proper multi-tenant relationship chain

- [x] **Event System** - Email notifications on customer creation
  - `CustomerCreated` event with customer data
  - `CustomerObserver` dispatches event on created
  - `SendWelcomeEmail` listener (queued, GDPR-aware)
  - `CustomerWelcomeNotification` with Italian localized content
  - Registered in AppServiceProvider

- [x] **Testing** - Comprehensive test suite
  - `CustomerServiceTest` with 7 test scenarios:
    - ✅ Creates new customer with full multi-tenant setup
    - ✅ Reuses CentralUser across tenants
    - ✅ Enforces email uniqueness per tenant
    - ✅ Calculates tax code
    - ✅ Handles GDPR consents with timestamps
    - ✅ Supports company/VAT data
    - ✅ Verifies tenant attachments

- [x] **Frontend CustomerForm** (`CustomerForm.tsx`)
  - Complete form with all sections (personal, tax, address, GDPR)
  - Real-time email availability check
  - Tax code calculator integration
  - City autocomplete with CAP/province
  - Company toggle for B2B customers
  - GDPR consents checkboxes

### 🚧 In Progress
- [ ] Frontend improvements (UX enhancements, better error messages)
- [ ] Tax code calculation with proper Italian library (backend)

### 📋 Next Steps
1. **Tax Code Library** - Replace placeholder with proper CodiceFiscale library
   - Consider `umberto-sonnino/laravel-codice-fiscale` or similar
   - Validate CF format and comune codes

2. **City/CAP Dataset** - Optimize autocomplete
   - Integrate official ISTAT dataset
   - Cache comuni data for performance
   - Support fuzzy search

3. **Password Reset Flow** - Customer onboarding
   - Send password reset link after registration
   - Customer portal access with credentials
   - Mobile app integration

4. **Email Templates** - Improve notification design
   - Branded HTML email template
   - Tenant-specific branding (logo, colors)
   - Multi-language support (IT/EN)

5. **Additional Features**
   - Customer import/export (CSV, Excel)
   - Duplicate detection (fuzzy matching on name + birthdate)
   - Customer merge functionality
   - Activity log for GDPR compliance

## Notes
- Password iniziale per User: generata random, inviata via email welcome
- Email welcome template: `emails.customer.welcome`
- Role `user` ha permessi: view own data, book services
- Soft delete: mantenere customer anche se user viene disattivato

---

## Customer Card (Scheda Cliente)

### Overview
La scheda cliente è organizzata in **tabs** per gestire tutte le informazioni relative al cliente in modo ordinato e intuitivo.

### Tab Structure

#### 1. **Scheda Generale** (Tab: `general`)
Panoramica completa del cliente con le sezioni principali:

**Layout**: Grid 4-4-4 (tre colonne)

**Colonna 1 - Anagrafica:**
- **Card Dati personali** (`DetailsCard`):
  - Nome, cognome, company_name
  - Email, telefono
  - Indirizzo completo
  - Codice fiscale, P.IVA
  - Data di nascita, luogo nascita, genere
  - Pulsante modifica anagrafica

**Colonna 2 - Attività e vendite:**
- **Card Abbonamenti attivi** (`SubscriptionsCard`):
  - Lista abbonamenti in corso
  - Data inizio, data scadenza
  - Tipo abbonamento (price_list_id → PriceList)
  - Link rapido a gestione abbonamenti
- **Card Riepilogo vendite** (`SalesCard`):
  - Totale vendite (#)
  - Importo totale vendite
  - Pagato / Da pagare
  - Scaduto
  - Badge cliente: Nuovo/Abituale/Premium (in base a totale speso)
  - Link a tab "Vendite e pagamenti"

**Colonna 3 - Documenti e status:**
- **Card Quota associativa** (`MembershipFeeCard`):
  - Quota associativa ALLA STRUTTURA (pagamento annuale per assicurazioni/spese)
  - **CREATA AUTOMATICAMENTE DALLE VENDITE** (non inseribile manualmente)
  - Stato: Attiva/Scaduta/Mai sottoscritta
  - Data scadenza (tipicamente annuale)
  - Importo quota (dalla vendita)
  - Pulsante: 👁️ **Visualizza** (apre dialog per vedere dettagli e correggere date/status)
  - Dialog: sola visualizzazione + correzione errori (NO creazione/eliminazione)
- **Card Tesseramento Sportivo** (`SportsRegistrationCard`):
  - Tesseramento ad ENTE SPORTIVO (ASI, CONI, FIF, FIPE, etc.)
  - **GESTIONE COMPLETA** (creazione/modifica/eliminazione manuale)
  - Per partecipazione a gare e manifestazioni
  - Ente affiliazione (select con lista predefinita)
  - Numero tessera dell'ente
  - Data scadenza tesseramento
  - Pulsante: ✏️ **Modifica** (apre dialog per gestione completa)
  - Dialog: creazione, modifica, eliminazione tesseramenti
- **Card Certificato medico** (`MedicalCertificationCard`):
  - Stato: Valido/Scaduto/Mai fornito
  - Data rilascio
  - Data scadenza (1 anno dalla data rilascio)
  - Note (tipo attività: agonistica/non agonistica)
  - Alert scadenza imminente (<30gg)
  - Pulsante: Carica/Aggiorna
- **Card Tessera associativa** (`MembershipCardCard`):
  - Numero tessera
  - Ente di affiliazione
  - Data emissione
  - Data scadenza
  - Pulsante: Modifica
- **Card Consensi GDPR** (`PrivacyCard`):
  - GDPR consent + data
  - Marketing consent + data
  - Photo consent
  - Medical data consent
  - Data retention until
  - Pulsante: Modifica consensi

**Activity Timeline** (bottom, full width):
- Timeline verticale con ultime 10 attività:
  - Vendite create
  - Pagamenti ricevuti
  - Abbonamenti attivati/scaduti
  - Certificati caricati
  - Note aggiunte
  - Accessi in palestra (se integrato con tornelli)

#### 2. **Vendite e Pagamenti** (Tab: `sales`)
- Lista completa vendite del cliente
- Filtri: Data, Tipo documento, Stato pagamento
- Tabella:
  - Numero documento
  - Data vendita
  - Tipo documento
  - Totale
  - Pagato
  - Da pagare
  - Scadenza
  - Azioni: Visualizza, Stampa, Invia email
- Statistiche vendite (grafico mensile)
- Pagamenti effettuati (lista)

#### 3. **Sospensioni e Proroghe** (Tab: `extensions`)
Gestione sospensioni abbonamenti e proroghe:
- Lista sospensioni:
  - Abbonamento interessato
  - Data inizio sospensione
  - Data fine sospensione
  - Motivo
  - Giorni sospesi
  - Nuova data scadenza
- Pulsante: Aggiungi sospensione
- Lista proroghe:
  - Abbonamento
  - Giorni prorogati
  - Motivo
  - Data proroga
  - Nuova scadenza
- Pulsante: Aggiungi proroga

#### 4. **Documenti** (Tab: `documents`)
Repository documenti cliente:
- Certificati medici (caricati)
- Tessere (scan)
- Contratti firmati
- Foto profilo
- Altri documenti
- Upload drag&drop
- Preview documenti
- Download/Elimina

#### 5. **Misurazioni** (Tab: `measures`)
Scheda antropometrica e tracking progressi:
- Storia misurazioni:
  - Data misurazione
  - Peso
  - Altezza
  - BMI (auto-calcolato)
  - Circonferenze (petto, vita, fianchi, braccia, cosce)
  - Massa grassa %
  - Massa magra %
  - Note trainer
- Grafico evoluzione peso/BMI nel tempo
- Pulsante: Nuova misurazione
- Foto before/after (opzionale)

---

### Database Schema Updates Needed

#### 1. Nuova tabella: `membership_fees` (Quota Associativa)
**IMPORTANTE**: Quote associative ≠ Tesseramenti sportivi

**Quota Associativa** (`membership_fees`):
- Pagamento annuale alla STRUTTURA
- Copre: assicurazione infortuni, utenze base, "spese condominiali"
- Es: €30-50/anno alla palestra stessa
- **CREATA AUTOMATICAMENTE DALLE VENDITE** tramite `sale_row_id`
- NON creabile/eliminabile manualmente (solo correzioni date/status)
- Si comporta come un abbonamento ma NON include corsi o servizi
- NON sospendibile

```sql
CREATE TABLE membership_fees (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL,
    sale_row_id BIGINT UNSIGNED NULL, -- SEMPRE popolato dalla vendita
    organization VARCHAR(100) NOT NULL, -- Nome struttura dalla vendita
    membership_number VARCHAR(50) NULL, -- NON usato (legacy, per tesseramenti fisici futuri)
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL, -- Importo dalla vendita
    status ENUM('active', 'expired', 'suspended') DEFAULT 'active',
    notes TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (sale_row_id) REFERENCES sale_rows(id) ON DELETE SET NULL
);
```

**API Routes (read-only + corrections)**:
- `GET /api/v1/customers/{customer}/membership-fees` - Lista quote
- `GET /api/v1/customers/{customer}/membership-fees/{fee}` - Dettaglio quota
- `PUT /api/v1/customers/{customer}/membership-fees/{fee}` - Correzione date/status (NO store/destroy)

#### 1b. Nuova tabella: `sports_registrations` (Tesseramento Enti Sportivi)
**Tesseramento Sportivo** (`sports_registrations`):
- Iscrizione ad un ENTE SPORTIVO (ASI, CONI, FIF, FIPE, etc.)
- Per partecipare a manifestazioni e gare
- Validità: ~1 anno
- Spesso GRATUITO (la struttura lo fa per il cliente)
- **GESTIONE MANUALE COMPLETA** (creazione/modifica/eliminazione)
- Include: numero tessera dell'ente
- La struttura gestisce l'iscrizione con l'ente
- NON collegato a vendite

```sql
CREATE TABLE sports_registrations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL,
    organization VARCHAR(100) NOT NULL, -- ASI, CONI, FIF, FIPE, etc. (select predefinita)
    membership_number VARCHAR(50) NULL, -- Numero tessera rilasciato dall'ente
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('active', 'expired') DEFAULT 'active',
    notes TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer_status (customer_id, status),
    INDEX idx_end_date (end_date)
);
```

**API Routes (full CRUD)**:
- `GET /api/v1/customers/{customer}/sports-registrations` - Lista tesseramenti
- `POST /api/v1/customers/{customer}/sports-registrations` - Crea tesseramento
- `GET /api/v1/customers/{customer}/sports-registrations/{registration}` - Dettaglio
- `PUT /api/v1/customers/{customer}/sports-registrations/{registration}` - Modifica
- `DELETE /api/v1/customers/{customer}/sports-registrations/{registration}` - Elimina
```

#### 2. Nuova tabella: `customer_subscription_suspensions`
```sql
CREATE TABLE customer_subscription_suspensions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_subscription_id BIGINT UNSIGNED NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_suspended INT NOT NULL,
    reason TEXT NULL,
    created_by BIGINT UNSIGNED NULL, -- user_id staff
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (customer_subscription_id) REFERENCES customer_subscriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
```

#### 3. Nuova tabella: `customer_subscription_extensions`
```sql
CREATE TABLE customer_subscription_extensions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_subscription_id BIGINT UNSIGNED NOT NULL,
    days_extended INT NOT NULL,
    reason TEXT NULL,
    extended_at DATE NOT NULL,
    new_end_date DATE NOT NULL,
    created_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (customer_subscription_id) REFERENCES customer_subscriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
```

#### 4. Nuova tabella: `customer_measurements`
```sql
CREATE TABLE customer_measurements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL,
    measured_at DATE NOT NULL,
    weight DECIMAL(5,2) NULL, -- kg
    height DECIMAL(5,2) NULL, -- cm
    bmi DECIMAL(4,2) NULL, -- auto-calculated
    chest_circumference DECIMAL(5,2) NULL, -- cm
    waist_circumference DECIMAL(5,2) NULL,
    hips_circumference DECIMAL(5,2) NULL,
    arm_circumference DECIMAL(5,2) NULL,
    thigh_circumference DECIMAL(5,2) NULL,
    body_fat_percentage DECIMAL(4,2) NULL,
    lean_mass_percentage DECIMAL(4,2) NULL,
    notes TEXT NULL,
    measured_by BIGINT UNSIGNED NULL, -- user_id trainer
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (measured_by) REFERENCES users(id) ON DELETE SET NULL
);
```

#### 5. Update tabella `customer_subscriptions`
Aggiungere campi se mancanti:
```sql
ALTER TABLE customer_subscriptions ADD COLUMN status ENUM('active', 'suspended', 'expired', 'cancelled') DEFAULT 'active';
ALTER TABLE customer_subscriptions ADD COLUMN suspended_days INT DEFAULT 0;
ALTER TABLE customer_subscriptions ADD COLUMN extended_days INT DEFAULT 0;
```

---

### Models to Create/Update

#### New Models:
- `App\Models\Customer\MembershipFee` (Quota associativa alla struttura)
- `App\Models\Customer\SportsRegistration` (Tesseramento ente sportivo)
- `App\Models\Customer\CustomerSubscriptionSuspension`
- `App\Models\Customer\CustomerSubscriptionExtension`
- `App\Models\Customer\CustomerMeasurement`

**NOTA**: `App\Models\Product\MembershipFee` è il PRODOTTO nel listino, NON il model per la quota del cliente!

#### Update Customer Model:
```php
// Quote associative alla struttura
public function membership_fees() {
    return $this->hasMany(MembershipFee::class)->orderBy('end_date', 'desc');
}

public function active_membership_fee() {
    return $this->hasOne(MembershipFee::class)
        ->where('status', 'active')
        ->where('start_date', '<=', now())
        ->where('end_date', '>=', now());
}

// Tesseramenti enti sportivi (ASI, CONI, FIF, etc.)
public function sports_registrations() {
    return $this->hasMany(SportsRegistration::class)->orderBy('end_date', 'desc');
}

public function active_sports_registration() {
    return $this->hasOne(SportsRegistration::class)
        ->where('status', 'active')
        ->where('start_date', '<=', now())
        ->where('end_date', '>=', now())
        ->latest('end_date');
}

// Misurazioni antropometriche
public function measurements() {
    return $this->hasMany(CustomerMeasurement::class)->orderBy('measured_at', 'desc');
}

public function latest_measurement() {
    return $this->hasOne(CustomerMeasurement::class)->latest('measured_at');
}
```

#### Update CustomerSubscription Model:
```php
public function suspensions() {
    return $this->hasMany(CustomerSubscriptionSuspension::class)->orderBy('start_date', 'desc');
}

public function extensions() {
    return $this->hasMany(CustomerSubscriptionExtension::class)->orderBy('extended_at', 'desc');
}

public function getEffectiveEndDateAttribute(): ?Carbon {
    $endDate = $this->end_date ? Carbon::parse($this->end_date) : null;
    if (!$endDate) return null;

    // Add suspended days
    $endDate->addDays($this->suspended_days ?? 0);

    // Add extended days
    $endDate->addDays($this->extended_days ?? 0);

    return $endDate;
}
```

---

### Frontend Components to Create

#### Cards (Colonna 3):
- `resources/js/components/customers/cards/MembershipFeeCard.tsx` - ✅ COMPLETATO (Quota associativa struttura)
- `resources/js/components/customers/cards/SportsRegistrationCard.tsx` - ❌ TODO (Tesseramento ente sportivo)
- `resources/js/components/customers/cards/MedicalCertificationCard.tsx` - ✅ Già esiste
- `resources/js/components/customers/cards/MembershipCardCard.tsx` - ✅ Già esiste (tessera fisica)
- `resources/js/components/customers/cards/PrivacyCard.tsx` - ✅ Già esiste

#### Activity Timeline:
- `resources/js/components/customers/ActivityTimeline.tsx` (nuovo)

#### Tab Components:
- `resources/js/components/customers/tabs/SalesTab.tsx` - ✅ Già esiste
- `resources/js/components/customers/tabs/ExtensionsTab.tsx` (nuovo)
- `resources/js/components/customers/tabs/DocumentsTab.tsx` (nuovo)
- `resources/js/components/customers/tabs/MeasurementsTab.tsx` (nuovo)

#### Dialogs:
- `resources/js/components/customers/dialogs/AddMembershipFeeDialog.tsx`
- `resources/js/components/customers/dialogs/AddSuspensionDialog.tsx`
- `resources/js/components/customers/dialogs/AddExtensionDialog.tsx`
- `resources/js/components/customers/dialogs/AddMeasurementDialog.tsx`
- `resources/js/components/customers/dialogs/UploadDocumentDialog.tsx`

---

### API Endpoints to Add

```php
// Membership Fees
POST   /api/customers/{customer}/membership-fees
GET    /api/customers/{customer}/membership-fees
PUT    /api/customers/{customer}/membership-fees/{fee}
DELETE /api/customers/{customer}/membership-fees/{fee}

// Suspensions
POST   /api/customer-subscriptions/{subscription}/suspensions
GET    /api/customer-subscriptions/{subscription}/suspensions
DELETE /api/customer-subscriptions/suspensions/{suspension}

// Extensions
POST   /api/customer-subscriptions/{subscription}/extensions
GET    /api/customer-subscriptions/{subscription}/extensions
DELETE /api/customer-subscriptions/extensions/{extension}

// Measurements
POST   /api/customers/{customer}/measurements
GET    /api/customers/{customer}/measurements
PUT    /api/customers/{customer}/measurements/{measurement}
DELETE /api/customers/{customer}/measurements/{measurement}

// Documents
POST   /api/customers/{customer}/documents (file upload)
GET    /api/customers/{customer}/documents
DELETE /api/customers/documents/{document}

// Activity
GET    /api/customers/{customer}/activity (timeline)
```

---

### Implementation Priority

1. **Phase 1 - Database & Models** ✅ COMPLETATA:
   - ✅ Create migrations for new tables
   - ✅ Create models with relationships
   - ✅ Update existing models
   - ✅ Separated membership_fees (quota) from sports_registrations (tesseramento)

2. **Phase 2 - General Tab Enhancement** ✅ COMPLETATA:
   - ✅ Implement MembershipFeeCard
   - ✅ Enhance SalesCard with customer badge (Nuovo/Abituale/Premium)
   - ✅ Add ActivityTimeline component
   - ✅ Optimize GeneralTab layout 4-4-4

3. **Phase 3 - Extensions Tab**:
   - ✅ Create ExtensionsTab
   - ✅ Add/Edit suspension dialogs
   - ✅ Add/Edit extension dialogs

4. **Phase 4 - Documents Tab** ✅ COMPLETATA:
   - ✅ Create polymorphic `files` table for app-wide file management
   - ✅ Create `File` model with soft deletes and automatic file deletion
   - ✅ Create `FileController` with CRUD operations
   - ✅ Create `DocumentsTab` component with GDPR compliance
   - ✅ Create `UploadFileDialog` with drag & drop dropzone
   - ✅ Implement file type categorization (medical_certificate, photo, id_card, contract, other)
   - ✅ Implement consent-based access control (photo_consent, medical_data_consent, gdpr_consent)
   - ✅ File expiration tracking with visual indicators
   - ✅ Remove page reloads - local state management for smooth UX
   - ✅ Fix tenant identification for view/download operations
   - ✅ API Routes: `/api/files/*` (index, store, show, download, update, destroy)

5. **Phase 5 - Measurements Tab**:
   - ✅ Create MeasurementsTab
   - ✅ Add measurement dialog
   - ✅ Charts for weight/BMI tracking

---

## File Management System (Phase 4)

### Overview
Sistema di gestione file polimorfico app-wide per allegare documenti a qualsiasi entità (Customer, Sale, etc.).

### Database Schema

#### `files` Table (Tenant)
```sql
CREATE TABLE files (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    fileable_type VARCHAR(255) NOT NULL,    -- Polymorphic: App\Models\Customer\Customer, etc.
    fileable_id BIGINT UNSIGNED NOT NULL,   -- ID dell'entità collegata
    type VARCHAR(50) NOT NULL,              -- medical_certificate, photo, contract, id_card, other
    name VARCHAR(255) NOT NULL,             -- Nome originale file
    file_name VARCHAR(255) NOT NULL,        -- Nome file salvato (UUID)
    path VARCHAR(255) NOT NULL,             -- Percorso storage
    disk VARCHAR(50) DEFAULT 'local',       -- Disco storage (local, s3, etc.)
    mime_type VARCHAR(255) NULL,
    size BIGINT UNSIGNED NULL,              -- Dimensione in bytes
    description TEXT NULL,
    metadata JSON NULL,                     -- Metadati aggiuntivi
    uploaded_by BIGINT UNSIGNED NULL,       -- User che ha caricato
    expires_at TIMESTAMP NULL,              -- Scadenza (per certificati)
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,              -- Soft delete

    INDEX idx_fileable (fileable_type, fileable_id),
    INDEX idx_type (type),
    INDEX idx_expires_at (expires_at),
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);
```

### File Types

| Type | Label | Requires Consent | Has Expiry |
|------|-------|------------------|------------|
| `medical_certificate` | Certificato Medico | `medical_data_consent` | ✅ Yes |
| `photo` | Foto | `photo_consent` | ❌ No |
| `id_card` | Documento Identità | `gdpr_consent` | ✅ Yes |
| `contract` | Contratto | ❌ No consent | ❌ No |
| `other` | Altro | ❌ No consent | ❌ No |

### GDPR Compliance

#### Consent-Based Access Control
Il sistema verifica automaticamente i consensi GDPR del cliente prima di permettere l'accesso ai file:

```typescript
const canAccessFile = (file: File) => {
  if (file.type === 'photo' && !customer.photo_consent) {
    return { canAccess: false, reason: 'Consenso foto mancante' };
  }

  if (file.type === 'medical_certificate' && !customer.medical_data_consent) {
    return { canAccess: false, reason: 'Consenso dati medici mancante' };
  }

  if (file.type === 'id_card' && !customer.gdpr_consent) {
    return { canAccess: false, reason: 'Consenso GDPR mancante' };
  }

  return { canAccess: true };
};
```

#### Data Retention
- File vengono conservati fino a `customer.data_retention_until`
- Alert visibile nella UI quando consensi mancanti
- Soft delete per compliance audit trail

### Models

#### `App\Models\File`
```php
class File extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'fileable_type', 'fileable_id', 'type', 'name', 'file_name',
        'path', 'disk', 'mime_type', 'size', 'description', 'metadata',
        'uploaded_by', 'expires_at'
    ];

    protected $casts = [
        'metadata' => 'array',
        'size' => 'integer',
        'expires_at' => 'datetime',
    ];

    protected $appends = ['url', 'is_expired', 'human_readable_size'];

    // Polymorphic relationship
    public function fileable(): MorphTo {
        return $this->morphTo();
    }

    // Auto-delete file from storage when model deleted
    protected static function booted(): void {
        static::deleting(function (File $file) {
            if (Storage::disk($file->disk)->exists($file->path)) {
                Storage::disk($file->disk)->delete($file->path);
            }
        });
    }
}
```

#### Customer Model Integration
```php
// In App\Models\Customer\Customer
public function files(): MorphMany {
    return $this->morphMany(\App\Models\File::class, 'fileable')
        ->orderBy('created_at', 'desc');
}
```

### API Endpoints

**Base URL**: `/api/files`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/` | List files (with filters) | ✅ |
| `POST` | `/` | Upload file | ✅ |
| `GET` | `/{file}` | View/stream file | ✅ |
| `GET` | `/{file}/download` | Download file | ✅ |
| `PUT` | `/{file}` | Update metadata | ✅ |
| `DELETE` | `/{file}` | Delete file | ✅ |

**Important**: For `GET` requests (view/download), tenant must be passed as query parameter:
```
/api/files/123?tenant=60876426-2e31-4a9b-a163-1e46be4a425f
```

### Frontend Components

#### `DocumentsTab.tsx`
Main tab component with:
- File list table with type badges
- GDPR warning alerts for missing consents
- Lock icons for restricted files
- Expiration warnings
- Upload, view, download, delete actions
- **Local state management** (no page reloads)

#### `UploadFileDialog.tsx`
Upload dialog with:
- Drag & drop dropzone
- File type selection with GDPR warnings
- Expiry date picker (for certificates)
- Description field
- Progress bar
- Max size: 50MB

### UX Improvements (Implemented)

1. **No Page Reloads**:
   - Local state management with `useState`
   - Instant UI updates after upload/delete
   - Smooth user experience

2. **GDPR Consent Checks**:
   - Fixed boolean conversion (`!!customer.photo_consent`)
   - Handles both `true` and `1` values from database

3. **Tenant Identification**:
   - Fixed `fileable_type` escaping issue (was `App\\\\Models\\\\Customer\\\\Customer`, now `App\Models\Customer\Customer`)
   - Added tenant query parameter for GET requests

### Storage

**Path Structure**:
```
storage/app/files/{fileable_type}/{fileable_id}/{uuid}.{ext}

Example:
storage/app/files/App\Models\Customer\Customer/1/72d602ba-e45f-49a4-b139-b3f98969acf3.jpg
```

**File Naming**:
- Original name stored in `name` field
- Actual file saved with UUID + extension
- Prevents conflicts and maintains privacy

### Testing Scenarios

- ✅ Upload file with all required fields
- ✅ Upload file with expiry date
- ✅ Upload file requiring GDPR consent
- ✅ View file with proper tenant
- ✅ Download file with proper tenant
- ✅ Delete file and verify storage cleanup
- ✅ UI updates without page reload
- ✅ GDPR warnings display correctly
- ✅ Access control based on consents

### Known Issues & Solutions

1. **Issue**: Files uploaded but not visible in UI
   - **Cause**: `fileable_type` had double backslashes (`App\\\\Models...`)
   - **Fix**: Changed JSX string from `"App\\Models..."` to `"App\Models..."`

2. **Issue**: GDPR warnings showing despite consents being true
   - **Cause**: Database stores `1` (number), code checked `=== true`
   - **Fix**: Use `!!customer.photo_consent` for truthy conversion

3. **Issue**: TenantCouldNotBeIdentifiedByRequestDataException on view/download
   - **Cause**: `window.open()` cannot pass custom headers
   - **Fix**: Pass tenant as query parameter `?tenant={id}`

### Future Enhancements

- [ ] File versioning (keep history of uploads)
- [ ] Bulk upload
- [ ] File preview in modal (PDF, images)
- [ ] File sharing with customers (via portal)
- [ ] Automatic expiry notifications (email alerts)
- [ ] OCR for document text extraction
- [ ] Integration with cloud storage (S3, Google Drive)
