# Project Guidelines - FS Gymme

## Panoramica Progetto

**FS Gymme** è un sistema di gestione multi-tenant per palestre/centri sportivi costruito con:
- **Backend**: Laravel 12 (struttura streamlined)
- **Frontend**: React 19 + Inertia.js v2 + TypeScript
- **UI**: Material-UI v6 (Grid component)
- **Multi-tenancy**: Stancl Tenancy con database separati
- **Database**: SQLite per tenant (dev), supporto PostgreSQL/MySQL
- **Pattern**: Single Table Inheritance (STI) con package Parental per Product types

### Architettura Multi-Tenant
- Ogni tenant ha database separato (SQLite file in `database/`)
- `current_structure_id` sincronizzato tra session + cookie per robustezza
- **Global Scopes**: StructureScope filtra automaticamente i dati per struttura corrente
- Route Model Binding automatico con Eloquent
- Session persistente attraverso tenant switch

### Prodotti e STI
Il sistema gestisce 3 tipi di prodotti con Single Table Inheritance:
1. **BaseProduct** - Prodotti base/semplici
2. **CourseProduct** - Corsi con planning/timetable
3. **BookableService** - Servizi prenotabili

Tutti ereditano da `Product` e usano:
- **HasSettings trait**: JSON settings con validation
- **Type field**: discriminatore per STI (`type` column)
- Settings specifici per tipo con defaults

## Comunicazione e Approccio

### Stile di Comunicazione
- **Italiano**: Comunicazione sempre in italiano
- **Diretto ed esplicito**: Nessun compiacimento, solo fatti
- **Obiettività tecnica**: Focus su accuratezza e problem-solving
- **Onestà professionale**: Dire quando qualcosa non funziona o serve miglioramento
- **Correzioni benvenute**: L'utente corregge quando necessario, accettare senza difese

### Metodologia di Lavoro
1. **TodoWrite proattivo**: Usare sempre per task complessi (3+ step)
2. **Commit frequenti**: Ogni feature/fix completato va committato
3. **Seguire convenzioni esistenti**: Controllare file siblings prima di creare nuovi
4. **Pattern consistency**: Riutilizzare pattern esistenti nel codebase
5. **Test prima di finalizzare**: Validare con test quando possibile

### Quando NON usare TodoWrite
- Task singolo e diretto
- Operazioni triviali (< 3 step)
- Richieste puramente informative

## Convenzioni Tecniche

### DTO Pattern (Data Transfer Objects)

Il progetto usa DTO per validazione e type-safety dei dati.

**Struttura Standard DTO**:
```php
namespace App\Dtos\Product;

class BookableServiceDto extends BaseDto
{
    public ?int $id = null;
    public string $name = '';
    public ?string $description = null;
    public string $color = '#000000';
    public ?array $settings = null;

    protected static function validationRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'color' => 'required|string|max:7',
            'settings' => 'nullable|array',
            // Nested settings validation
            'settings.booking.advance_days' => 'nullable|integer|min:1|max:365',
            'settings.booking.cancellation_hours' => 'nullable|integer|min:0|max:168',
        ];
    }

    public static function casts(): array
    {
        return [
            'id' => 'integer',
            'name' => 'string',
            'settings' => 'array',
        ];
    }
}
```

**Best Practices DTO**:
- Proprietà pubbliche con type hints espliciti
- Separare visivamente le proprietà (una riga vuota tra ciascuna)
- Validazioni nested per settings JSON
- Metodo `casts()` per type casting automatico
- Ereditare da `BaseDto` per funzionalità comuni

**Uso nei Controller**:
```php
public function store(Request $request)
{
    $validated = $request->validate(BookableServiceDto::validationRules());
    $dto = BookableServiceDto::fromArray($validated);

    $product = BookableService::create($dto->toArray());
}
```

### Laravel 12 Specifics
```
bootstrap/app.php          -> Middleware, exceptions, routing config
bootstrap/providers.php    -> Service providers registration
routes/console.php         -> Console commands (NO app/Console/Kernel.php)
app/Console/Commands/      -> Auto-registered commands
```

### Struttura Database
```
database/
  migrations/
    central/              -> Central DB migrations (tenants, users)
    tenant/              -> Tenant DB migrations (customers, products, etc.)
  factories/
  seeders/
```

### Frontend Patterns

#### Component Structure
```typescript
// Tab components sempre con FormikConfig pattern
const formik: FormikConfig<FormValues> = {
  initialValues: { ... },
  validationSchema: Yup.object({ ... }),
  onSubmit: (values) => { ... },
  enableReinitialize: true,
};
```

#### Settings Management
```typescript
// SEMPRE preservare settings esistenti
const updatedSettings = {
  ...product.settings,
  section: {
    ...newValues
  }
};
```

#### Null Safety
```typescript
// Settings possono essere null (legacy products)
const settings = product.settings?.section || {};
const value = settings.field || defaultValue;
```

### Backend Patterns

#### Controllers
```php
// Inizializzare settings se null
if (is_null($product->settings)) {
    $product->settings = array_merge(
        $product->getCommonSettingsDefaults(),
        $product->getExtraSettingsDefaults()
    );
    $product->save();
}
```

#### Validation
```php
// Validazioni dettagliate per settings nidificati
'settings' => 'nullable|array',
'settings.section.field' => 'nullable|integer|min:1|max:100',
```

#### Route Naming
```php
// Pattern: app.{resource}.{action}
Route::patch('course-products/{product}/sales', CourseProductSaleUpdate::class)
    ->name('app.course-products.sales.update');
```

### TypeScript Types
```typescript
// Sempre aggiornare types quando cambia struttura backend
export interface ProductPlanning {
  id: number;
  name: string;              // Auto-generated dal backend
  from_date: string | Date;
  to_date: string | Date;
  selected: boolean;
  details: Array<ProductPlanningDetails>;
}
```

## Pattern Implementati

### 1. Auto-Generation Pattern
**Contesto**: Planning names per CourseProduct
**Implementazione**:
- Server-side generation in controller
- Formato: "Planning Gen 2025", "Planning Gen - Mar 2025"
- Uso Carbon con locale italiano
- Tracking modifiche future tramite nome + date

```php
private function generatePlanningName(Carbon $start, Carbon $end): string {
    if ($start->isSameMonth($end)) {
        return 'Planning ' . $start->locale('it')->isoFormat('MMM YYYY');
    }
    // ... logic
}
```

### 2. Settings Preservation Pattern
**Problema**: Perdita dati quando si aggiorna solo una sezione
**Soluzione**: Spread operator per preservare tutto

```typescript
const updatedSettings = {
  ...service.settings,  // Preserve all
  booking: {            // Update only this section
    ...values
  }
};
```

### 3. Create vs Update Pattern
**Contesto**: Form che gestisce sia creazione che modifica
**Implementazione**:
```typescript
const formik: FormikConfig<{ planning_id: number | null; ... }> = {
  onSubmit: (values) => {
    if (values.planning_id) {
      router.put(route('update', {...}), data);  // Update
    } else {
      router.post(route('store', {...}), data);  // Create
    }
  }
};
```

### 4. Validation Pattern (Frontend)
```typescript
validationSchema: Yup.object({
  field: Yup.number()
    .required('Campo obbligatorio')
    .min(1, 'Minimo 1')
    .max(100, 'Massimo 100'),
  end_time: Yup.date()
    .test('is-after-start', 'Messaggio errore', function(value) {
      const { start_time } = this.parent;
      return new Date(value) > new Date(start_time);
    }),
})
```

### 5. UX Enhancement Pattern
```typescript
// TabContainer wraps form content
<Formik {...formik}>
  <TabContainer warning="Optional warning message">
    <Form>
      {/* form fields */}
      <FormikSaveButton />  // Auto-loading state
    </Form>
  </TabContainer>
</Formik>
```

## Componenti Riutilizzabili

### UI Components
- `FormikSaveButton` - Button con loading state e icon
- `FormFeedback` - Snackbar + loading bar globale
- `TabContainer` - Wrapper con error alerts automatici
- `TimeSlotManager` - Gestione slot personalizzati per giorno

### Product Components
- `{ProductType}Tab` - Tab configuration per tipo prodotto
- `TimeTableForm` - Form per planning corso con dropdown
- `SaleForm` - Form vendita condiviso tra product types

## Struttura Prodotti

### BaseProduct Settings
```json
{
  "facility": {
    "operating_hours": [
      { "day": "monday", "open": "09:00", "close": "21:00" }
    ]
  }
}
```

### CourseProduct Settings
```json
{
  "course": {
    "total_lessons": 12,
    "lessons_per_week": 2,
    "lesson_duration_minutes": 60,
    "skill_level": "beginner",
    "course_type": "group",
    "curriculum": "https://..."
  },
  "booking": {
    "enrollment_deadline_days": 7,
    "min_students_to_start": 5,
    "max_absences_allowed": 2,
    "makeup_lessons_allowed": true,
    "transfer_to_next_course": true
  },
  "materials": {
    "equipment_provided": true,
    "bring_own_equipment": false,
    "materials_fee": 50,
    "equipment_list": []
  },
  "progression": {
    "has_certification": true,
    "next_level_course_id": null,
    "prerequisites": []
  }
}
```

### BookableService Settings
```json
{
  "booking": {
    "advance_days": 30,
    "min_advance_hours": 2,
    "cancellation_hours": 24,
    "max_per_day": 10,
    "buffer_minutes": 15
  },
  "requirements": {
    "requires_trainer": true,
    "requires_equipment": false,
    "requires_room": true,
    "min_preparation_minutes": 10
  },
  "availability": {
    "available_days": ["monday", "tuesday", "wednesday"],
    "default_start_time": "09:00",
    "default_end_time": "20:00",
    "slot_duration_minutes": 60,
    "max_concurrent_bookings": 3,
    "time_slots": [
      {
        "day": "monday",
        "start_time": "09:00",
        "end_time": "12:00",
        "max_bookings": 5
      }
    ]
  }
}
```

## PriceLists Architecture

### Struttura PriceLists
Il sistema gestisce diversi tipi di listini prezzi per vendita:

1. **Folder** - Cartelle organizzative gerarchiche
2. **Subscription** - Abbonamenti con contenuti standard/opzionali (supporta Products, Articles, Memberships)
3. **Article** - Articoli generici (magliette, integratori, etc.)
4. **Membership** - Quote associative/tesseramento
5. **DayPass** - Ingressi giornalieri
6. **Token** - Carnet di ingressi/crediti
7. **GiftCard** - Buoni regalo

### Subscription PriceList
Gli abbonamenti possono includere:
- **BaseProduct**: Accesso sala pesi, area cardio, etc.
- **CourseProduct**: Corsi inclusi nell'abbonamento
- **BookableService**: Servizi prenotabili inclusi (PT, visite, consulenze)
- **Article**: Articoli inclusi (es. t-shirt benvenuto)
- **Membership**: Quote associative incluse

**Pattern di inclusione BookableService in Subscription**:
```json
{
  "standard_content": [
    {
      "price_listable_type": "App\\Models\\Product\\Product",
      "price_listable_id": 123,  // BookableService ID
      "unlimited_entries": false,
      "total_entries": 10,        // Es: 10 sessioni PT
      "validity_months": 3,
      "advance_booking_days": 30,
      "cancellation_hours": 24
    }
  ]
}
```

**Use Cases BookableService in Subscriptions**:
1. **Pacchetto PT**: 10 sessioni Personal Training incluse nell'abbonamento Gold
2. **Wellness Package**: 3 massaggi inclusi nell'abbonamento Premium
3. **Health Check**: 1 visita medica inclusa nell'abbonamento annuale
4. **Nutrition Plan**: 2 consulenze nutrizionista incluse

### Modal Selezione Prodotti (SubscriptionAddContentDialog)
Il modal presenta **8 tab organizzati** per facilitare la selezione:
- Tab 1: Prodotti Base (sala pesi, cardio, etc.)
- Tab 2: Corsi (yoga, pilates, spinning, etc.)
- Tab 3: **Servizi Prenotabili** (PT, massaggi, visite, consulenze)
- Tab 4: Quote Associative
- Tab 5: Articoli
- Tab 6: Day Pass
- Tab 7: Token/Carnet
- Tab 8: Gift Card

**Filosofia UX**: Ogni tipo di prodotto/servizio ha il suo tab dedicato per chiarezza.

### BookableService: Token vs Subscription - Decisione Architettonica

**Domanda**: Come vendere pacchetti di servizi prenotabili (es: 10 PT, 3 massaggi)?

**Opzione 1: Nuovo PriceList dedicato "Service Package"**
- ❌ Complessità: Nuovo controller, routes, migrations, UI
- ❌ Confusione utente: Dove vendere servizi? Service Package o Subscription?
- ❌ Duplicazione logica: Stesso concetto di "bundle con limiti"
- ❌ Manutenzione: Più codice da mantenere

**Opzione 2: Estendere Token (SCELTA RACCOMANDATA)**
- ✅ **Già esistente**: Token gestisce "carnet di crediti"
- ✅ **Semantica corretta**: "10 ingressi PT" è concettualmente un token
- ✅ **UX familiare**: Utente già conosce Token per carnet ingressi
- ✅ **Riuso logica**: Stessa struttura expiration/validity già implementata
- ✅ **Flessibilità**: Token può puntare a qualsiasi Product (include BookableService)

**Opzione 3: Solo Subscription**
- ✅ Funziona per bundle complessi (abbonamento + servizi)
- ❌ Troppo pesante per vendita semplice "10 PT standalone"
- ❌ Non adatto a vendita spot servizio singolo

**DECISIONE: Approccio Ibrido Token + Subscription**

```
Use Case 1: Vendita standalone "10 sessioni PT"
→ Token PriceList collegato a BookableService PT
→ Cliente compra token, può prenotare 10 volte

Use Case 2: Abbonamento Gold + 10 PT inclusi
→ Subscription con BookableService nel standard_content
→ total_entries = 10

Use Case 3: Vendita spot "1 visita medica"
→ Token con 1 credito collegato a BookableService "Visita Medica"
```

**Implementazione Token per BookableService**:
1. Token ha già `price_listable_type` e `price_listable_id` (polymorphic)
2. Token può già puntare a Product (BaseProduct, CourseProduct, **BookableService**)
3. Token ha già `entrances` (numero crediti disponibili)
4. Token ha già `validity_days`/`validity_months`
5. **NESSUNA modifica strutturale necessaria** ✅

**Frontend Changes Necessari**:
1. Token form: Aggiungere BookableService alla selezione prodotto
2. Token display: Mostrare icona/badge distintivo per servizi prenotabili
3. Documentazione: Chiarire che Token può vendere anche servizi

### DayPass vs Token - Differenze Chiave

**DayPass (Ingresso Giornaliero)**:
- **Uso**: Singolo ingresso valido per un'intera giornata
- **Accesso**: Tutte le aree della palestra (sala pesi, cardio, corsi)
- **Target**: Clienti occasionali, visitatori, "prova giorno"
- **Validità**: Utilizzabile solo il giorno di acquisto o giorno specificato
- **Quantità**: 1 ingresso = 1 giornata completa

**Token (Carnet)**:
- **Uso**: Pacchetto di N ingressi/crediti utilizzabili nel tempo
- **Accesso**: Configurabile per prodotti specifici o tutti
- **Target**: Clienti regolari che vogliono flessibilità senza abbonamento
- **Validità**: Periodo configurabile (es: 10 ingressi validi 60 giorni)
- **Quantità**: N ingressi = N accessi separati

**Quando Usare Cosa**:
```
Cliente: "Voglio provare la palestra un giorno"
→ DayPass

Cliente: "Vengo 2 volte a settimana ma non voglio abbonamento"
→ Token con 10 ingressi validi 60 giorni

Cliente: "Voglio fare 10 sessioni di Personal Training"
→ Token collegato a BookableService PT
```

### GiftCard - Caratteristiche

**Scopo**: Buoni regalo prepagati riscattabili per qualsiasi servizio/prodotto.

**Caratteristiche Principali**:
- `price`: Valore monetario della card (es: 50€, 100€)
- `validity_months`: Validità in mesi (1-120), nullable per nessuna scadenza
- Settings avanzati nel model per redemption rules

**Use Cases**:
1. Regalo compleanno: Gift Card 100€ valida 12 mesi
2. Regalo aziendale: Gift Card 50€ valida 6 mesi
3. Promozione: Gift Card 150€ senza scadenza

**Settings Avanzati (Future)**:
```php
'redemption' => [
  'redeemable_for' => 'anything',  // O limitato a products/subscriptions/services
  'partial_redemption' => true,    // Può usare parte del valore
  'combine_with_other_payments' => true,
]
```

**Backend Logic (Da Implementare)**:
- Generazione codice univoco (GIFT-XXXX-XXXX)
- Tracking saldo residuo se partial redemption
- Sistema di riscatto durante checkout
- Email delivery con codice

### Implementazione Token per BookableService - Roadmap

**✅ Già Funzionante (Database)**:
```php
// Token Model structure (NO CHANGES NEEDED)
'token_quantity'   // Numero crediti (es: 10 PT sessions)
'validity_days'    // Validità in giorni
'validity_months'  // Validità in mesi
'settings' => [
  'usage' => [
    'applicable_to' => [123, 456],  // Array di Product IDs (può includere BookableService)
    'all_products' => false,
    'requires_booking' => true
  ]
]
```

**✅ Frontend Implementato**:

1. **TokenPriceListCard Component** ✅
   - ✅ Tab "Generale" - Configurazione base token + selezione prodotti
   - ✅ Tab "Prenotazioni" - Regole booking specifiche per BookableService
   - ✅ Tab "Validità" - Configurazione avanzata validità e restrizioni
   - ✅ Tab "Vendita" - Configurazione vendita
   - ✅ Form supporta selezione prodotto generico
   - ✅ Badge/icon per servizi prenotabili
   - ✅ Label dinamica: "Numero sessioni/crediti"

2. **TokenProductSelector Component** ✅
   - ✅ Modal con 3 tab: Prodotti Base, Corsi, Servizi Prenotabili
   - ✅ Selezione multipla con toggle "Tutti i prodotti"
   - ✅ Badge distintivo per BookableService
   - ✅ Chip visivi per prodotti selezionati

3. **TokenBookingTab Component** ✅
   - ✅ **Auto-copy regole nel DB alla creazione** (non più live inheritance!)
   - ✅ Valori definitivi salvati in `settings.booking.*`
   - ✅ Alert success mostra regole copiate dal servizio
   - ✅ Modifica indipendente dal servizio originale
   - ✅ Campi: advance_booking_days, cancellation_hours, max_bookings_per_day
   - ✅ Switch requires_booking
   - ✅ Riepilogo regole attive
   - ✅ Alert quando nessun servizio prenotabile selezionato

4. **TokenValidityTab Component** ✅ (NUOVO)
   - ✅ Configurazione validità in giorni o mesi
   - ✅ Radio buttons per inizio validità: acquisto vs primo utilizzo
   - ✅ Switch "Scade se non utilizzato"
   - ✅ Utilizzi massimi al giorno
   - ✅ Switch trasferibilità token
   - ✅ Riepilogo configurazione live
   - ✅ Validation completa (1-3650 giorni, 1-120 mesi)

3. **UX Guidelines Token**
   ```
   Caso 1: Token per Ingressi Generici
   Nome: "Carnet 10 Ingressi"
   Applicabile a: [Tutti i prodotti]
   Crediti: 10
   
   Caso 2: Token per PT Specifico
   Nome: "Pacchetto 10 PT"
   Applicabile a: [Personal Training 1h]
   Crediti: 10
   Badge: "Servizio Prenotabile"
   
   Caso 3: Token Multi-Service
   Nome: "Wellness Pack"
   Applicabile a: [Massaggio, Sauna, Idromassaggio]
   Crediti: 5
   ```

**🎨 UI Enhancements**:
- Icon distintiva per BookableService (EventAvailable)
- Badge colorato "Prenotazione Richiesta"
- Tooltip esplicativo: "Questo token permette di prenotare N sessioni di [servizio]"

**📋 Validazioni da Aggiungere**:
```php
// TokenController validation
'applicable_products' => 'nullable|array',
'applicable_products.*' => 'exists:products,id',
'all_products' => 'boolean',
'requires_booking' => 'boolean',  // Auto-true se BookableService selezionato
```

**🔄 Backend Logic (Vendita/Utilizzo)**:
- Vendita Token → Crea CustomerToken con crediti disponibili
- Prenotazione BookableService → Verifica CustomerToken validi
- Conferma prenotazione → Decrementa token_quantity
- Cancellazione → Ripristina credito (se entro termini)

### Auto-Copy Valori Ereditati (PATTERN CRITICO)

**Problema Originale**: 
I valori di default erano solo placeholder nel form, non salvati nel database. Questo complicava le query future per verificare permessi e regole di accesso.

**Soluzione Implementata**: ✅
Alla creazione del Token, i valori di default vengono **copiati definitivamente** nel database come snapshot immutabile.

**Implementazione Backend**:
```php
// TokenController::store()
private function extractBookingDefaultsFromProducts(array $productIds): array
{
    $bookableService = BookableService::whereIn('id', $productIds)->first();
    
    if (!$bookableService) {
        return ['advance_booking_days' => null, ...];
    }
    
    // COPY (not reference) - definitive values in DB
    return [
        'advance_booking_days' => $bookingSettings['advance_days'] ?? null,
        'cancellation_hours' => $bookingSettings['cancellation_hours'] ?? null,
        'max_bookings_per_day' => $bookingSettings['max_per_day'] ?? null,
    ];
}

// Values are stored in Token settings.booking
$settings = [
    'booking' => $this->extractBookingDefaultsFromProducts($productIds), // Definitive copy
    // ...
];
```

**Vantaggi**:
1. ✅ **Query Performance**: SELECT diretto su token.settings invece di JOIN con products
2. ✅ **Immutabilità**: Cambi al BookableService non influenzano token già venduti
3. ✅ **Audit Trail**: Regole applicate al momento della vendita sono tracciate
4. ✅ **Backwards Compatibility**: Vecchi token senza settings funzionano con fallback
5. ✅ **Business Logic Semplice**: Access control query usa solo tabella tokens

**Esempio Pratico**:
```
Giorno 1: Creo Token "Pacchetto PT"
  - BookableService ha: 30 giorni anticipo, 24h cancellazione
  - Token viene creato con settings.booking copiato: {advance_booking_days: 30, cancellation_hours: 24}
  - Valori SALVATI nel database ✅

Giorno 30: Cambio BookableService → 60 giorni anticipo
  - Token già venduti: mantengono 30 giorni (immutabile) ✅
  - Nuovi token: verranno creati con 60 giorni ✅

Query per validare prenotazione:
  SELECT settings->booking->advance_booking_days FROM tokens WHERE id = 123
  → NO JOIN con products necessario! ✅
```

## Tab Structure per Prodotti

### BaseProduct
1. **General** - Nome, descrizione, colore, SKU, stato attivo
2. **Schedule** - Orari operativi per giorno
3. **Sale** - IVA, descrizione fattura, vendibile in abbonamento

### CourseProduct
1. **General** - Dati generali prodotto
2. **Timetable** - Planning giornate corso con auto-naming
3. **Bookings** - Configurazione corso, iscrizioni, materiali, certificazione
4. **Sale** - Configurazione vendita

### BookableService
1. **General** - Dati generali servizio
2. **Bookings** - Regole prenotazione e requisiti servizio
3. **Availability** - Giorni disponibili, orari default, slot personalizzati
4. **Sale** - Configurazione vendita

## Tab Structure per PriceLists

### Token (Carnet/Crediti)
1. **Generale** - Nome, folder, colore, prezzo, IVA, crediti, validità, selezione prodotti applicabili
2. **Prenotazioni** - Regole booking per BookableService (auto-copiate nel DB alla creazione)
3. **Validità** - Configurazione avanzata validità e restrizioni d'uso
4. **Vendita** - Periodo vendibilità con riepilogo dinamico

### Folder (Contenitore)
1. **Generale** - Nome, selezione parent folder, toggle vendibilità
2. **Vendita** - Periodo vendibilità

### Subscription
1. **Generale** - Nome, folder, colore, prezzo, IVA
2. **Contenuti Standard** - Prodotti sempre inclusi (BaseProduct, CourseProduct, BookableService, Article, Membership)
3. **Contenuti Opzionali** - Prodotti selezionabili dal cliente
4. **Vendita** - Periodo vendibilità

### Article / Membership
1. **Generale** - Nome, folder, colore, prezzo, IVA, (duration_months per Membership)
2. **Vendita** - Periodo vendibilità

### DayPass (Ingresso Giornaliero)
1. **Generale** - Nome, folder, colore, prezzo, IVA
2. **Vendita** - Periodo vendibilità

### GiftCard (Buono Regalo)
1. **Generale** - Nome, folder, colore, valore, IVA, validità (mesi)
2. **Vendita** - Periodo vendibilità

## UI/UX Pattern Consolidati

### Layout Standard per Tab Form
```typescript
<Box>
  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <IconComponent />
    Titolo Sezione
  </Typography>
  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
    Descrizione breve della sezione
  </Typography>

  <Grid container spacing={3}>
    <Grid size={12}>
      <Alert severity="info">
        Note informative per l'utente
      </Alert>
    </Grid>

    <Grid size={12}>
      <Divider />
    </Grid>

    {/* Form fields */}

    {/* Riepilogo opzionale */}
    <Grid size={12}>
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle2">Riepilogo</Typography>
        <Typography variant="body2" color="text.secondary">
          Dettagli configurazione corrente
        </Typography>
      </Box>
    </Grid>

    <Grid size={12}>
      <Divider />
    </Grid>

    <Grid size={12} sx={{ textAlign: 'end', mt: 2 }}>
      <FormikSaveButton />
    </Grid>
  </Grid>
</Box>
```

### Modal Dialog Pattern
```typescript
<Dialog open={open} fullWidth maxWidth="md" onClose={onClose}>
  <DialogTitle sx={{ pb: 1 }}>
    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Icon />
      Titolo Modal
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
      Descrizione funzionalità
    </Typography>
  </DialogTitle>
  <Divider />
  <DialogContent sx={{ p: 0 }}>
    {/* Content con scroll */}
  </DialogContent>
  <Divider />
  <DialogActions sx={{ px: 3, py: 2 }}>
    <Button onClick={onClose} variant="outlined">Annulla</Button>
  </DialogActions>
</Dialog>
```

### Icone per PriceLists (Lista)
- **Folder**: FolderIcon / FolderOpenIcon
- **Subscription**: CreditCardIcon
- **Article**: CategoryIcon
- **Membership**: CardMembershipIcon
- **Token**: StyleIcon
- **DayPass**: ConfirmationNumberIcon
- **GiftCard**: CardGiftcardIcon

### Validation Pattern Frontend
```typescript
validationSchema: Yup.object({
  name: Yup.string()
    .required('Il nome è obbligatorio')
    .max(255, 'Massimo 255 caratteri'),
  parent_id: Yup.mixed()
    .nullable()
    .notRequired()
    .test('not-self', 'Errore circular reference', (value) => {
      if (!value) return true;
      return value !== currentId;
    }),
  // Date validation con cross-field reference
  saleable_to: Yup.date()
    .nullable()
    .min(Yup.ref('saleable_from'), 'La data "al" deve essere successiva alla data "dal"'),
})
```

### SaleForm Pattern (Vendibilità)

Tutte le entità vendibili (Products, PriceLists) hanno un **SaleForm** standardizzato:

```typescript
interface SaleFormValues {
  saleable_from: Date | null;
  saleable_to: Date | null;
}

// Validation con cross-field reference
validationSchema: Yup.object({
  saleable_from: Yup.date().nullable(),
  saleable_to: Yup.date()
    .nullable()
    .min(Yup.ref('saleable_from'), 'La data "al" deve essere successiva'),
})
```

**Layout Standard**:
- Alert informativo con regole business (sempre/dal/al/periodo)
- Divider separatore sezioni
- DatePicker per saleable_from e saleable_to
- Box riepilogo dinamico con le date selezionate
- FormikSaveButton a destra in fondo

**Riepilogo Dinamico**:
```typescript
{!values.saleable_from && !values.saleable_to && (
  <Typography>Prodotto <strong>sempre vendibile</strong></Typography>
)}
{values.saleable_from && !values.saleable_to && (
  <Typography>Vendibile <strong>dal {format(values.saleable_from, 'dd/MM/yyyy')}</strong></Typography>
)}
{!values.saleable_from && values.saleable_to && (
  <Typography>Vendibile <strong>fino al {format(values.saleable_to, 'dd/MM/yyyy')}</strong></Typography>
)}
{values.saleable_from && values.saleable_to && (
  <Typography>Vendibile <strong>dal {format(values.saleable_from, 'dd/MM/yyyy')} al {format(values.saleable_to, 'dd/MM/yyyy')}</strong></Typography>
)}
```

## Validazioni Standard

### Campi Temporali
- `advance_days`: 1-365
- `min_advance_hours`: 0-72
- `cancellation_hours`: 0-168 (7 giorni)
- `lesson_duration_minutes`: 15-480 (8 ore)
- `slot_duration_minutes`: 15-480

### Campi Numerici
- `max_per_day`: 1-100
- `buffer_minutes`: 0-120
- `min_preparation_minutes`: 0-180
- `total_lessons`: 1-200
- `lessons_per_week`: 1-7
- `min_students_to_start`: 1-100
- `max_concurrent_bookings`: 1-50
- `materials_fee`: 0-10000€

### Campi Enum
- `skill_level`: beginner | intermediate | advanced
- `course_type`: group | semi_private
- `day`: monday | tuesday | wednesday | thursday | friday | saturday | sunday

## Error Patterns e Fix

### Errore: Settings Null
**Causa**: Legacy products senza settings inizializzati
**Fix**: Auto-initialize in Service/Controller show() method

### Errore: Column Not Found
**Causa**: Migration rimuove colonna ma model ha ancora in $fillable/$casts
**Fix**: Rimuovere da entrambi gli array nel model

### Errore: Planning Undefined
**Causa**: TypeScript mismatch tra frontend e backend response
**Fix**: Aggiornare interface in types/index.d.ts

### Errore: Validazione Fallita
**Causa**: Vincoli backend più restrittivi di frontend
**Fix**: Allineare Yup schema con Laravel validation rules

## PriceLists & Subscriptions System

### Panoramica
Il sistema PriceLists gestisce tutti gli oggetti commerciali vendibili: abbonamenti, quote associative, articoli retail, ingressi giornalieri, token/carnets, gift cards. Usa STI (Single Table Inheritance) come i Products.

### Tipi PriceList (Enum)
- **FOLDER**: Cartella organizzativa (non vendibile)
- **ARTICLE**: Articolo retail (integratori, abbigliamento, etc.)
- **MEMBERSHIP**: Quota associativa annuale
- **SUBSCRIPTION**: Abbonamento (bundle di prodotti con regole)
- **DAY_PASS**: Ingresso giornaliero
- **TOKEN**: Token/Carnet (crediti prepagati, es. 10 ingressi)
- **GIFT_CARD**: Carta regalo

### Subscription Structure
Un **Subscription** è un contenitore che include:
- **Standard Contents**: Prodotti sempre inclusi (non opzionabili)
- **Optional Contents**: Prodotti che il cliente può scegliere

Ogni **SubscriptionContent** può avere regole specifiche indipendenti.

### SubscriptionContent - Campi Principali

#### Access Rules (Limitazioni Ingressi)
```php
unlimited_entries: boolean          // Accesso illimitato
total_entries: integer             // Totale ingressi (es. carnet 10 ingressi)
daily_entries: integer             // Max ingressi al giorno
weekly_entries: integer            // Max ingressi a settimana
monthly_entries: integer           // Max ingressi al mese
```

#### Booking Rules (Limitazioni Prenotazioni)
```php
max_concurrent_bookings: integer   // Max prenotazioni attive simultanee
daily_bookings: integer            // Max prenotazioni al giorno
weekly_bookings: integer           // Max prenotazioni a settimana
advance_booking_days: integer      // Anticipo massimo prenotazione
cancellation_hours: integer        // Ore prima per cancellare gratis
```

#### Validity Rules (Validità per Singolo Content)
```php
validity_type: enum               // 'duration' | 'fixed_date' | 'first_use'
validity_days: integer            // Durata in giorni
validity_months: integer          // Durata in mesi
valid_from: date                  // Data inizio validità (fixed_date)
valid_to: date                    // Data fine validità (fixed_date)
freeze_days_allowed: integer      // Giorni congelamento permessi
freeze_cost_cents: integer        // Costo mensile durante freeze
```

**Esempio pratico**: Abbonamento annuale sala pesi + corso promo 1 mese
- Content 1: "Sala Pesi" validity_type='duration', validity_months=12
- Content 2: "Corso Yoga Promo" validity_type='duration', validity_months=1

#### Time Restrictions (Fasce Orarie)
```php
has_time_restrictions: boolean    // Flag se ci sono restrizioni orarie

// Tabella subscription_content_time_restrictions:
days: array                       // ['monday', 'wednesday', 'friday']
start_time: time                  // '06:00'
end_time: time                    // '13:00'
restriction_type: enum            // 'allowed' | 'blocked'
description: string               // 'Abbonamento mattutino'
```

**Esempio**: Abbonamento "Solo Mattino" 06:00-13:00 Lun-Ven

#### Service Access (Servizi Inclusi/Esclusi)
```php
service_access_type: enum         // 'all' | 'included' | 'excluded'

// Tabella subscription_content_services (pivot):
product_id: FK                    // Quale prodotto/servizio
usage_limit: integer              // Limite uso specifico (opzionale)
usage_period: enum                // 'day' | 'week' | 'month'
```

**Esempi**:
- `service_access_type='all'`: Accesso a tutti i servizi
- `service_access_type='included'` + services=[Yoga, Pilates]: Solo questi corsi
- `service_access_type='excluded'` + services=[CrossFit]: Tutti tranne CrossFit

#### Benefits & Perks (Benefici Extra)
```php
guest_passes_total: integer       // Totale pass ospite annuali (es. 12)
guest_passes_per_month: integer   // Pass ospite al mese (es. 1)
multi_location_access: boolean    // Accesso a più sedi
discount_percentage: integer      // Sconto % su servizi extra (es. 10% PT)
```

#### Metadata
```php
sort_order: integer               // Ordine visualizzazione UI
settings: json                    // Regole custom/edge cases
```

### Casistiche Supportate

1. **Carnet Ingressi**: total_entries=10, validity_days=60
2. **Abbonamento Illimitato**: unlimited_entries=true, validity_months=12
3. **Abbonamento 3x/settimana**: weekly_entries=3, validity_months=3
4. **Abbonamento Mattutino**: has_time_restrictions=true, time_restrictions=['06:00-13:00 Lun-Ven']
5. **Promo Corso**: validity_months=1, service_access_type='included', services=[Yoga]
6. **Freeze Management**: freeze_days_allowed=30, freeze_cost_cents=1000 (10€/mese)
7. **Guest Passes**: guest_passes_total=12, guest_passes_per_month=1
8. **Multi-location**: multi_location_access=true
9. **Discounts**: discount_percentage=10 (10% su PT e retail)
10. **Class Credits**: total_entries=20 (20 sessioni), service_access_type='included'

### Database Tables

```
price_lists                              // Main table (STI)
├── subscription_contents                // Products in subscription
│   ├── subscription_content_services    // Specific services included/excluded
│   └── subscription_content_time_restrictions // Time-based access rules
```

### Relationships

```php
Subscription hasMany SubscriptionContents
SubscriptionContent morphTo price_listable (Product | PriceList)
SubscriptionContent belongsToMany Product via subscription_content_services
SubscriptionContent hasMany SubscriptionContentTimeRestrictions
```

## Work In Progress

### Completato ✅

**Products**:
1. ✅ BookableService tabs complete (Bookings, Availability, Sale)
2. ✅ CourseProduct tabs complete (Timetable con auto-naming, Bookings, Sale)
3. ✅ BaseProduct tabs complete (General, Schedule, Sale)
4. ✅ Time slots personalizzati per BookableService
5. ✅ Validazioni frontend (Yup) e backend (Laravel) complete

**PriceLists**:
6. ✅ **Token PriceList 100% completo**:
   - Tab Generale con product selector (Base, Corsi, BookableService)
   - Tab Prenotazioni con auto-copy valori da BookableService
   - Tab Validità con configurazione avanzata
   - Tab Vendita ridisegnata con layout moderno
7. ✅ **Folder PriceList 100% completo**:
   - Tab Generale con selezione parent gerarchico
   - Tab Vendita ridisegnata
   - Modal selezione cartella completamente ridisegnato
8. ✅ **DayPass PriceList 100% completo**:
   - Tab Generale con layout moderno, validazioni Yup
   - Tab Vendita con SaleForm standardizzato
   - Controller con validazioni complete
   - Riepilogo dinamico con info principali
9. ✅ **GiftCard PriceList 100% completo**:
   - Tab Generale con validità in mesi, layout moderno
   - Tab Vendita con SaleForm standardizzato
   - Controller con validazioni complete (validity_months 1-120)
   - Riepilogo dinamico con valore e validità
10. ✅ Subscription con modal selezione contenuti (8 tab organizzati)
11. ✅ Article e Membership con tab Generale e Vendita

**UI/UX**:
10. ✅ Layout pattern consolidati e documentati
11. ✅ Modal dialogs con design coerente
12. ✅ Icone distintive per tutti i PriceList types
13. ✅ Alert informativi e riepilogo dinamici
14. ✅ Validation messages in italiano

**Backend**:
15. ✅ Auto-copy pattern per valori ereditati (Token + BookableService)
16. ✅ Settings preservation pattern applicato ovunque
17. ✅ Circular reference protection (Folder parent)
18. ✅ Validation completa con error messages

### Da Fare 📋

**PriceLists**:
1. SubscriptionComposer - UI per gestire contents standard/opzionali

**Products**:
4. Gestione istruttori/sale per time slots BookableService
5. Blackout dates per BookableService availability
6. Equipment list management per CourseProduct materials
7. Next level course selection per CourseProduct progression
8. Prerequisites management per corsi

**Testing**:
9. Feature tests per tutti i controller PriceList
10. Unit tests per auto-generation logic
11. E2E tests per flussi vendita

**Future Enhancements**:
- Calendar view per planning visualization
- Booking conflict detection logic
- Capacity management per time slots
- Reporting per utilizzo servizi/corsi
- Integration con payment system
- Gestione CustomerToken (vendita/utilizzo Token)
- Booking system per BookableService
- **PriceListRules System** (vedi sezione dedicata)

## PriceListRules - Future Feature (FASE 2)

### Stato Attuale
La tabella `price_list_rules` esiste nel database ma **NON è implementata**. È una feature di Fase 2.

### Scopo
Sistema di **regole condizionali avanzate** per applicare logiche business complesse sui PriceLists:
- Sconti/promozioni condizionali per gruppi clienti
- Prezzi dinamici per fasce orarie
- Limitazioni acquisto basate su membership
- Sconti quantità/fedeltà
- Regole combinate con priorità

### Struttura Tabella
```php
price_list_rules:
  - price_list_id (FK)
  - rule_type (string: 'discount', 'restriction', 'time_based', etc.)

  // Condizioni
  - customer_group_ids (json array)
  - facility_ids (json array)
  - valid_from_date / valid_to_date
  - valid_days_of_week (json)
  - valid_time_slots (json)
  - min_quantity / max_quantity
  - min_total_amount / max_total_amount (Money)
  - min_membership_months
  - customer_registration_after
  - custom_conditions (json)

  // Priorità
  - priority (integer)
  - can_combine_with_other_rules (boolean)
  - is_active (boolean)
```

### Casi d'Uso

**1. Sconto Studenti**
```php
rule_type: 'customer_group_discount'
customer_group_ids: [gruppo_studenti_id]
discount_percentage: 20  // ⚠️ Campo mancante da aggiungere
```

**2. Abbonamento Solo Mattino Scontato**
```php
rule_type: 'time_based_pricing'
valid_time_slots: ['06:00-13:00']
valid_days_of_week: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
discount_percentage: 30
```

**3. Limitazione Acquisto PT**
```php
rule_type: 'purchase_restriction'
customer_group_ids: [gruppo_premium_id]
min_membership_months: 3
// Solo membri premium con almeno 3 mesi possono comprare
```

**4. Sconto Quantità Token**
```php
rule_type: 'quantity_discount'
min_quantity: 5
discount_percentage: 10
// 10% sconto se compri 5+ token
```

**5. Fedeltà Long-term**
```php
rule_type: 'loyalty_discount'
customer_registration_after: '2023-01-01'
discount_percentage: 15
// 15% sconto se cliente dal 2023 o prima
```

### Problemi da Risolvere Prima dell'Implementazione

**1. Campi Mancanti**
La tabella ha condizioni ma non azioni:
```php
// DA AGGIUNGERE:
discount_percentage: integer nullable
discount_fixed_amount: integer nullable (Money)
override_price: integer nullable (Money)
action_type: enum ('discount', 'override', 'restrict')
```

**2. Enum rule_type da Definire**
```php
enum RuleType: string {
    case CUSTOMER_GROUP_DISCOUNT = 'customer_group_discount';
    case TIME_BASED_PRICING = 'time_based_pricing';
    case QUANTITY_DISCOUNT = 'quantity_discount';
    case LOYALTY_DISCOUNT = 'loyalty_discount';
    case PURCHASE_RESTRICTION = 'purchase_restriction';
    case MEMBERSHIP_REQUIREMENT = 'membership_requirement';
}
```

**3. Logica Applicazione Rules**
```php
// Service da creare: PriceListRuleEngine
class PriceListRuleEngine
{
    public function getApplicableRules(PriceList $priceList, Customer $customer): Collection
    {
        // Filter rules by conditions
        // Sort by priority
        // Handle can_combine_with_other_rules
        // Return applicable rules
    }

    public function calculateFinalPrice(PriceList $priceList, Customer $customer, int $quantity = 1): int
    {
        // Apply all applicable rules
        // Respect priority and combination logic
        // Return final price in cents
    }
}
```

**4. Decisioni Business**
- Come si combinano più rules applicabili?
- Quale ha precedenza se priority uguale?
- Come mostrare al cliente quale sconto si sta applicando?
- Come gestire conflitti tra rules?

### Quando Implementare

**✅ Prerequisiti**:
1. Sistema vendita base completo (Sales, CustomerSales, Payments)
2. Customer groups/segmentation implementato
3. Almeno 1 mese di operatività con dati reali
4. Feedback utenti che richiede questa complessità

**🚨 Segnali che Servono**:
- Richieste ripetute per sconti condizionali
- Necessità di prezzi diversi per gruppi clienti
- Limitazioni acquisto complesse
- Pricing dinamico per fasce orarie

**❌ NON Implementare Se**:
- Il 90% casi si risolve con `saleable_from/to`
- Sconti gestibili con codici coupon
- Gruppi clienti bastano per segmentazione
- Nessun business case reale

### Alternative Semplici (Fase 1)

**Per Sconti/Promozioni Immediate**:
```php
// Aggiungi a price_lists:
promotional_price: integer nullable (Money)
promotion_valid_from: date nullable
promotion_valid_to: date nullable
```

**Per Limitazioni Base**:
```php
// Controller validation:
if (!$customer->canPurchase($priceList)) {
    throw ValidationException::withMessages([
        'customer' => 'Non hai i requisiti per acquistare questo listino'
    ]);
}
```

**Per Gruppi Clienti**:
```php
// customers table:
customer_group_id: FK nullable

// Logica pricing:
if ($customer->customer_group_id === CustomerGroup::STUDENT) {
    $price = $priceList->student_price ?? $priceList->price;
}
```

### Roadmap Implementazione (Quando Necessario)

**Fase 1: Database**
1. Migration per aggiungere campi azione (discount_percentage, etc.)
2. Creare RuleTypeEnum
3. Factory e Seeder per testing

**Fase 2: Backend**
1. PriceListRuleService per logica applicazione
2. Controller per CRUD rules
3. Validation rules complete
4. Feature tests

**Fase 3: Frontend**
1. UI per gestione rules in PriceList detail
2. Preview pricing con rules applicate
3. Badge/alert per mostrare regole attive
4. Modal per creare/modificare rules

**Fase 4: Integrazione**
1. Applicare rules nel processo vendita
2. Mostrare sconti applicati in checkout
3. Reporting su utilizzo rules
4. Audit log per tracking applicazioni

### Conclusione

Le `price_list_rules` sono una **feature di ottimizzazione avanzata** da rimandare a Fase 2. La tabella rimane vuota fino a business case concreto. Focus Fase 1: completare sistema vendita base e raccogliere feedback reale.

## Commands Utili

```bash
# Testing
php artisan test                                    # All tests
php artisan test --filter=testName                  # Specific test
php artisan test tests/Feature/ExampleTest.php      # Single file

# Code Quality
vendor/bin/pint --dirty                             # Format changed files
vendor/bin/pint                                     # Format all

# Artisan
php artisan make:test --pest TestName               # Create feature test
php artisan make:test --pest --unit TestName        # Create unit test
php artisan make:class ClassName                    # Create generic class
php artisan make:class --invokable ControllerName   # Invokable controller

# Tenancy
php artisan tenants:list                            # List all tenants
php artisan tenants:run "command"                   # Run command on all tenants

# Frontend
npm run build                                       # Production build
npm run dev                                         # Dev server
composer run dev                                    # Laravel + Vite dev
```

## Git Workflow

### Commit Message Format
```
<type>: <short description>

<detailed description with context>

Features/Changes:
- Bullet point 1
- Bullet point 2

Technical notes if needed.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Branch Strategy
- `main` - production-ready code
- `refactor-backup-2025-07-19` - current development branch
- Feature branches quando necessario

### Commit Frequency
- Ogni feature completa e testata
- Dopo validazioni aggiunte
- Dopo fix di bug
- Prima di switch di contesto

## Troubleshooting

### Frontend non si aggiorna
1. Check `npm run build` o `npm run dev` running
2. Check Inertia asset version in app.blade.php
3. Clear browser cache

### Settings non si salvano
1. Verify settings preservation in onSubmit
2. Check backend validation rules
3. Verify HasSettings trait su model

### TypeScript errors
1. Check types/index.d.ts matches backend response
2. Verify optional chaining per nullable fields
3. Run `npm run build` per vedere errori completi

### Validation errors non mostrati
1. Verify validationSchema presente in FormikConfig
2. Check FormFeedback/TabContainer integrato
3. Verify backend validation messages tornano correttamente

## Note Finali

Questo file va aggiornato quando:
- Nuovi pattern vengono stabiliti
- Convenzioni cambiano
- Nuove feature core vengono aggiunte
- Bug critici vengono risolti con pattern da ricordare

**Filosofia**: Codice pulito, pattern consistenti, testing quando possibile, commit frequenti, comunicazione diretta.
