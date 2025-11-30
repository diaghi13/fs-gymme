# PriceList & Subscription Architecture Guidelines

## Overview
Questo documento descrive l'architettura del sistema PriceList/Subscription dopo il refactoring del 2025-11-06.

## Struttura Dati

### Benefits (Benefici)
**IMPORTANTE**: I benefici sono ora organizzati su due livelli:

#### Livello Subscription (Abbonamento)
I seguenti benefici sono applicati **a livello di abbonamento** e sono memorizzati nella tabella `subscriptions`:

- `guest_passes_total` - Numero totale di guest pass all'anno
- `guest_passes_per_month` - Guest pass mensili
- `multi_location_access` - Accesso multi-sede (boolean)

**Motivazione**: Questi benefici si applicano all'intero abbonamento, non ai singoli prodotti. Ad esempio, "5 guest pass all'anno con Premium" è una caratteristica dell'abbonamento, non del singolo prodotto/servizio incluso.

#### Livello SubscriptionContent (Contenuto)
Il seguente beneficio rimane **a livello di contenuto** nella tabella `subscription_contents`:

- `discount_percentage` - Percentuale di sconto su questo specifico prodotto/servizio

**Motivazione**: Lo sconto può variare per ogni prodotto/servizio all'interno dell'abbonamento per permettere maggiore flessibilità.

### Booking Rules (Regole di Prenotazione)
Le regole di prenotazione sono mantenute a **livello di SubscriptionContent** (per-prodotto):

- `max_concurrent_bookings` - Prenotazioni simultanee
- `daily_bookings` - Prenotazioni giornaliere
- `weekly_bookings` - Prenotazioni settimanali
- `advance_booking_days` - Giorni di anticipo per prenotare
- `cancellation_hours` - Ore minime per cancellazione

**Template dal Prodotto**: Quando si aggiunge un prodotto a una subscription, i campi booking vengono pre-compilati da `product.settings.booking`:
- Per **BaseProduct** (servizi prenotabili): `advance_days`, `min_advance_hours`, `cancellation_hours`, `max_per_day`, `buffer_minutes`
  - **UI**: Tab "Prenotazioni" in `resources/js/components/products/base-product/BookingsTab.tsx`
  - **Model**: Default values in `app/Models/Product/BaseProduct.php:73-80`
  - **DTO**: Validation in `app/Dtos/Product/BaseProductDto.php:67-71`
- Per **CourseProduct** (corsi): `advance_days`, `min_advance_hours`, `cancellation_hours`, `max_per_day`, `buffer_minutes`
  - **UI**: Tab "Prenotazioni" in `resources/js/components/products/course-product/BookingsTab.tsx`
  - **Model**: Default values in `app/Models/Product/CourseProduct.php:78-85`
  - **DTO**: Validation in `app/Dtos/Product/CourseProductDto.php:93-97`
- I valori possono essere personalizzati a livello di subscription

### Validity Rules (Regole di Validità)
Le regole di validità rimangono a **livello di SubscriptionContent**:

#### Tipi di Validità
- **duration**: L'abbonamento inizia dalla data di acquisto e dura per il periodo specificato
  - Campi: `validity_days`, `validity_months`
- **fixed_date**: L'abbonamento è valido solo in un periodo specifico
  - Campi: `valid_from`, `valid_to`
- **first_use**: L'abbonamento inizia dal primo accesso del cliente
  - Campi: `validity_days`, `validity_months`

#### Altri Campi di Validità
- `freeze_days_allowed` - Giorni di sospensione permessi
- `freeze_cost_cents` - Costo per sospensione in centesimi

**Note**: La sezione MainFormRow gestisce la durata base (days/months), mentre ExtraFormRow gestisce le regole avanzate di validità.

### Access Rules (Regole di Accesso)
Le regole di accesso sono a **livello di SubscriptionContent**:

- `unlimited_entries` - Accessi illimitati (boolean)
- `total_entries` - Numero totale di ingressi
- `daily_entries` - Ingressi giornalieri
- `weekly_entries` - Ingressi settimanali
- `monthly_entries` - Ingressi mensili

## Database Schema

### Migration: `move_benefits_from_subscription_contents_to_subscriptions`
**Data**: 2025-11-06

**Up**:
- Aggiunge `guest_passes_total`, `guest_passes_per_month`, `multi_location_access` alla tabella `subscriptions`
- Rimuove `guest_passes_total`, `guest_passes_per_month`, `multi_location_access` dalla tabella `subscription_contents`

**Down**:
- Ripristina i campi in `subscription_contents`
- Rimuove i campi da `subscriptions`

## Models

### Subscription Model
**File**: `app/Models/PriceList/Subscription.php`

**$fillable**:
```php
[
    "structure_id",
    "name",
    "color",
    "saleable",
    "parent_id",
    "saleable_from",
    "saleable_to",
    "guest_passes_total",        // NEW
    "guest_passes_per_month",    // NEW
    "multi_location_access",     // NEW
]
```

**$casts**:
```php
[
    'guest_passes_total' => 'integer',
    'guest_passes_per_month' => 'integer',
    'multi_location_access' => 'boolean',
]
```

### SubscriptionContent Model
**File**: `app/Models/PriceList/SubscriptionContent.php`

**Benefits rimossi**:
- ❌ `guest_passes_total`
- ❌ `guest_passes_per_month`
- ❌ `multi_location_access`

**Benefits mantenuti**:
- ✅ `discount_percentage`

## Services

### SubscriptionPriceListService
**File**: `app/Services/PriceList/SubscriptionPriceListService.php`

**store() method**:
- Salva i benefici (guest passes, multi-location) a livello di Subscription
- Rimuove i benefici dal mapping del contenuto

**update() method**:
- Aggiorna i benefici a livello di Subscription
- Non include più i benefici nel mapping del contenuto

## Controllers

### SubscriptionController
**File**: `app/Http/Controllers/Application/PriceLists/SubscriptionController.php`

**Validation Rules**:

**Livello Subscription** (store & update):
```php
'guest_passes_total' => 'nullable|integer|min:0',
'guest_passes_per_month' => 'nullable|integer|min:0',
'multi_location_access' => 'nullable|boolean',
```

**Livello Content** (rimossi):
- ❌ `standard_content.*.guest_passes_total`
- ❌ `standard_content.*.guest_passes_per_month`
- ❌ `standard_content.*.multi_location_access`

**Livello Content** (mantenuti):
- ✅ `standard_content.*.discount_percentage`

## Frontend

### TypeScript Types
**File**: `resources/js/types/index.d.ts`

**PriceListSubscription interface**:
```typescript
export interface PriceListSubscription extends PriceList {
  color: string;
  type: 'subscription';
  price: number;
  standard_content: PriceListSubscriptionContent[];
  optional_content: PriceListSubscriptionContent[];

  // Subscription-level benefits
  guest_passes_total?: number | null;
  guest_passes_per_month?: number | null;
  multi_location_access?: boolean;
}
```

**PriceListSubscriptionContent interface**:
```typescript
// Benefits & perks
discount_percentage?: number | null;
// Rimossi: guest_passes_total, guest_passes_per_month, multi_location_access
```

### Form Components

#### SubscriptionGeneralTab
**File**: `resources/js/components/price-list/subscription/tabs/SubscriptionGeneralTab.tsx`

**SubscriptionGeneralFormValues**:
- Aggiunge benefici a livello subscription
- Rimuove benefici da SubscriptionGeneralFormValuesWithContent

**initialValues**:
- Include `guest_passes_total`, `guest_passes_per_month`, `multi_location_access` dal priceList

**onSubmit**:
- Rimuove benefici dal mapping del contenuto
- ~~Mantiene solo `discount_percentage` nel contenuto~~ (RIMOSSO - sconto applicato in vendita)

#### SubscriptionExtraTab
**File**: `resources/js/components/price-list/subscription/tabs/SubscriptionExtraTab.tsx`

**Tab "Extra"** - Gestisce i benefici a livello di abbonamento con proprio Formik provider:

**Architettura**:
- Ha il proprio Formik context indipendente (come SubscriptionOptionalTab)
- `onSubmit` fa PATCH a `app.price-lists.subscriptions.update`
- Include FormikSaveButton per salvare separatamente dalla tab Generale

**Form Fields**:
```jsx
<Grid size={4}>
  <TextField name="guest_passes_total" label="Guest Pass Totali" type="number" />
</Grid>
<Grid size={4}>
  <TextField name="guest_passes_per_month" label="Guest Pass al Mese" type="number" />
</Grid>
<Grid size={4}>
  <FormControlLabel control={<Checkbox checked={values.multi_location_access} />}
                    label="Accesso Multi-Sede" />
</Grid>
```

**Motivazione**: Ogni tab ha il proprio Formik per permettere salvataggi indipendenti e organizzare meglio l'interfaccia.

#### SubscriptionSummaryTab
**File**: `resources/js/components/price-list/subscription/tabs/SubscriptionSummaryTab.tsx`

**Tab "Riepilogo"** - Visualizzazione read-only di tutte le informazioni dell'abbonamento:

**Sezioni**:
1. **Informazioni Generali**: Nome, colore (con preview visivo), stato vendibile
2. **Benefici Abbonamento**: Guest passes, accesso multi-sede (se configurati)
3. **Contenuto Standard**: Tabella con prodotti/servizi, durata, prezzi, IVA + totale
4. **Contenuto Opzionale**: Stessa struttura (se presente)
5. **Totale Abbonamento**: Card con totale complessivo e breakdown standard/opzionale

**Features**:
- Icone Material-UI per indicatori visivi (CheckCircle, Cancel)
- Preview colore abbonamento
- Chips per totali parziali
- Card con sfondo primario per totale finale
- Formattazione italiana (€, plurali corretti)
- Layout responsive con Grid Material-UI

**Motivazione**: Fornisce una vista d'insieme completa per validare la configurazione prima di attivare l'abbonamento.

#### GeneralForm
**File**: `resources/js/components/price-list/subscription/forms/GeneralForm.tsx`

**Modifiche**:
- ~~Sezione benefici rimossa~~ (ora in SubscriptionExtraTab)
- Mantiene solo i campi base: nome, cartella, colore, contenuto standard

#### ExtraFormRow
**File**: `resources/js/components/price-list/subscription/content-table/form/ExtraFormRow.tsx`

**Sezione Benefits**:
- Rimossi: Guest Pass, Multi-Location
- Mantenuto: Discount Percentage

**Sezione Validity**:
- Aggiunto Alert informativo con spiegazione dei tipi di validità

#### SubscriptionTable
**File**: `resources/js/components/price-list/subscription/content-table/SubscriptionTable.tsx`

**createRow() function**:
- Rimossi `guest_passes_total`, `guest_passes_per_month`, `multi_location_access` dall'inizializzazione
- ~~Mantenuto `discount_percentage`~~ (RIMOSSO)
- Carica booking rules da `entity.settings.booking` come template

#### SubscriptionTableRow & ExtraContentRow
**Files**:
- `resources/js/components/price-list/subscription/content-table/SubscriptionTableRow.tsx`
- `resources/js/components/price-list/subscription/content-table/ExtraContentRow.tsx`

**Display Mode (ExtraContentRow)**:
- ~~Campi legacy rimossi~~: `daily_access`, `weekly_access`, `reservation_limit`, `daily_reservation_limit`
- **Nuovi campi visualizzati**:
  - **Regole di Accesso**: `unlimited_entries`, `total_entries`, `daily_entries`, `weekly_entries`, `monthly_entries`
  - **Regole di Prenotazione**: `max_concurrent_bookings`, `daily_bookings`, `weekly_bookings`, `advance_booking_days`, `cancellation_hours`
  - **Regole di Validità**: `validity_type`, `validity_days`, `validity_months`, `valid_from`, `valid_to`, `freeze_days_allowed`, `freeze_cost_cents`

## Features Avanzate

### Time Restrictions (Restrizioni Orarie)
**UI**: `ExtraFormRow.tsx:257-452` e `ExtraContentRow.tsx:143-187`

Permette di limitare l'accesso a giorni/orari specifici:
- **Checkbox**: Abilita/disabilita restrizioni orarie
- **Multiple Restrictions**: Ogni contenuto può avere più restrizioni
- **Campi per restrizione**:
  - `restriction_type`: 'allowed' (permesso) o 'blocked' (bloccato)
  - `days`: Array di giorni (monday, tuesday, etc.)
  - `start_time` / `end_time`: Orario di inizio/fine
  - `description`: Descrizione opzionale (es. "Solo mattina")
- **Visualizzazione**: Chips colorati (verde=permesso, rosso=bloccato)
- **Esempi d'uso**: "Lun-Ven 06:00-13:00", "Solo weekend", "Off-peak hours"

**Database**: Tabella `subscription_content_time_restrictions` con relazione `hasMany`

### Service Access (Accesso Servizi)
**UI**: `ExtraFormRow.tsx:454-508` e `ExtraContentRow.tsx:190-209`

Limita l'abbonamento a servizi/corsi specifici:
- **service_access_type**:
  - `all`: Accesso a tutti i servizi (default)
  - `included`: Solo servizi selezionati
  - `excluded`: Tutti tranne i selezionati
- **services**: Array di product_id (gestito tramite pivot table)

**Database**: Tabella pivot `subscription_content_services` con `usage_limit` e `usage_period`

**Note**: La selezione effettiva dei servizi sarà implementata in futuro con autocomplete/multi-select

## Best Practices

### Quando creare nuovi contenuti
1. Usare `createRow()` in SubscriptionTable che inizializza tutti i campi necessari
2. Non includere benefici subscription-level nel contenuto
3. Considerare se servono Time Restrictions o Service Access per questo contenuto

### Quando validare
1. Validation rules nel Controller devono distinguere tra subscription-level e content-level
2. Frontend types devono riflettere esattamente la struttura backend
3. Validare che Time Restrictions abbiano giorni E orari validi

### Quando aggiungere nuovi benefici
1. **Domanda**: Il beneficio si applica all'intero abbonamento o solo a un prodotto specifico?
2. **Se si applica all'abbonamento**: Aggiungere a `Subscription` model e form principale
3. **Se si applica al prodotto**: Aggiungere a `SubscriptionContent` model e ExtraFormRow

## Changelog

### 2025-11-06: Benefits Refactoring & Comprehensive Features
- Spostati guest passes e multi-location da SubscriptionContent a Subscription
- ~~Mantenuto discount_percentage a livello SubscriptionContent~~ **RIMOSSO** - sconto applicato in fase di vendita
- Aggiunto testo esplicativo per la sezione Validità
- Aggiornati tutti i layer (DB, Models, Services, Controllers, Frontend)
- **Creata nuova tab "Extra"** per benefici abbonamento con proprio Formik provider indipendente
- **Creata tab "Riepilogo"** (SubscriptionSummaryTab) con visualizzazione completa di tutte le info abbonamento
- **Aggiornato display mode** (ExtraContentRow) con nuovi campi comprehensive invece di legacy
- **Sincronizzato campo "Ingressi"** con checkbox "Accessi Illimitati"
- **Template booking rules** da Product.settings.booking per BaseProduct e CourseProduct
- **Fix type matching** - Risolto bug che impediva l'aggiunta di CourseProduct/Article/MembershipFee (type era "course" non "course_product")
- **API Resource aggiornato** - PriceListResource ora include tutti i campi comprehensive + benefits subscription-level
- **BaseProduct BookingsTab** - Aggiunta tab Prenotazioni a BaseProduct con stessi campi di CourseProduct
- **Legacy fields** - Mantenuti per retrocompatibilità API ma deprecati (commenti nel codice)
- **Time Restrictions UI** - Interfaccia completa per gestire restrizioni orarie (giorni, orari, tipo)
- **Service Access UI** - Selezione tipo accesso servizi (all/included/excluded)
- **Tab Architecture** - Ogni tab (Generale, Opzioni, Vendita, Extra) ha il proprio Formik context per salvataggi indipendenti

## Testing Checklist

Quando si modifica il sistema PriceList/Subscription, testare:

### Funzionalità Base
- [ ] Creazione nuovo abbonamento con benefici nella tab "Extra"
- [ ] Aggiornamento abbonamento esistente
- [ ] Aggiunta BaseProduct, CourseProduct, Article, MembershipFee come contenuto
- [ ] Aggiunta contenuto standard e opzionale

### Booking Rules
- [ ] Template booking rules caricati da BaseProduct
- [ ] Template booking rules caricati da CourseProduct
- [ ] Modifica booking rules in BaseProduct tab "Prenotazioni"
- [ ] Modifica booking rules in CourseProduct tab "Prenotazioni"

### Regole di Validità e Accesso
- [ ] Salvataggio con tutti i tipi di validità (duration, fixed_date, first_use)
- [ ] Salvataggio con regole di accesso (unlimited_entries, total/daily/weekly/monthly)
- [ ] Sincronizzazione campo "Ingressi" con checkbox "Accessi Illimitati"

### Features Avanzate
- [ ] Creazione Time Restrictions (giorni, orari, tipo permesso/bloccato)
- [ ] Visualizzazione Time Restrictions in display mode
- [ ] Eliminazione Time Restrictions
- [ ] Selezione Service Access Type (all/included/excluded)
- [ ] Visualizzazione Service Access in display mode

### Display & UI
- [ ] Visualizzazione campi comprehensive in ExtraContentRow (non legacy)
- [ ] Tab "Extra" mostra correttamente i benefici subscription-level con proprio Formik
- [ ] Tab "Riepilogo" mostra tutte le informazioni (generale, benefici, contenuto, totali)
- [ ] ExtraFormRow mostra tutte le sezioni (Access, Booking, Validity, Time, Service)

### Database & API
- [ ] Migration su tenant esistenti
- [ ] API Resource restituisce tutti i campi comprehensive
- [ ] Legacy fields ancora presenti per retrocompatibilità

## Riferimenti

### Migrations
- `database/migrations/tenant/2025_11_06_170047_move_benefits_from_subscription_contents_to_subscriptions.php`
- `database/migrations/tenant/2025_11_06_175035_add_saleable_fields_to_price_lists_table.php`
- `database/migrations/tenant/2025_11_06_145403_extend_subscription_contents_with_comprehensive_rules.php`

### Backend
- Models: `app/Models/PriceList/Subscription.php`, `app/Models/PriceList/SubscriptionContent.php`, `app/Models/Product/CourseProduct.php`
- Service: `app/Services/PriceList/SubscriptionPriceListService.php`
- Controller: `app/Http/Controllers/Application/PriceLists/SubscriptionController.php`

### Frontend - PriceList/Subscription
- Types: `resources/js/types/index.d.ts`
- Tabs: `resources/js/components/price-list/subscription/tabs/`
  - `SubscriptionGeneralTab.tsx` - Configurazione generale + contenuto standard
  - `SubscriptionOptionalTab.tsx` - Contenuto opzionale
  - `SubscriptionExtraTab.tsx` - Benefici subscription-level
  - `SubscriptionSummaryTab.tsx` - Riepilogo completo (read-only)
- Forms: `resources/js/components/price-list/subscription/forms/GeneralForm.tsx`
- Table: `resources/js/components/price-list/subscription/content-table/` (SubscriptionTable, SubscriptionTableRow, ExtraContentRow, ExtraFormRow)
- Card: `resources/js/components/price-list/subscription/SubscriptionPriceListCard.tsx` - Gestisce le 5 tabs

### Frontend - Products
- BaseProduct Bookings: `resources/js/components/products/base-product/BookingsTab.tsx`
  - Gestisce le regole standard booking (template per subscription)
- CourseProduct Bookings: `resources/js/components/products/course-product/BookingsTab.tsx`
  - Gestisce sia le regole standard (template per subscription) che quelle specifiche del corso

### API
- PriceListResource: `app/Http/Resources/PriceListResource.php`
  - Restituisce tutti i campi comprehensive + legacy fields (deprecated)
