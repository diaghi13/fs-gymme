# SportsRegistrationCard Implementation - Summary
**Data**: 13 Gennaio 2025
**Tempo**: ~3 ore

## ✅ Implementazione Completata

### Obiettivo
Gestire i tesseramenti dei clienti agli enti sportivi (ASI, CONI, FIF, FIPE, etc.) necessari per partecipare a gare e manifestazioni sportive.

---

## 🎯 Features Implementate

### Backend

#### 1. Controller
**File**: `app/Http/Controllers/Application/Customers/SportsRegistrationController.php`

**Endpoints RESTful**:
- `GET /api/customers/{customer}/sports-registrations` - Lista tesseramenti
- `POST /api/customers/{customer}/sports-registrations` - Crea tesseramento
- `GET /api/customers/{customer}/sports-registrations/{id}` - Dettaglio
- `PUT /api/customers/{customer}/sports-registrations/{id}` - Aggiorna
- `DELETE /api/customers/{customer}/sports-registrations/{id}` - Elimina

**Validation**:
```php
- organization: required, string, max:100
- membership_number: nullable, string, max:50
- start_date: required, date
- end_date: required, date, after:start_date
- status: required, in:active,expired (solo in update)
- notes: nullable, string, max:1000
```

**Security**:
- ✅ Auth:sanctum middleware
- ✅ Customer ownership verification
- ✅ 404 se registration non appartiene al customer

#### 2. Factory
**File**: `database/factories/SportsRegistrationFactory.php`

**Stati disponibili**:
```php
SportsRegistration::factory()->active()  // Valido ora
SportsRegistration::factory()->expired() // Scaduto
SportsRegistration::factory()->expiringSoon() // Scade tra 20 giorni
```

**Enti generati**: 10 organizzazioni italiane (ASI, CONI, FIF, FIPE, FIJLKAM, FIT, FIN, FGI, FIDAL, FIGC)

#### 3. Routes
**File**: `routes/tenant/api/routes.php`

```php
Route::prefix('customers/{customer}/sports-registrations')
    ->middleware('auth:sanctum')
    ->group(function () {
        // 5 endpoints RESTful
    });
```

#### 4. Testing
**File**: `tests/Feature/Customer/SportsRegistrationControllerTest.php`

**8 Test Scenarios**:
1. ✅ Can list customer sports registrations
2. ✅ Can create new sports registration
3. ✅ Validates required fields on create
4. ✅ Validates end_date is after start_date
5. ✅ Can update existing registration
6. ✅ Can delete registration
7. ✅ Cannot access registration from different customer
8. ✅ Registrations ordered by end_date DESC

**Run tests**:
```bash
php artisan test --filter=SportsRegistrationControllerTest
```

---

### Frontend

#### 1. SportsRegistrationCard Component
**File**: `resources/js/components/customers/cards/SportsRegistrationCard.tsx`

**UI Sections**:

##### A. Active Registration Card
```tsx
<Card variant="outlined">
  <CardContent>
    <Stack direction="row">
      <Box>
        <Typography variant="h6">ASI</Typography>
        <Chip label="Scade tra 20 giorni" color="warning" icon={<Warning />} />
        <Typography>Tessera N° ASI123456</Typography>
        <Typography>Dal 01/01/2024 al 31/12/2024</Typography>
      </Box>
      <Stack>
        <IconButton><Edit /></IconButton>
        <IconButton color="error"><Delete /></IconButton>
      </Stack>
    </Stack>
  </CardContent>
</Card>
```

##### B. Expired Registrations List
```tsx
<List dense>
  {expiredRegistrations.map(reg => (
    <ListItem
      primary={<Stack><Typography>CONI</Typography><Chip label="Scaduto" /></Stack>}
      secondary="01/01/2023 - 31/12/2023"
      secondaryAction={<Edit /> <Delete />}
    />
  ))}
</List>
```

##### C. Empty State
```tsx
<Alert severity="info">
  Nessun tesseramento registrato. I tesseramenti agli enti sportivi 
  sono necessari per partecipare a gare e manifestazioni sportive.
</Alert>
```

**Status Logic**:
```typescript
const getStatusChip = (registration) => {
  const endDate = new Date(registration.end_date);
  const daysUntilExpiry = differenceInDays(endDate, today);

  if (isPast(endDate)) {
    return <Chip label="Scaduto" color="error" />;
  }

  if (daysUntilExpiry <= 30) {
    return <Chip label={`Scade tra ${daysUntilExpiry} giorni`} color="warning" icon={<Warning />} />;
  }

  return <Chip label="Attivo" color="success" />;
};
```

#### 2. AddSportsRegistrationDialog Component
**File**: `resources/js/components/customers/dialogs/AddSportsRegistrationDialog.tsx`

**Form Fields**:
```tsx
<Dialog>
  <DialogContent>
    <TextField 
      name="organization" 
      select 
      label="Ente Sportivo *"
    >
      {ORGANIZATIONS.map(org => <MenuItem>{org}</MenuItem>)}
    </TextField>
    
    <TextField 
      name="membership_number" 
      label="Numero Tessera"
    />
    
    <DatePicker name="start_date" label="Data Inizio *" />
    <DatePicker name="end_date" label="Data Scadenza *" />
    
    <TextField 
      name="notes" 
      multiline 
      rows={3}
    />
  </DialogContent>
</Dialog>
```

**Organizations Select** (10 options):
- ASI - Associazioni Sportive Sociali Italiane
- CONI - Comitato Olimpico Nazionale Italiano
- FIF - Federazione Italiana Fitness
- FIPE - Federazione Italiana Pesistica
- FIJLKAM - Federazione Italiana Judo Lotta Karate Arti Marziali
- FIT - Federazione Italiana Tennis
- FIN - Federazione Italiana Nuoto
- FGI - Federazione Ginnastica d'Italia
- FIDAL - Federazione Italiana di Atletica Leggera
- FIGC - Federazione Italiana Giuoco Calcio
- Altro

**Formik Integration**: Usa TextField e DatePicker custom components

#### 3. Integration in GeneralTab
**File**: `resources/js/components/customers/tabs/GeneralTab.tsx`

**Position**: Colonna 3 (Documenti e Status), tra MembershipFeeCard e MedicalCertificationCard

```tsx
<Grid size={4}> {/* Colonna 3 */}
  <Grid container spacing={2}>
    <Grid size={12}><MembershipFeeCard /></Grid>
    <Grid size={12}><SportsRegistrationCard /></Grid> {/* NUOVO */}
    <Grid size={12}><MedicalCertificationCard /></Grid>
    <Grid size={12}><MembershipCardCard /></Grid>
    <Grid size={12}><PrivacyCard /></Grid>
  </Grid>
</Grid>
```

---

## 📊 TypeScript Types

**File**: `resources/js/types/index.d.ts`

```typescript
export interface SportsRegistration {
  id: number;
  customer_id: number;
  organization: string; // ASI, CONI, FIF, FIPE, etc.
  membership_number: string | null;
  start_date: Date | string;
  end_date: Date | string;
  status: 'active' | 'expired';
  notes: string | null;
  created_at: string;
  updated_at: string;
}
```

---

## 🎨 UX Features

### 1. Status Indicators
- ✅ **Chip verde "Attivo"**: End date > 30 giorni nel futuro
- ⚠️ **Chip giallo "Scade tra X giorni"**: End date < 30 giorni
- ❌ **Chip rosso "Scaduto"**: End date nel passato

### 2. Organization Selection
- Select pre-popolato con 10+ enti sportivi italiani
- Opzione "Altro" per enti non in lista
- Nomi completi (non sigle) per chiarezza

### 3. Empty State
- Alert informativo che spiega cosa sono i tesseramenti
- Distinzione chiara con quote associative

### 4. Validation
- End date deve essere dopo start_date
- Organization required
- Date required
- Max 1000 caratteri per note

### 5. Permissions
- Ownership check (registration.customer_id === customer.id)
- 404 se si tenta accesso a registration di altro customer

---

## 📦 Files Created/Modified

### Backend (4 files)
- ✅ `app/Http/Controllers/Application/Customers/SportsRegistrationController.php` (NUOVO)
- ✅ `database/factories/SportsRegistrationFactory.php` (NUOVO)
- ✅ `routes/tenant/api/routes.php` (modificato)
- ✅ `tests/Feature/Customer/SportsRegistrationControllerTest.php` (NUOVO)

### Frontend (4 files)
- ✅ `resources/js/components/customers/cards/SportsRegistrationCard.tsx` (NUOVO)
- ✅ `resources/js/components/customers/dialogs/AddSportsRegistrationDialog.tsx` (NUOVO)
- ✅ `resources/js/components/customers/tabs/GeneralTab.tsx` (modificato)
- ✅ `resources/js/types/index.d.ts` (modificato)

### Documentation (1 file)
- ✅ `docs/CUSTOMER_TODO_LIST.md` (aggiornato)

**Totale**: 9 files

---

## 🧪 Testing

### Manual Testing Checklist
```bash
# 1. Accedi a customer-show
/app/{tenant}/customers/{id}

# 2. Vai su tab "Scheda cliente" (GeneralTab)

# 3. Scroll su colonna 3 - trovi SportsRegistrationCard

# 4. Click "Nuovo Tesseramento"

# 5. Compila form:
- Ente: ASI
- Tessera: ASI123456
- Inizio: oggi
- Fine: oggi + 1 anno
- Note: Test

# 6. Salva e verifica:
- Card appare in "Tesseramento Attivo"
- Chip verde "Attivo"

# 7. Crea secondo tesseramento con end_date passata
- Deve apparire in "Storico Tesseramenti"
- Chip rosso "Scaduto"

# 8. Crea terzo con end_date tra 20 giorni
- Chip giallo "Scade tra 20 giorni" con icona Warning

# 9. Test edit/delete
```

### Automated Testing
```bash
php artisan test --filter=SportsRegistrationControllerTest
```

**Expected**: 8 passed ✅

---

## 🚀 Deployment Notes

### Database
- ✅ Migration già eseguita (sports_registrations table esiste)
- ✅ Model SportsRegistration già esistente con relationships

### Assets Build
```bash
npm run build
```

### Cache Clear (se necessario)
```bash
php artisan route:clear
php artisan config:clear
```

---

## 📈 Future Enhancements (Optional)

### 1. Auto-renewal Reminder
```php
// Scheduled job per inviare email reminder
Schedule::daily(function () {
    SportsRegistration::where('end_date', now()->addDays(30))
        ->each(fn($reg) => $reg->customer->notify(
            new RegistrationExpiringNotification($reg)
        ));
});
```

### 2. Document Upload
- Collegare file (scan tessera) via polymorphic relation
- Upload tessera PDF in SportsRegistrationCard

### 3. Cost Tracking
- Aggiungere campo `amount` per costo tesseramento
- Collegare a sale_row per pagamenti

### 4. Bulk Import
- Import tesseramenti da CSV/Excel
- Template file esempio

### 5. Export Report
- PDF/Excel report tesseramenti attivi
- Filtri per ente/data scadenza

---

## ✅ Checklist Completamento

- [x] Backend Controller implementato
- [x] API Routes registrate
- [x] Validation rules complete
- [x] Factory con stati
- [x] Test suite (8 scenari)
- [x] Frontend Card component
- [x] Dialog form con Formik
- [x] TypeScript types
- [x] Integrazione in GeneralTab
- [x] Status indicators (attivo/scaduto/scadenza)
- [x] Empty state
- [x] Error handling
- [x] Build frontend
- [x] Documentation updated

---

## 🎉 Conclusione

**Status**: ✅ **COMPLETATO AL 100%**

Sistema di gestione tesseramenti sportivi completo e funzionante con:
- Backend CRUD API ✅
- Frontend UI completo ✅
- Testing ✅
- Types ✅
- Integration ✅
- Documentation ✅

**Prossimo step**: Charts Measurements (4-6h) 📊

