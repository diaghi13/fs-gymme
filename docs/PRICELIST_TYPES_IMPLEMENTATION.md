# PriceList Types - Implementation Guide

## Overview
Questo documento fornisce le linee guida per implementare i vari tipi di PriceList nel sistema.

## Tipi di PriceList Esistenti

### Già Implementato
1. **Subscription** (`subscription`) - Abbonamenti complessi con contenuto standard/opzionale
   - Documentazione completa: `PRICELIST_ARCHITECTURE.md`
   - UI completa con 5 tabs (Generale, Opzioni, Vendita, Extra, Riepilogo)

### Da Implementare
2. **Membership** (`membership`) - Quote associative
3. **Article** (`article`) - Articoli vendibili (magliette, integratori, etc.)
4. **DayPass** (`day_pass`) - Ingressi giornalieri
5. **Token** (`token`) - Pacchetti ingressi
6. **GiftCard** (`gift_card`) - Buoni regalo
7. **Folder** (`folder`) - Cartelle organizzative (non vendibile)

## Struttura STI (Single Table Inheritance)

Tutti i PriceList usano **Parental** per STI sulla tabella `price_lists`:

```php
// Base Model
class PriceList extends TenantModel {
    // Common fields for all types
}

// Child Model Example
class Article extends PriceList {
    use HasParent;

    protected $attributes = [
        'type' => PriceListItemTypeEnum::ARTICLE->value,
    ];
}
```

## Campi Comuni (Base)

Tutti i tipi di PriceList condividono questi campi:

```php
protected $fillable = [
    "structure_id",       // FK alla struttura (palestra)
    "name",               // Nome del listino
    "color",              // Colore per UI
    "saleable",           // Se può essere venduto
    "parent_id",          // FK per organizzazione in cartelle
    "saleable_from",      // Data inizio vendibilità
    "saleable_to",        // Data fine vendibilità
];
```

## Pattern di Implementazione

### 1. Model (Backend)

**Location**: `app/Models/PriceList/{Type}.php`

**Template**:
```php
<?php

namespace App\Models\PriceList;

use App\Casts\MoneyCast;
use App\Contracts\VatRateable;
use App\Enums\PriceListItemTypeEnum;
use Parental\HasParent;

class {Type} extends PriceList implements VatRateable
{
    use HasParent;

    protected $fillable = [
        // Common fields
        "structure_id",
        "name",
        "color",
        "saleable",
        "parent_id",
        "saleable_from",
        "saleable_to",

        // Type-specific fields
        'price',
        'vat_rate_id',
        // ... altri campi specifici
    ];

    protected $casts = [
        'price' => MoneyCast::class,
        'saleable' => 'boolean',
        'saleable_from' => 'date',
        'saleable_to' => 'date',
        'vat_rate_id' => 'integer',
        'parent_id' => 'integer',
        // ... altri casts specifici
    ];

    protected $attributes = [
        'type' => PriceListItemTypeEnum::{TYPE}->value,
    ];
}
```

### 2. DTO (Validation)

**Location**: `app/Dtos/PriceList/{Type}Dto.php`

**Template**:
```php
<?php

namespace App\Dtos\PriceList;

use Spatie\LaravelData\Data;

class {Type}Dto extends Data
{
    public function __construct(
        // Common fields
        public ?int $id,
        public string $name,
        public ?string $color,
        public ?bool $saleable,
        public ?int $parent_id,

        // Type-specific fields
        public ?int $price,
        public ?int $vat_rate_id,
        // ... altri campi
    ) {}

    public static function rules(): array
    {
        return [
            // Common validation
            'name' => ['required', 'string', 'max:255'],
            'color' => ['nullable', 'string'],
            'saleable' => ['nullable', 'boolean'],
            'parent_id' => ['nullable', 'integer', 'exists:price_lists,id'],

            // Type-specific validation
            'price' => ['required', 'integer', 'min:0'],
            'vat_rate_id' => ['required', 'integer', 'exists:vat_rates,id'],
            // ... altre validazioni
        ];
    }
}
```

### 3. Service

**Location**: `app/Services/PriceList/{Type}Service.php`

**Template**:
```php
<?php

namespace App\Services\PriceList;

use App\Models\PriceList\{Type};
use App\Dtos\PriceList\{Type}Dto;

class {Type}Service
{
    public function store({Type}Dto $dto): {Type}
    {
        return {Type}::create([
            'structure_id' => auth()->user()->current_structure_id,
            'name' => $dto->name,
            'color' => $dto->color,
            'saleable' => $dto->saleable ?? true,
            'parent_id' => $dto->parent_id,
            'price' => $dto->price,
            'vat_rate_id' => $dto->vat_rate_id,
            // ... altri campi
        ]);
    }

    public function update({Type} ${type}, {Type}Dto $dto): {Type}
    {
        ${type}->update([
            'name' => $dto->name,
            'color' => $dto->color,
            'saleable' => $dto->saleable,
            'parent_id' => $dto->parent_id,
            'price' => $dto->price,
            'vat_rate_id' => $dto->vat_rate_id,
            // ... altri campi
        ]);

        return ${type}->fresh();
    }

    public function destroy({Type} ${type}): void
    {
        ${type}->delete();
    }
}
```

### 4. Controller

**Location**: `app/Http/Controllers/Application/PriceLists/{Type}Controller.php`

**Template**:
```php
<?php

namespace App\Http\Controllers\Application\PriceLists;

use App\Http\Controllers\Controller;
use App\Models\PriceList\{Type};
use App\Dtos\PriceList\{Type}Dto;
use App\Services\PriceList\{Type}Service;
use Illuminate\Http\Request;
use Inertia\Inertia;

class {Type}Controller extends Controller
{
    public function __construct(
        private {Type}Service $service
    ) {}

    public function store(Request $request)
    {
        $dto = {Type}Dto::from($request->validate({Type}Dto::rules()));
        $this->service->store($dto);

        return redirect()
            ->route('app.price-lists.index')
            ->with('success', '{Type} creato con successo');
    }

    public function update(Request $request, {Type} ${type})
    {
        $dto = {Type}Dto::from($request->validate({Type}Dto::rules()));
        $this->service->update(${type}, $dto);

        return redirect()
            ->route('app.price-lists.index')
            ->with('success', '{Type} aggiornato con successo');
    }

    public function destroy({Type} ${type})
    {
        $this->service->destroy(${type});

        return redirect()
            ->route('app.price-lists.index')
            ->with('success', '{Type} eliminato con successo');
    }
}
```

### 5. Routes

**Location**: `routes/tenant/web/price-lists.php`

**Template**:
```php
Route::prefix('price-lists/{type}s')->group(function () {
    Route::post('/', [{Type}Controller::class, 'store'])
        ->name('app.price-lists.{type}s.store');
    Route::patch('/{id}', [{Type}Controller::class, 'update'])
        ->name('app.price-lists.{type}s.update');
    Route::delete('/{id}', [{Type}Controller::class, 'destroy'])
        ->name('app.price-lists.{type}s.destroy');
});
```

### 6. Frontend - TypeScript Types

**Location**: `resources/js/types/index.d.ts`

**Template**:
```typescript
export interface PriceList{Type} extends PriceList {
  type: '{type}';
  color: string;

  // Type-specific fields
  price: number;
  vat_rate_id: number;
  vat_rate?: VatRate;
  // ... altri campi
}
```

### 7. Frontend - Card Component

**Location**: `resources/js/components/price-list/{type}/{Type}PriceListCard.tsx`

**Pattern base** (semplice, senza tabs):
```tsx
import React from 'react';
import { Formik, FormikConfig, Form } from 'formik';
import { PriceList{Type} } from '@/types';
import { router } from '@inertiajs/react';
import { Grid, Button } from '@mui/material';
import TextField from '@/components/ui/TextField';
import Select from '@/components/ui/Select';
import ColorInput from '@/components/ui/ColorInput';
import MyCard from '@/components/ui/MyCard';
import FormikSaveButton from '@/components/ui/FormikSaveButton';

interface {Type}PriceListCardProps {
  priceList: PriceList{Type};
}

export default function {Type}PriceListCard({ priceList }: {Type}PriceListCardProps) {
  const formik: FormikConfig<FormValues> = {
    initialValues: {
      name: priceList.name ?? '',
      color: priceList.color ?? '',
      price: priceList.price ?? 0,
      vat_rate_id: priceList.vat_rate_id ?? null,
      // ... altri campi
    },
    onSubmit: (values) => {
      const route = priceList.id
        ? 'app.price-lists.{type}s.update'
        : 'app.price-lists.{type}s.store';

      router[priceList.id ? 'patch' : 'post'](
        route(priceList.id ? { {type}: priceList.id } : {}),
        values,
        { preserveState: false }
      );
    },
    enableReinitialize: true
  };

  return (
    <MyCard title={priceList.name ?? 'Nuovo {Type}'} bgColor={priceList.color}>
      <Formik {...formik}>
        <Form>
          <Grid container spacing={3}>
            <Grid size={12}>
              <TextField name="name" label="Nome" />
            </Grid>
            <Grid size={6}>
              <TextField name="price" label="Prezzo" type="number" />
            </Grid>
            <Grid size={6}>
              <Select name="vat_rate_id" label="Aliquota IVA" options={vatRateOptions} />
            </Grid>
            <Grid size={12}>
              <ColorInput name="color" label="Colore" />
            </Grid>
            <Grid size={12} sx={{ textAlign: 'end' }}>
              <Button onClick={handleDismiss}>Annulla</Button>
              <FormikSaveButton />
            </Grid>
          </Grid>
        </Form>
      </Formik>
    </MyCard>
  );
}
```

**Pattern avanzato** (con tabs, come Subscription):
- Usare TabContext/TabList/TabPanel di MUI
- Ogni tab ha il proprio Formik provider
- Riferimento: `SubscriptionPriceListCard.tsx`

### 8. Frontend - Page Integration

**Location**: `resources/js/pages/price-lists/price-lists.tsx`

**Aggiungere**:
```tsx
import {Type}PriceListCard from '@/components/price-list/{type}/{Type}PriceListCard';

// Nel rendering condizionale
{priceList?.type === '{type}' && (
  <{Type}PriceListCard priceList={priceList as PriceList{Type}} />
)}
```

## Specifiche per Tipo

### Membership (Quote Associative)

**Campi Specifici**:
- `price` - Prezzo della quota
- `vat_rate_id` - Aliquota IVA
- `months_duration` - Durata in mesi (es. 12 per annuale)

**Business Logic**:
- Solitamente venduta una volta all'anno
- Non ha contenuto variabile (è un singolo item)
- Può avere `saleable_from` / `saleable_to` per periodo iscrizioni

**UI**: Form semplice, no tabs

### Article (Articoli)

**Campi Specifici**:
- `price` - Prezzo articolo
- `vat_rate_id` - Aliquota IVA

**Business Logic**:
- Prodotti fisici vendibili (magliette, integratori, accessori)
- Semplice: prezzo + IVA
- Potrebbe necessitare gestione inventario (futuro)

**UI**: Form semplice, no tabs

### DayPass (Ingressi Giornalieri)

**Campi Specifici**:
- `price` - Prezzo ingresso
- `vat_rate_id` - Aliquota IVA
- Possibili aggiunte:
  - `time_restrictions` - Fasce orarie (es. "Solo mattina")
  - `service_access_type` - Accesso a quali servizi

**Business Logic**:
- Ingresso singolo giornaliero
- Può essere limitato a fasce orarie
- Può dare accesso solo a certi servizi (sala pesi, non corsi)

**UI**:
- Form base per prezzo/IVA
- Opzionale: Tab avanzate per restrizioni (se necessario)

### Token (Pacchetti Ingressi)

**Campi Specifici**:
- `price` - Prezzo pacchetto
- `vat_rate_id` - Aliquota IVA
- `total_entries` - Numero ingressi nel pacchetto
- `validity_days` - Giorni di validità
- Possibili aggiunte:
  - `time_restrictions` - Fasce orarie
  - `service_access_type` - Accesso servizi

**Business Logic**:
- Pacchetto di N ingressi da usare in X giorni
- Esempio: "10 ingressi validi 60 giorni"
- Più economico del singolo ingresso

**UI**:
- Form con ingressi totali + validità
- Opzionale: Restrizioni orarie/servizi

### GiftCard (Buoni Regalo)

**Campi Specifici**:
- `price` - Valore buono (o NULL se personalizzabile)
- `vat_rate_id` - Aliquota IVA
- `validity_days` - Giorni di validità
- `code_prefix` - Prefisso codice (es. "GYM-")

**Business Logic**:
- Credito da spendere in struttura
- Può avere valore fisso o personalizzabile
- Genera codice univoco

**UI**: Form con valore e validità

### Folder (Cartelle)

**Campi Specifici**:
- Solo campi base (name, color, parent_id)
- `saleable` sempre `false`

**Business Logic**:
- Non è vendibile, solo organizzazione
- Permette gerarchia di pricelists

**UI**: Form minimale (nome + colore)

## Checklist Implementazione

Quando implementi un nuovo tipo di PriceList:

### Backend
- [ ] Model in `app/Models/PriceList/{Type}.php`
- [ ] DTO in `app/Dtos/PriceList/{Type}Dto.php`
- [ ] Service in `app/Services/PriceList/{Type}Service.php`
- [ ] Controller in `app/Http/Controllers/Application/PriceLists/{Type}Controller.php`
- [ ] Routes in `routes/tenant/web/price-lists.php`
- [ ] Enum value in `app/Enums/PriceListItemTypeEnum.php`
- [ ] Migration se servono campi nuovi in `price_lists` table

### Frontend
- [ ] TypeScript interface in `resources/js/types/index.d.ts`
- [ ] Card component in `resources/js/components/price-list/{type}/{Type}PriceListCard.tsx`
- [ ] Import e rendering in `resources/js/pages/price-lists/price-lists.tsx`
- [ ] Form fields components (TextField, Select, ColorInput, etc.)
- [ ] Validation schema (Yup se necessario)

### Testing
- [ ] Feature test per store
- [ ] Feature test per update
- [ ] Feature test per destroy
- [ ] Test validation rules
- [ ] Test UI (manuale)

## Best Practices

1. **Riutilizzo Componenti**: Usa i componenti UI esistenti (TextField, Select, ColorInput, MyCard, FormikSaveButton)

2. **Consistenza**: Segui lo stesso pattern di SubscriptionPriceListCard per struttura e naming

3. **Validation**: Sempre validare sia backend (DTO) che frontend (Formik/Yup)

4. **TypeScript**: Definire interface complete in `types/index.d.ts`

5. **Formik**: Usa `enableReinitialize: true` per permettere edit di pricelists esistenti

6. **Routes**: Seguire naming convention: `app.price-lists.{type}s.{action}`

7. **Tabs**: Solo se il tipo ha configurazione complessa (come Subscription). Altrimenti form semplice.

8. **MUI Grid**: Usa il nuovo Grid v2 con `size` prop (non `xs`, `md`)

## Ordine di Implementazione Consigliato

1. **Article** - Il più semplice (solo prezzo + IVA)
2. **Membership** - Semplice + durata
3. **DayPass** - Base semplice, opzionale complessità con restrizioni
4. **Token** - Simile a DayPass ma con ingressi multipli
5. **GiftCard** - Richiede logica codici univoci
6. **Folder** - Ultimo perché non vendibile, solo UI

## Riferimenti

- **Subscription completo**: `docs/PRICELIST_ARCHITECTURE.md`
- **Esempi Models**: `app/Models/PriceList/Article.php`, `Membership.php`
- **Pattern Formik+MUI**: `resources/js/components/price-list/subscription/tabs/SubscriptionExtraTab.tsx`
- **Tabs avanzate**: `resources/js/components/price-list/subscription/SubscriptionPriceListCard.tsx`
