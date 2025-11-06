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

## Work In Progress

### Completato ✅
1. BookableService tabs (Bookings, Availability, Sale)
2. CourseProduct tabs (Timetable con auto-naming, Bookings)
3. Validazioni frontend e backend complete
4. Time slots personalizzati per BookableService
5. UX improvements (loading states, feedback, error handling)

### Da Fare 📋
1. Applicare TabContainer agli altri tab (CourseProduct, BaseProduct)
2. Implementare gestione istruttori/sale per time slots
3. Blackout dates per BookableService availability
4. Testing: Feature tests per controller e validations
5. Testing: Unit tests per auto-generation logic
6. Fine-tuning funzionalità esistenti (feedback utente)
7. Equipment list management per CourseProduct materials
8. Next level course selection per CourseProduct progression
9. Prerequisites management per corsi

### Considerazioni Future
- Calendar view per planning visualization
- Booking conflict detection logic
- Capacity management per time slots
- Reporting per utilizzo servizi/corsi
- Integration con payment system per materials_fee

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
