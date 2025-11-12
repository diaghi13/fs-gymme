# Project Guidelines - FS Gymme

## Panoramica Progetto

**FS Gymme** è un sistema di gestione multi-tenant per palestre/centri sportivi costruito con:
- **Backend**: Laravel 12 (struttura streamlined)
- **Frontend**: React 19 + Inertia.js v2 + TypeScript
- **UI**: Material-UI v6 (Grid component)
- **Multi-tenancy**: Stancl Tenancy con database separati
- **Database**: SQLite per tenant (dev), supporto PostgreSQL/MySQL
- **Pattern**: Single Table Inheritance (STI) con package Parental per Product types
- **Fatturazione Elettronica**: Sistema completo FatturaPA v1.9 per Italia (SDI)

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
1. **Generale** - Nome, folder, colore, prezzo, IVA, (months_duration per Membership)
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

## Sales & Electronic Invoicing System

### Panoramica
Sistema completo di vendite e fatturazione elettronica conforme alle normative italiane 2025:
- **Fatturazione Elettronica XML v1.9** (obbligatoria fino al 2027)
- **Sistema di Interscambio (SdI)** - Invio/ricezione fatture via PEC o web service
- **Conservazione Sostitutiva Digitale** - 10 anni obbligatori per legge
- **GDPR Compliance** - Retention policies fiscali (10 anni) e marketing (personalizzabili)
- **Multi-documento**: Fatture, Note di Credito, Note di Debito, Auto-fatture

### Architettura Database

#### Sales Table (Vendite)
Tabella principale per tutte le transazioni commerciali:

```php
sales:
  // Identificazione
  - id, uuid, sdi_transmission_id (identificativo SDI univoco)

  // Numerazione
  - progressive_number (es: "FT2025/001")
  - progressive_number_prefix (es: "FT", "NC", "ND")
  - progressive_number_value (numero sequenziale)
  - year (anno fiscale)

  // Relazioni
  - structure_id (FK structures)
  - customer_id (FK customers)
  - document_type_id (FK document_types)
  - document_type_electronic_invoice_id (FK document_type_electronic_invoices)
  - payment_condition_id (FK payment_conditions)
  - financial_resource_id (FK financial_resources)
  - promotion_id (FK promotions) nullable

  // Contenuto
  - description
  - causale (obbligatorio per fattura elettronica)
  - date (data emissione)
  - currency (default: EUR)
  - notes

  // Importi e sconti
  - discount_percentage (MoneyCast)
  - discount_absolute (MoneyCast)

  // Ritenuta d'acconto
  - withholding_tax_amount (MoneyCast)
  - withholding_tax_rate (decimal 2)
  - withholding_tax_type (es: "RT01", "RT02")

  // Bollo
  - stamp_duty_amount (MoneyCast)

  // Cassa previdenziale
  - welfare_fund_type (es: "TC01", "TC02")
  - welfare_fund_rate (decimal 2)
  - welfare_fund_amount (MoneyCast)
  - welfare_fund_taxable_amount (MoneyCast)
  - welfare_fund_vat_rate_id (FK vat_rates)

  // Stati
  - status (draft, completed, cancelled)
  - payment_status (pending, paid, partial, not_paid)
  - accounting_status (pending, accounted, not_accounted)
  - exported_status (pending, exported, not_exported)
  - electronic_invoice_status (ElectronicInvoiceStatusEnum)

  // SDI Tracking
  - sdi_sent_at
  - sdi_received_at
  - sdi_notification_type (SdiNotificationTypeEnum: RC, NS, MC, NE, DT, AT)
  - sdi_notification_message
  - electronic_invoice_xml_path

  // GDPR & Retention
  - fiscal_retention_until (10 anni da emissione)

  // Timestamps
  - created_at, updated_at, deleted_at (SoftDeletes)
```

#### ElectronicInvoices Table
Gestione completa del ciclo di vita della fattura elettronica:

```php
electronic_invoices:
  - id
  - sale_id (FK sales, cascade delete)

  // XML
  - xml_content (LONGTEXT, contenuto completo)
  - xml_version (default: "1.9")
  - xml_file_path (storage path)

  // Trasmissione SDI
  - transmission_id (univoco, generato es: "IT01234567890_00001")
  - transmission_format (default: "FPR12")
  - send_attempts (contatore tentativi)
  - last_send_attempt_at

  // Stati SDI
  - sdi_status (ElectronicInvoiceStatusEnum)
  - sdi_status_updated_at
  - sdi_receipt_xml (LONGTEXT, ricevute SDI)
  - sdi_error_messages (errori validazione)

  // Conservazione Sostitutiva
  - preserved_at
  - preservation_hash (hash per integrità)
  - preservation_provider (es: "AgenziaEntrate", "Aruba")
  - preservation_reference_id (ID conservatore)
  - signed_pdf_path (PDF firmato)

  // Timestamps
  - created_at, updated_at, deleted_at (SoftDeletes)
```

#### DataRetentionPolicies Table
Policy GDPR per conservazione/cancellazione dati:

```php
data_retention_policies:
  - id
  - structure_id (FK structures) nullable

  // Retention Periods
  - fiscal_retention_years (default: 10, obbligatorio per legge)
  - marketing_retention_months (personalizzabile, nullable)
  - customer_inactive_retention_months (default: 24)

  // Cleanup Automation
  - auto_delete_after_retention (boolean, default: false)
  - auto_anonymize_after_retention (boolean, default: true)
  - last_cleanup_at
  - last_cleanup_records_count

  // Notifications
  - notify_before_cleanup (boolean, default: true)
  - notify_days_before (default: 30)

  // Timestamps
  - created_at, updated_at
```

### Enums

#### ElectronicInvoiceStatusEnum
Stati del ciclo di vita fattura elettronica:

```php
enum ElectronicInvoiceStatusEnum: string
{
    case DRAFT = 'draft';                     // Bozza, non ancora generata
    case GENERATED = 'generated';             // XML generato, pronto per invio
    case TO_SEND = 'to_send';                // In coda per invio
    case SENDING = 'sending';                // In fase di invio
    case SENT = 'sent';                      // Inviata al SdI
    case ACCEPTED = 'accepted';              // Accettata dal SdI (ricevuta RC)
    case DELIVERED = 'delivered';            // Consegnata al destinatario (MC positiva)
    case REJECTED = 'rejected';              // Rifiutata dal SdI (notifica NS)
    case DELIVERY_FAILED = 'delivery_failed'; // Mancata consegna (MC negativa)
    case CANCELLED = 'cancelled';            // Annullata

    // Helper methods:
    public function label(): string;         // Label italiana
    public function color(): string;         // Colore UI (gray, blue, green, red, etc.)
    public function isFinal(): bool;         // Se stato finale
    public function canResend(): bool;       // Se può essere re-inviata
}
```

#### SdiNotificationTypeEnum
Tipi di notifiche ufficiali dal Sistema di Interscambio:

```php
enum SdiNotificationTypeEnum: string
{
    case RC = 'RC';  // Ricevuta di Consegna - Successo
    case NS = 'NS';  // Notifica di Scarto - Errori formali
    case MC = 'MC';  // Mancata Consegna - Destinatario irraggiungibile
    case NE = 'NE';  // Notifica Esito - Accettazione/rifiuto destinatario
    case DT = 'DT';  // Decorrenza Termini - Accettazione implicita
    case AT = 'AT';  // Attestazione di Trasmissione

    // Helper methods:
    public function label(): string;
    public function description(): string;
    public function isPositive(): bool;      // RC, DT, AT
    public function isNegative(): bool;      // NS, MC
    public function requiresAction(): bool;  // NS, MC (richiedono intervento)
}
```

### Models

#### Sale Model
```php
class Sale extends Model
{
    use HasFactory, HasStructure, SoftDeletes;

    // Relationships
    public function customer(): BelongsTo;
    public function rows(): HasMany;              // SaleRow
    public function payments(): HasMany;           // Payment
    public function electronic_invoice(): HasOne;  // ElectronicInvoice
    public function document_type(): BelongsTo;
    public function document_type_electronic_invoice(): BelongsTo;
    public function payment_condition(): BelongsTo;
    public function financial_resource(): BelongsTo;
    public function welfare_fund_vat_rate(): BelongsTo; // VatRate

    // Accessors (già implementati)
    public function getTotalPriceAttribute(): float;
    public function getSummaryDataAttribute(): array;  // Raggruppamento IVA
    public function getSummaryAttribute(): array;      // Totali/pagato/dovuto
    public function getSaleSummaryAttribute(): array;  // Dettaglio completo
}
```

#### ElectronicInvoice Model
```php
class ElectronicInvoice extends Model
{
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'sdi_status' => ElectronicInvoiceStatusEnum::class,
            'sdi_status_updated_at' => 'datetime',
            'preserved_at' => 'datetime',
            'last_send_attempt_at' => 'datetime',
            'send_attempts' => 'integer',
        ];
    }

    // Relationships
    public function sale(): BelongsTo;

    // Helper Methods
    public function isPreserved(): bool;
    public function canSend(): bool;
    public function canResend(): bool;
    public function isFinal(): bool;
    public function updateStatus(ElectronicInvoiceStatusEnum $status, ?string $message = null): void;
    public function incrementSendAttempts(): void;
}
```

#### DataRetentionPolicy Model
```php
class DataRetentionPolicy extends Model
{
    use HasFactory, HasStructure;

    public function getFiscalRetentionDate(): Carbon;      // now - 10 anni
    public function getMarketingRetentionDate(): ?Carbon;  // now - X mesi
    public function getCustomerInactiveRetentionDate(): Carbon; // now - 24 mesi
}
```

### Services (Da Implementare)

#### ElectronicInvoiceService
Generazione XML v1.9 conforme:

```php
class ElectronicInvoiceService
{
    public function generateXml(Sale $sale): string;
    public function validateXml(string $xml): array;
    public function sendToSdi(Sale $sale): bool;
    public function processReceiptXml(string $xml): void;
}
```

**Specifiche XML v1.9** (Effettive dal 1 Aprile 2025):
- Nuovi document types: **TD29** (irregolarità fatturazione)
- Nuovo regime fiscale: **RF20** (esenzione IVA transfrontaliera)
- Header: FatturaElettronicaHeader (dati cedente/cessionario)
- Body: FatturaElettronicaBody (righe, IVA, totali, ritenute, bollo, cassa)

**Mapping Dati**:
```
Sale → XML FatturaPA

CedentePrestatore:
  - Tenant.vat_number → IdFiscaleIVA
  - Tenant.pec_email → PECDestinatario
  - Tenant.sdi_code → CodiceDestinatario
  - Tenant.tax_code, name, address, etc.

CessionarioCommittente:
  - Customer.tax_id_code, vat_number
  - Customer.first_name, last_name, email, address

DatiGenerali:
  - Sale.progressive_number → Numero
  - Sale.date → Data
  - Sale.document_type_electronic_invoice.code → TipoDocumento
  - Sale.causale → Causale

DatiRiepilogo (per ciascuna aliquota IVA):
  - Raggruppamento SaleRows per vat_rate
  - ImponibileImporto, Aliquota, Imposta
  - Natura (N1-N7 se IVA 0%)

DatiPagamento:
  - Payment.payment_method → ModalitaPagamento
  - Payment.due_date, amount

DatiRitenuta:
  - Sale.withholding_tax_* → DatiRitenuta

DatiBollo:
  - Sale.stamp_duty_amount → BolloVirtuale

DatiCassaPrevidenziale:
  - Sale.welfare_fund_* → DatiCassaPrevidenziale
```

#### ProgressiveNumberService
Generazione numerazione thread-safe:

```php
class ProgressiveNumberService
{
    public function getNext(string $documentType, int $year, int $structureId): string;
    // Thread-safe con DB transactions/locks
    // Esempio output: "FT2025/0001", "NC2025/0001"
}
```

#### ConservazioneService
Conservazione sostitutiva a norma:

```php
class ConservazioneService
{
    public function preserve(Sale $sale): void;
    public function verifyPreservation(Sale $sale): bool;
    public function schedulePreservation(): void;
    public function integrateCertifiedProvider(): void; // Aruba, InfoCert, etc.
}
```

**Obblighi Legali**:
- Conservazione **10 anni** obbligatoria (emittente + destinatario)
- Deadline: **3 mesi** dalla scadenza dichiarazione annuale
- Garanzie: **Integrità, autenticità, leggibilità, disponibilità**
- Provider: Agenzia delle Entrate (gratuito) o conservatori accreditati

#### DataRetentionService
GDPR compliance automatica:

```php
class DataRetentionService
{
    public function calculateRetentionDate(Customer|Sale $model): Carbon;
    public function cleanupExpiredData(): void;      // Scheduled job
    public function anonymizeExpiredData(): void;    // Alternative to deletion
}
```

**Logica**:
- Dati fiscali (Sales): `sale.date + 10 anni`
- Dati marketing (Customers): configurabile per struttura
- Clienti inattivi: `last_activity + 24 mesi` (default)

#### Validators
Validazione P.IVA e Codice Fiscale:

```php
class VatNumberValidator
{
    public function validate(string $vatNumber, ?string $country = 'IT'): bool;
    public function validateVies(string $vatNumber): bool; // Verifica partita IVA europea
}

class TaxCodeValidator
{
    public function validate(string $taxCode): bool; // Algoritmo ufficiale italiano
}
```

### Scheduled Jobs (Da Implementare)

```php
// app/Console/Kernel.php o routes/console.php

Schedule::command('invoices:process-sdi-receipts')->everyFifteenMinutes();
Schedule::command('invoices:preserve-due')->daily();
Schedule::command('data:cleanup-expired')->weekly();
Schedule::command('data:notify-cleanup-upcoming')->monthly();
```

**Jobs**:
1. **ProcessSdiReceipts** - Controlla PEC per nuove ricevute SdI (ogni 15 min)
2. **PreserveInvoices** - Conservazione automatica fatture (giornaliero)
3. **CleanupExpiredData** - Cancellazione/anonimizzazione dati scaduti (settimanale)
4. **NotifyCleanupUpcoming** - Alert per scadenze prossime (mensile)

### Package Esterni Consigliati

1. **devcode-it/fattura-elettronica-xml** o **taocomp/php-e-invoice-it**
   - Generazione/validazione XML FatturaPA
   - Già conformi specifiche italiane

2. **spatie/laravel-data**
   - DTOs type-safe per mapping Sale → XML

3. **league/flysystem** con driver S3
   - Storage sicuro per XML/PDF

4. **Package PEC/Email** per invio SdI
   - Oppure web service FatturaPA.gov.it

### Priorità Implementazione

**FASE 1 - CRITICO** (Prima del 1 Aprile 2025): ✅ COMPLETATA
1. ✅ Migration database (sales, electronic_invoices, data_retention_policies)
2. ✅ Enums (ElectronicInvoiceStatusEnum, SdiNotificationTypeEnum)
3. ✅ Models (Sale, ElectronicInvoice, DataRetentionPolicy) con relationships
4. ✅ Formattazione codice con Pint

**FASE 2 - ALTA** (Q1 2025):
5. ElectronicInvoiceService - Generazione XML v1.9
6. ProgressiveNumberService - Numerazione automatica
7. Validators (P.IVA, Codice Fiscale)
8. SdiService - Invio manuale via PEC (MVP)

**FASE 3 - MEDIA** (Q2 2025):
9. Integrazione automatica SdI
10. Gestione ricevute e stati
11. ConservazioneService base
12. UI/UX per fatture elettroniche

**FASE 4 - BASSA** (Q3 2025):
13. Note di credito/debito
14. Auto-conservazione schedulata
15. Integrazione conservatore accreditato
16. Fatture semplificate B2C
17. Auto-fatture reverse charge

### Normativa di Riferimento

**GDPR** (Regolamento UE 2016/679):
- Dati fiscali/contrattuali: 10 anni (Art. 2220 Codice Civile, Art. 39 DPR 633/1972)
- Dati marketing: Consenso esplicito, retention personalizzabile
- Obbligo cancellazione/anonimizzazione post-retention

**Fatturazione Elettronica**:
- Obbligatoria fino al 2027 (inclusi forfettari)
- Sistema di Interscambio (SdI) - validazione centralizzata
- XML formato v1.9 effettivo dal 1 Aprile 2025
- Nuovi codici: TD29, RF20

**Conservazione Sostitutiva**:
- 10 anni obbligatori (emittente + destinatario)
- Garanzie: integrità, autenticità, leggibilità, disponibilità
- Deadline: 3 mesi da scadenza dichiarazione annuale
- Provider: AgE (gratuito) o privati accreditati

### Migration Eseguite

```bash
# Tenant migrations (già applicate con tenants:migrate)
✅ 2025_11_08_094204_add_electronic_invoice_fields_to_sales_table.php
✅ 2025_11_08_094233_create_electronic_invoices_table.php
✅ 2025_11_08_094254_create_data_retention_policies_table.php
```

**Modifiche Strutturali**:
- `sale_number` → `progressive_number`
- `sale_date` → `date`
- +22 nuovi campi nella tabella `sales`
- Nuova tabella `electronic_invoices` (gestione completa XML/SDI)
- Nuova tabella `data_retention_policies` (GDPR)

### Testing

**Test da Creare**:
```php
// Feature Tests
tests/Feature/ElectronicInvoice/
  - XmlGenerationTest.php
  - SdiTransmissionTest.php
  - ReceiptProcessingTest.php
  - ConservazioneTest.php

tests/Feature/DataRetention/
  - RetentionPolicyTest.php
  - CleanupServiceTest.php
  - AnonymizationTest.php

// Unit Tests
tests/Unit/Services/
  - ProgressiveNumberServiceTest.php
  - VatNumberValidatorTest.php
  - TaxCodeValidatorTest.php
```

### Riferimenti Tecnici

**Specifiche XML FatturaPA**:
- [Agenzia delle Entrate - Specifiche Tecniche v1.9](https://www.agenziaentrate.gov.it/portale/web/guest/specifiche-tecniche-versione-1-9)
- XSD Validation Schema
- Codici documento (TD01-TD29)
- Nature IVA (N1-N7)
- Regimi fiscali (RF01-RF20)

**Sistema di Interscambio**:
- Endpoint PEC: sdi01@pec.fatturapa.it (produzione)
- Formato trasmissione: FPR12 (PA), FPA12 (PA), FSM10 (semplificata)
- Ricevute: RC, NS, MC, NE, DT, AT

**Conservazione**:
- [DPCM 3 dicembre 2013](https://www.gazzettaufficiale.it/eli/id/2014/03/12/14A01820/sg)
- Standard UNI 11386:2020
- Provid er accreditati AgID

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

## Sistema di Vendita e Fatturazione Elettronica

### Architettura del Sistema di Vendita

Il sistema di vendita è progettato per **velocità operativa in backoffice**, utilizzato dallo staff della palestra per processare vendite in loco tra un cliente e l'altro.

#### Componenti Backend

**SaleService** (`app/Services/Sale/SaleService.php`):
- `calculateRowTotal()` - Calcolo totale riga con sconti percentuali + assoluti
- `calculateSaleTotal()` - Totale vendita con sconti a livello vendita
- `calculateExpirationDate()` - Calcolo automatico scadenze abbonamenti
- `calculateInstallments()` - Generazione rate con distribuzione corretta del resto
- `quickCalculate()` - Calcolo real-time per UI (imponibile + IVA + totale)
- `getSubscriptionContents()` - Gestione contenuti standard + opzionali abbonamenti

**Regole di Calcolo**:
- Tutti i valori monetari in **centesimi** (integers) per evitare errori floating-point
- Ordine applicazione sconti: `percentuale prima, assoluto dopo`
- Sconto riga applicato prima, sconto vendita dopo
- Resto rate sempre sulla prima rata
- Totali negativi automaticamente a zero

**API Endpoints** (routes/tenant/web/routes.php):
```php
POST /sales/quick-calculate         // Calcolo real-time totali
POST /sales/calculate-installments  // Generazione rate automatica
POST /sales/subscription-contents   // Contenuti abbonamento con opzionali
```

#### Componenti Frontend (React + Inertia)

**Custom Hooks**:

**useQuickCalculate** (`resources/js/hooks/useQuickCalculate.ts`):
```typescript
const { result, isCalculating, error, calculate } = useQuickCalculate(300);
// Debounced API calls (300ms default)
// Returns: { subtotal, tax_total, total } in cents
```

**useCalculateInstallments** (`resources/js/hooks/useCalculateInstallments.ts`):
```typescript
const { installments, isCalculating, error, generateInstallments } = useCalculateInstallments();
await generateInstallments({
  total_amount: 10000, // cents
  installments_count: 3,
  first_due_date: '2025-01-15',
  days_between_installments: 30
});
```

**useKeyboardShortcuts** (`resources/js/hooks/useKeyboardShortcuts.ts`):
```typescript
useKeyboardShortcuts([
  { key: 'F2', handler: () => focusCustomerSearch() },
  { key: 'F3', handler: () => focusProductSearch() },
  { key: 'F4', handler: () => goToPayments() },
  { key: 'F9', handler: () => goToSummary() },
]);
```

**Componenti UI Migliorati**:

**Cart Component** (`resources/js/components/sales/Cart.tsx`):
- Integrazione API real-time per calcoli server-side
- Debouncing automatico (300ms)
- Skeleton loading durante calcolo
- Display: Imponibile | IVA | TOTALE
- Formato valuta italiana (€ 100,00)

**PaymentCard Component** (`resources/js/components/sales/cards/PaymentCard.tsx`):
- **Quick Action Buttons**: Unica soluzione, 2/3/6/12 rate
- Generazione automatica rate via API backend
- Distribuzione resto corretta (prima rata)
- Supporto pagamenti flessibili (1-12 rate)

**QuickProductSearch Component** (`resources/js/components/sales/QuickProductSearch.tsx`):
- Autocomplete veloce per ricerca prodotti
- Ricerca per nome o codice
- Chip colorate per tipo (Abbonamento, Tessera, Articolo, etc.)
- Preview prezzo
- Focus con F3

**Keyboard Shortcuts Backoffice**:
- `F2` - Focus cliente
- `F3` - Focus ricerca prodotto
- `F4` - Vai a pagamenti
- `F9` - Vai a riepilogo
- Snackbar hint visivo quando usati

### Workflow Vendita Veloce

1. **Selezione Cliente** (F2)
   - Autocomplete clienti esistenti
   - Campo focus rapido con shortcut

2. **Aggiunta Prodotti** (F3)
   - **Ricerca veloce**: Autocomplete con preview
   - **Esplora albero**: Navigazione listini tradizionale
   - Gestione contenuti opzionali abbonamenti

3. **Calcolo Real-time**
   - Debounced API calls (300ms)
   - Server-side calculations per accuratezza
   - Display continuo: Imponibile + IVA + Totale

4. **Pagamenti Flessibili** (F4)
   - Quick actions: 1/2/3/6/12 rate con un click
   - Calcolo personalizzato con dialog
   - Generazione automatica via backend API

5. **Riepilogo e Salvataggio** (F9)
   - Review completo vendita
   - Salvataggio con validazione

### Sistema Fatturazione Elettronica Italiana

#### ElectronicInvoiceService (`app/Services/Sale/ElectronicInvoiceService.php`)

Genera XML conforme a **FatturaPA v1.9** (valido dal 1 Aprile 2025):

**Metodi Principali**:
- `generateXml()` - Genera fattura XML completa
- `buildDatiTrasmissione()` - Dati trasmissione SDI
- `buildCedentePrestatore()` - Dati cedente (palestra)
- `buildCessionarioCommittente()` - Dati cliente
- `buildDatiBeniServizi()` - Righe dettaglio con IVA
- `buildDatiPagamento()` - Condizioni pagamento

**Supporto Completo**:
- Ritenuta d'acconto
- Marca da bollo
- Cassa previdenziale
- Riepilogo IVA per aliquota
- Split payment
- Reverse charge
- Esigibilità IVA differita

#### ProgressiveNumberService (`app/Services/Sale/ProgressiveNumberService.php`)

Gestione **thread-safe** numerazione progressiva fatture:

```php
public function generateNext(int $year, ?string $prefix = null): array
{
    return DB::transaction(function () use ($year, $prefix) {
        // lockForUpdate() prevents concurrent duplicate numbers
        $maxValue = Sale::query()
            ->where('year', $year)
            ->lockForUpdate()
            ->max('progressive_number_value') ?? 0;

        return [
            'progressive_number' => $this->formatProgressiveNumber($maxValue + 1, $prefix),
            'progressive_number_value' => $maxValue + 1,
            'year' => $year,
        ];
    });
}
```

**Caratteristiche**:
- Locking pessimistico per prevenire duplicati
- Reset automatico annuale
- Supporto prefissi (es. NC per note di credito)
- Validazione integrità sequenza
- Statistiche per anno

#### Validatori Fiscali Italiani

**ItalianVatNumberValidator** (`app/Support/Validators/ItalianVatNumberValidator.php`):
- Validazione P.IVA con algoritmo di Luhn
- Formattazione con prefisso IT
- Estrazione codice provincia
- Verifica VIES per UE
- Generazione P.IVA test valide

**ItalianTaxCodeValidator** (`app/Support/Validators/ItalianTaxCodeValidator.php`):
- Validazione Codice Fiscale persone fisiche (16 caratteri)
- Validazione CF aziende (11 cifre = P.IVA)
- Estrazione dati: cognome, nome, data nascita, sesso, comune
- Generazione codici nome/cognome
- Algoritmo check character completo

### Testing del Sistema Vendita

**SaleServiceTest** (`tests/Feature/Services/Sale/SaleServiceTest.php`):
- 18 tests, 35 assertions
- Coverage: Sconti, Date, Rate, Calcoli rapidi
- Casi edge: totali negativi, resto rate, precision

**ItalianValidatorsTest** (`tests/Feature/Support/Validators/ItalianValidatorsTest.php`):
- 15 tests, 48 assertions
- Validazione P.IVA e CF
- Estrazione dati CF
- Generazione codici

### Best Practices Vendita

1. **Sempre calcoli server-side** - Mai duplicare logica calcolo in frontend
2. **Debouncing appropriato** - 300ms per quick-calculate (evita chiamate eccessive)
3. **Money as integers** - Tutti i valori monetari come integers (in euro, non centesimi)
4. **Thread-safe numbering** - `lockForUpdate()` per progressive numbers
5. **Keyboard first** - Shortcuts per velocizzare workflow staff
6. **Real-time feedback** - Skeleton + loading states durante calcoli
7. **Error handling** - Alert visibili per errori calcolo/API

### Convenzioni Prezzi (IMPORTANTE!)

**I prezzi sono memorizzati come `integer` nel database, ma rappresentano EURO (non centesimi):**

```php
// Database (migrations)
$table->integer('price'); // Es: 35 = €35.00, 100 = €100.00

// Model casting
protected $casts = [
    'price' => 'integer', // Stored as euros (35, 100, etc.)
];
```

**Frontend - Backend Flow:**
```typescript
// Backend API restituisce prezzi in euro (integer)
{ price: 35 }  // = €35.00

// Frontend riceve e usa direttamente
const unitPrice = priceList.price; // 35

// Display formatting
const formatCurrency = (euros: number) => {
  return euros.toFixed(2).replace('.', ',');
};
formatCurrency(35); // Output: "35,00"

// Salvataggio: NO conversione necessaria
const data = {
  unit_price: parseFloat(item.unit_price), // Già in euro
  amount: parseFloat(payment.amount), // Già in euro
};
```

**❌ ERRORE COMUNE - NON dividere/moltiplicare per 100:**
```typescript
// ❌ SBAGLIATO
price: this.price / 100  // NO! Il prezzo è già in euro
unit_price: Math.round(price * 100)  // NO! Non serve conversione

// ✅ CORRETTO
price: this.price  // Il prezzo è già in euro
unit_price: parseFloat(price)  // Usa direttamente
```

### API Request/Response Examples

**POST /sales/quick-calculate**:
```json
Request:
{
  "rows": [
    {
      "unit_price": 100,  // €100.00 (già in euro)
      "quantity": 1,
      "percentage_discount": 10,
      "absolute_discount": 0,
      "vat_rate_percentage": 22
    }
  ],
  "sale_percentage_discount": null,
  "sale_absolute_discount": 0
}

Response:
{
  "subtotal": 90,    // €90.00 (dopo sconto 10%)
  "tax_total": 19.8, // IVA 22% su €90
  "total": 109.8     // Totale lordo
}
```

**POST /sales/calculate-installments**:
```json
Request:
{
  "total_amount": 100,  // €100.00 (già in euro)
  "installments_count": 3,
  "first_due_date": "2025-01-15",
  "days_between_installments": 30
}

Response:
{
  "installments": [
    {
      "installment_number": 1,
      "amount": 33.34,  // Prima rata con resto (€33.34)
      "due_date": "2025-01-15",
      "payed_at": null
    },
    {
      "installment_number": 2,
      "amount": 33.33,  // €33.33
      "due_date": "2025-02-14",
      "payed_at": null
    },
    {
      "installment_number": 3,
      "amount": 33.33,  // €33.33
      "due_date": "2025-03-16",
      "payed_at": null
    }
  ]
}
```

## Bug Fixes e Pattern da Ricordare

### Prezzi - Integer NON è Centesimi (2025-11-09)

**Problema**: Prezzi mostrati come €0,35 invece di €35,00 dopo tentativo di conversione centesimi/euro.

**Root Cause**: Assunzione errata che `integer` nel database significasse "centesimi". In realtà i prezzi sono memorizzati come **euro interi** (es: 35 = €35.00, non 3500 centesimi).

**Soluzione**: NON fare conversioni /100 o *100 tra frontend e backend.

**Schema corretto**:
```php
// Database
$table->integer('price'); // 35 = €35.00

// Model
protected $casts = ['price' => 'integer']; // NO MoneyCast, plain integer

// API Resource - NO conversione
'price' => $this->price,  // ✅ Restituisci così com'è

// Frontend - NO conversione
const price = priceList.price;  // ✅ 35 (euro)
unit_price: parseFloat(item.unit_price),  // ✅ NO * 100

// Display
const formatCurrency = (euros: number) => euros.toFixed(2);  // ✅ NO / 100
```

**File interessati**:
- `app/Http/Resources/PriceListResource.php` - NO divisione per 100
- `resources/js/components/sales/Cart.tsx` - NO moltiplicazione per 100
- `resources/js/pages/sales/sales.tsx` - NO moltiplicazione per 100
- `resources/js/components/sales/cards/PaymentCard.tsx` - NO conversioni

### Customer Model - Null Safety in Accessors (2025-11-09)

**Problema**: `getOptionLabelAttribute()` causava errore 500 quando `birth_date` era null.

**Root Cause**: Il codice chiamava `format()` su `birth_date` senza verificare se fosse null:
```php
// ❌ SBAGLIATO
return $this->first_name.' '.$this->last_name.' ('.$this->birth_date->format('d/m/Y').')';
```

**Soluzione**: Verificare sempre null prima di chiamare metodi su oggetti opzionali:
```php
// ✅ CORRETTO
public function getOptionLabelAttribute()
{
    $birthDateStr = $this->birth_date ? ' ('.$this->birth_date->format('d/m/Y').')' : '';

    return $this->first_name.' '.$this->last_name.$birthDateStr;
}
```

**Pattern generale**:
- **SEMPRE** verificare null per campi opzionali prima di chiamare metodi
- Usare ternary operator per fallback graceful
- Testare con unit test per casi null e non-null
- Questo pattern si applica a TUTTI gli accessors con date/oggetti opzionali

**File interessati**:
- `app/Models/Customer/Customer.php:62` (getOptionLabelAttribute)
- Test: `tests/Unit/Customer/CustomerAccessorTest.php`

## Sistema Vendite (Sales)

### Architettura e Requisiti

Il sistema vendite è progettato per gestire vendite multi-prodotto con fatturazione elettronica italiana (FatturaPA).

### Flusso Vendita Completo

1. **Selezione Cliente** (obbligatorio)
2. **Generazione Progressivo** (auto-generato da BE, modificabile da operatore)
3. **Aggiunta Prodotti al Carrello** (uno o più items)
4. **Applicazione Sconti**:
   - Sconto per singolo item (% o €)
   - Sconto globale vendita (% o €)
5. **Configurazione Pagamento**:
   - Condizione di pagamento (obbligatoria)
   - Metodo di pagamento
   - Risorsa finanziaria
   - Gestione rate (automatiche o manuali)
6. **Salvataggio Vendita**
7. **Generazione Abbonamento Cliente** (se acquistato abbonamento)

### Tipi di Prodotti Vendibili

Tutti i tipi di PriceList sono vendibili:
- **Article** - Articoli retail (integratori, magliette, etc.)
- **Membership** - Quote associative/tesseramento
- **Subscription** - Abbonamenti con contenuti standard + opzionali
- **DayPass** - Ingressi giornalieri
- **Token** - Carnet/crediti prepagati
- **GiftCard** - Buoni regalo

### Abbonamenti (Subscription)

**Struttura**:
- **Contenuti Standard**: Sempre inclusi nell'abbonamento (obbligatori)
- **Contenuti Opzionali**: Selezionabili dall'operatore su richiesta cliente (con prezzi specifici)

**Contenuti Supportati**:
- BaseProduct (sala pesi, cardio, etc.)
- CourseProduct (corsi)
- BookableService (PT, consulenze)
- Article (gadget, integratori)
- Membership (quota associativa)

**Flusso Aggiunta Abbonamento**:
1. Operatore seleziona abbonamento
2. Dialog mostra:
   - Data inizio abbonamento (default: oggi, modificabile)
   - Lista contenuti standard (solo visualizzazione)
   - Lista contenuti opzionali (checkbox per includere)
3. Selezione opzionali → si sommano al prezzo base
4. Aggiunto al carrello come singolo item con prezzo totale

**Calcolo Scadenze Multiple**:
Ogni contenuto ha durata indipendente calcolata dalla data inizio:

Esempio:
```
Data inizio: 10 novembre 2025
Contenuti:
- Open annuale (12 mesi) → scade 10 novembre 2026
- Corso (1 mese) → scade 10 dicembre 2025
- Quota associativa (12 mesi) → scade 10 novembre 2026
```

### Sconti

**Livelli di Sconto**:
1. **Sconto item singolo**: % o € sul singolo prodotto nel carrello
2. **Sconto vendita globale**: % o € sul totale carrello

**Calcolo Sconto su Abbonamento con Opzionali**:
```
Abbonamento base: €100
+ Opzionale A: €20
+ Opzionale B: €30
= €150 (prezzo pacchetto)

Sconto 10% item → si applica su €150 totali
Totale item: €135
```

**Priorità applicazione**:
1. Prima sconti a livello item
2. Poi sconto globale vendita sul subtotale

### IVA e Fatturazione Elettronica Italiana

**Gestione IVA**:
- Ogni prodotto ha `vat_rate_id` (0%, 4%, 10%, 22%, etc.)
- **IVA inclusa nel prezzo** (configurazione attuale)
- Possibilità futura: configurazione globale "IVA inclusa/esclusa" a livello company

**Ritenuta d'Acconto**:
- **Company se ne fa carico** (configurazione attuale)
- Possibilità futura: configurazione globale "aggiungi/company paga" a livello company

**Riepilogo IVA Obbligatorio**:
Per normativa FatturaPA, nel riepilogo vendita serve breakdown per codice IVA:
```
Imponibile IVA 22%: €80.00
Imponibile IVA 10%: €20.00
Imponibile IVA 0% (esente): €10.00
────────────────────────────
IVA 22%: €17.60
IVA 10%: €2.00
IVA 0%: €0.00
────────────────────────────
TOTALE: €129.60
```

### Sistema Pagamenti

**Terminologia**:
- **Condizione di Pagamento**: Definisce QUANDO si paga (es. "30 gg data fattura", "60-90 gg fine mese")
- **Metodo di Pagamento**: Definisce COME si paga (es. "Bonifico", "Contante", "Carta")
- **Risorsa Finanziaria**: Definisce DOVE arrivano i soldi (es. "Conto Intesa", "PayPal Business", "Satispay")

**Condizione di Pagamento** (obbligatoria):
```php
PaymentCondition {
  id: 1,
  description: "Bonifico 30-60-90 gg",
  payment_method_id: 2,  // Bonifico
  end_of_month: true,    // Scadenze a fine mese
  installments: [
    { days: 30 },
    { days: 60 },
    { days: 90 }
  ]
}
```

**Due Scenari di Gestione Rate**:

1. **Rate Automatiche (NON modificabili)**:
   - Condizione di pagamento HA installments definiti
   - Sistema genera rate con scadenze automatiche
   - Operatore NON può modificare date/importi (vincolate da contratto)
   - Esempio: "Bonifico 30-60-90 gg" → 3 rate fisse

2. **Rate Manuali (modificabili)**:
   - Condizione di pagamento SENZA installments (es. "A vista", "Contanti", "PayPal")
   - Operatore può usare:
     - Bottoni quick: "Unica soluzione", "2 rate", "3 rate", "6 rate", "12 rate"
     - Calculator personalizzato: quantità rate + intervallo giorni + data prima rata
   - Rate completamente modificabili (date, importi, metodo)

**Flusso Selezione Condizione**:
```typescript
if (paymentCondition.installments.length > 0) {
  // Rate automatiche
  generateInstallmentsFromCondition(paymentCondition);
  disableManualEdit = true;
} else {
  // Rate manuali disponibili
  showQuickButtons = true;
  showCalculator = true;
  disableManualEdit = false;
}
```

### UI Layout - Sidebar Approach (Opzione C)

```
┌───────────────────────────────────────────────────────────┐
│ HEADER                                                    │
│ Cliente • Progressivo • Data                              │
├────────────────────────────┬──────────────────────────────┤
│                            │                              │
│  MAIN AREA (scroll)        │   SIDEBAR (fixed)            │
│                            │   ┌──────────────────────┐   │
│  [1] Ricerca Prodotti      │   │   CARRELLO           │   │
│      • Quick search        │   │   ──────────         │   │
│      • Tree navigation     │   │   • Item 1     €50   │   │
│                            │   │   • Item 2     €30   │   │
│  [2] Sconti Vendita        │   │                      │   │
│      • % globale           │   │   RIEPILOGO IVA      │   │
│      • € globale           │   │   ──────────         │   │
│                            │   │   Imp. 22%:  €65.57  │   │
│  [3] Pagamenti             │   │   IVA 22%:   €14.43  │   │
│      • Condizione (req)    │   │   Imp. 10%:  €9.09   │   │
│      • Metodo              │   │   IVA 10%:   €0.91   │   │
│      • Risorsa             │   │   ──────────         │   │
│      • Rate table          │   │   TOTALE:    €90.00  │   │
│                            │   │                      │   │
│                            │   │   [COMPLETA VENDITA] │   │
│                            │   │   [SALVA BOZZA]      │   │
│                            │   └──────────────────────┘   │
│                            │                              │
└────────────────────────────┴──────────────────────────────┘
```

**Vantaggi**:
- Carrello e totali IVA sempre visibili
- Flusso lineare: cliente → prodotti → sconti → pagamenti
- Nessuno stepper, tutto in una schermata
- Ottimizzato per tastiera: F2 (cliente), F3 (prodotto), Tab/Enter (navigazione)

### Struttura File Proposta

```
resources/js/pages/sales/
  ├── sale-create.tsx              (Main page - sidebar layout)
  └── components/
      ├── SaleHeader.tsx           (Cliente + Progressivo + Data)
      ├── ProductSearch.tsx        (Quick search + Tree)
      ├── DiscountsSection.tsx     (Sconti globali vendita)
      ├── PaymentsSection.tsx      (Condizioni + Metodi + Rate)
      └── CartSidebar.tsx          (Carrello + Totali IVA + Actions)
```

### API Endpoints Vendite

**POST /app/sales/quick-calculate** - Calcolo real-time totali/IVA:
```typescript
Request: {
  rows: [
    {
      unit_price: 100,
      quantity: 1,
      percentage_discount: 10,
      absolute_discount: 0,
      vat_rate_percentage: 22
    }
  ],
  sale_percentage_discount: 5,
  sale_absolute_discount: 0
}

Response: {
  subtotal: 85.5,          // Dopo sconti
  tax_total: 18.81,        // IVA totale
  total: 104.31,           // Lordo finale
  vat_breakdown: [         // Per riepilogo FatturaPA
    {
      rate: 22,
      taxable_amount: 85.5,
      tax_amount: 18.81
    }
  ]
}
```

**POST /app/sales/calculate-installments** - Generazione rate:
```typescript
Request: {
  total_amount: 100,
  installments_count: 3,
  first_due_date: "2025-01-15",
  days_between_installments: 30
}

Response: {
  installments: [
    {
      installment_number: 1,
      amount: 33.34,
      due_date: "2025-01-15",
      payed_at: null
    },
    // ...
  ]
}
```

**POST /app/sales/store** - Salvataggio vendita:
```typescript
Request: {
  progressive_number: "0001",
  customer_id: 123,
  date: "2025-11-10",
  document_type_id: 1,
  payment_condition_id: 5,
  financial_resource_id: 2,
  discount_percentage: 5,
  discount_absolute: 0,
  sale_rows: [
    {
      price_list_id: 10,
      quantity: 1,
      unit_price: 100,
      percentage_discount: 0,
      absolute_discount: 0,
      total: 95,  // Dopo sconti
      start_date: "2025-11-10",  // Per abbonamenti
      subscription_selected_content: [...]  // Content IDs opzionali
    }
  ],
  payments: [
    {
      payment_method_id: 2,
      amount: 95,
      due_date: "2025-12-10",
      payed_at: null
    }
  ]
}
```

### Stati Vendita

```php
'status' => [
  'draft',      // Bozza salvata, non completata
  'completed',  // Vendita completata
  'cancelled'   // Annullata
],
'payment_status' => [
  'not_paid',   // Non pagato
  'partial',    // Parzialmente pagato
  'paid'        // Completamente pagato
],
'accounting_status' => [
  'not_accounted',  // Non contabilizzato
  'accounted'       // Contabilizzato
],
'exported_status' => [
  'not_exported',   // Non esportato a SDI
  'exported'        // Esportato a SDI
]
```

### Generazione Abbonamento Cliente

Quando viene completata una vendita con un abbonamento:
1. Sistema crea record `CustomerSubscription`
2. Calcola tutte le scadenze dei contenuti dalla data inizio
3. Collega abbonamento al cliente
4. Abbonamento visibile nella scheda cliente per gestione (freeze, rinnovo, etc.)

### Note Implementazione

**Keyboard Shortcuts Esistenti**:
- `F2`: Focus campo cliente
- `F3`: Focus ricerca prodotto
- `F4`: Vai a sezione pagamenti
- `F9`: Vai a riepilogo finale

**Calcoli Real-time**:
- Usa `useQuickCalculate` hook con debounce 300ms
- Chiamata API ad ogni modifica carrello/sconti
- Mostra skeleton durante calcolo

**Validazione**:
- Cliente obbligatorio
- Almeno 1 prodotto nel carrello
- Condizione pagamento obbligatoria
- Se rate manuali: somma rate = totale vendita

**Funzionalità CartSidebar** (`resources/js/pages/sales/components/CartSidebar.tsx`):
- **Modifica Sconto Item**: Ogni item ha bottone Edit che apre dialog per modificare sconto % o € con calcolo real-time sincronizzato
- **Dettagli Abbonamento**: Se item è subscription, mostra contenuti selezionati con durate (mesi/giorni) per verifica operatore
- **Riepilogo IVA**: Box dedicato con breakdown per aliquota (Imponibile + IVA) per FatturaPA compliance
- **Sconto Globale**: Visual feedback con box arancione se applicato sconto a livello vendita
- **Totali**: Imponibile + IVA Totale + TOTALE in box evidenziato
- **Validazione**: Bottone "Completa Vendita" disabilitato fino a quando non sono soddisfatti tutti i requisiti (cliente, prodotti, payment_condition, result)

**Gestione Payment Conditions**:
- Modello `PaymentCondition` ha relazione `installments()` con `PaymentInstallment`
- **Automatico**: Se `installments.length > 0`, rate generate dal sistema (NON modificabili dall'operatore)
- **Manuale**: Se `installments.length === 0`, operatore può aggiungere/modificare/eliminare rate manualmente
- Logica implementata in `PaymentsSection.tsx` con stato `isAutomaticInstallments`

**QuickProductSearch Autocomplete**:
- Configurazione corretta: `value={null}`, `inputValue={searchValue}`, `filterOptions={(x) => x}` (filtro custom)
- `isOptionEqualToValue={(option, value) => option.id === value.id}` per evitare warning
- Formatting prezzo: `€ ${euros.toFixed(2).replace('.', ',')}` (NO divisione per 100)

## Sistema Configurazioni - TenantSettings

Il progetto utilizza un sistema flessibile **key-value** per gestire tutte le configurazioni a livello tenant.

### Modello TenantSetting

```php
// Get setting con default value
$chargeCustomer = TenantSetting::get('invoice.stamp_duty.charge_customer', true);

// Set setting con auto-detection del tipo
TenantSetting::set(
    key: 'invoice.stamp_duty.charge_customer',
    value: true,
    group: 'invoice',
    description: 'Se TRUE, imposta di bollo addebitata al cliente'
);

// Check esistenza
if (TenantSetting::has('invoice.stamp_duty.threshold')) { ... }

// Get tutte le impostazioni di un gruppo
$invoiceSettings = TenantSetting::getGroup('invoice');

// Delete setting
TenantSetting::forget('invoice.stamp_duty.charge_customer');
```

**Caratteristiche**:
- **Cache automatico**: 1 ora (3600s) per performance
- **Type casting**: boolean, integer, decimal, json, string
- **Scope tenant**: Automatico, ogni tenant ha le sue settings
- **Convenzione naming**: `gruppo.sotto_gruppo.nome_setting` (snake_case)

**Gruppi Standard**:
- `invoice.*`: Impostazioni fatturazione elettronica
- `general.*`: Impostazioni generali applicazione
- `notifications.*`: Notifiche e comunicazioni

### Imposta di Bollo (Marca da Bollo Virtuale)

Sistema completo per gestione automatica imposta di bollo secondo normativa AdE.

**Impostazioni Configurabili**:
```php
'invoice.stamp_duty.charge_customer' => true,    // Addebita al cliente o no
'invoice.stamp_duty.amount' => 200,              // Importo in centesimi (2€)
'invoice.stamp_duty.threshold' => 77.47,         // Soglia minima in euro
```

**Regole Applicazione** (Agenzia delle Entrate):
- Totale fattura > 77,47€ (somma TUTTE le operazioni)
- Almeno UNA riga con Nature esenti: N2.1, N2.2, N3.5, N3.6, N4
- Importo fisso: 2€

**Comportamento**:
- **charge_customer = TRUE**: Bollo mostrato nel totale e addebitato al cliente
- **charge_customer = FALSE**: Azienda si fa carico, NON mostrato al cliente
- **XML FatturaPA**: Tag `<BolloVirtuale>SI</BolloVirtuale>` sempre presente se applicato

**Campi Database (sales)**:
- `stamp_duty_applied` (boolean): Indica se bollo è applicabile
- `stamp_duty_amount` (integer/MoneyCast): Importo in centesimi

**Calcolo Automatico**:
Il metodo `SaleService::applyStampDuty()` calcola e applica automaticamente il bollo durante il salvataggio della vendita.

**Sale Summary**:
```php
$summary = $sale->sale_summary;
// Ritorna:
[
    'net_price' => 100.00,           // Imponibile
    'total_tax' => 22.00,            // IVA totale
    'gross_price' => 122.00,         // Lordo (senza bollo)
    'stamp_duty_applied' => true,    // Se applicato
    'stamp_duty_amount' => 2.00,     // Solo se charge_customer=true
    'final_total' => 124.00,         // Totale finale (con bollo)
]
```

## Note Finali

Questo file va aggiornato quando:
- Nuovi pattern vengono stabiliti
- Convenzioni cambiano
- Nuove feature core vengono aggiunte
- Bug critici vengono risolti con pattern da ricordare

**Filosofia**: Codice pulito, pattern consistenti, testing quando possibile, commit frequenti, comunicazione diretta.
