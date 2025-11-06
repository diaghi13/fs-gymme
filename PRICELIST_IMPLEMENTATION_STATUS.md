# PriceList Implementation Status

## ✅ Completato

### Database (Migrations)
- ✅ `extend_subscription_contents_with_comprehensive_rules`: 25+ nuovi campi per access/booking/validity/benefits
- ✅ `create_subscription_content_services`: Pivot table per servizi inclusi/esclusi
- ✅ `create_subscription_content_time_restrictions`: Time-based access restrictions
- ✅ Migrations eseguite sui tenant con `php artisan tenants:migrate`

### Models
- ✅ **SubscriptionContent**: Model completo con:
  - Tutti i nuovi campi in $fillable e $casts
  - Relationships: `subscription()`, `price_listable()`, `vat_rate()`, `services()`, `timeRestrictions()`
  - Scopes: `standard()`, `optional()`
  - Helper methods: `hasAccessLimits()`, `hasBookingLimits()`, `hasTimeRestrictions()`, `hasServiceRestrictions()`, `getAccessSummary()`

- ✅ **SubscriptionContentTimeRestriction**: Model per fasce orarie con:
  - Logic methods: `appliesTo()`, `appliesToToday()`, `isTimeAllowed()`
  - `getReadableDescription()` per UI

- ✅ **Subscription**: Già esistente con relationships `standard_content()`, `optional_content()`

### Documentation
- ✅ PROJECT_GUIDELINES.md aggiornato con sezione completa PriceLists
- ✅ Tutti i campi documentati con esempi pratici
- ✅ 10 casistiche d'uso documentate

## 🚧 In Progress / Da Fare

### Backend

#### Controllers
- ⚠️ **SubscriptionController**: Esiste ma usa validation vecchia
  - ❌ Manca validation per nuovi campi (unlimited_entries, daily_entries, etc.)
  - ❌ Manca gestione services (pivot table)
  - ❌ Manca gestione time_restrictions
  - ❌ Manca support per optional_content completo

#### Services
- ⚠️ **SubscriptionPriceListService**: Esiste ma parziale
  - ✅ `store()` e `update()` per standard_content base
  - ✅ `updateOptionalContent()` separato
  - ❌ NON gestisce nuovi campi (access rules, booking rules, etc.)
  - ❌ NON gestisce services (subscription_content_services)
  - ❌ NON gestisce time_restrictions
  - ✅ `getViewAttributes()` carica prodotti disponibili

**Refactor necessario**:
```php
// Deve gestire:
- Access rules (unlimited_entries, total_entries, daily_entries, weekly_entries, monthly_entries)
- Booking rules (max_concurrent_bookings, daily_bookings, weekly_bookings, advance_booking_days, cancellation_hours)
- Validity rules (validity_type, validity_days, validity_months, valid_from, valid_to, freeze_days_allowed, freeze_cost_cents)
- Time restrictions (has_time_restrictions + relationship)
- Service access (service_access_type + services relationship)
- Benefits (guest_passes_total, guest_passes_per_month, multi_location_access, discount_percentage)
- Metadata (sort_order, settings)
```

### Frontend

#### Esistente
- ✅ Route: `/price-lists/subscriptions` (CRUD resource)
- ⚠️ Page: `price-lists/price-lists.tsx` (probabilmente da rifare/espandere)
- ❓ Componenti: Da verificare cosa esiste

#### Da Creare/Aggiornare
1. **SubscriptionForm** - Form principale abbonamento (nome, colore, parent_id)
2. **SubscriptionContentManager** - Gestione contents fissi/opzionabili
3. **ContentAccessRulesForm** - Form per access rules (unlimited, daily, weekly, monthly)
4. **ContentBookingRulesForm** - Form per booking rules
5. **ContentValidityForm** - Form per validity rules con switch type
6. **ContentBenefitsForm** - Form per guest passes, multi-location, discount
7. **ServiceAccessManager** - Gestione servizi inclusi/esclusi con autocomplete
8. **TimeRestrictionManager** - Gestione fasce orarie (tipo TimeSlotManager)

#### UI Structure Proposta
```
┌─ Subscription: Abbonamento Annuale ───────────────────────┐
│ Nome: [________________] Colore: [#____] Parent: [____]   │
│                                                            │
│ ┌─ Contenuti Standard (Sempre Inclusi) ────────────────┐ │
│ │ [+] Aggiungi Prodotto                                 │ │
│ │                                                        │ │
│ │ ┌─ Sala Pesi ─────────────────────────────────────┐  │ │
│ │ │ Prodotto: Sala Pesi                              │  │ │
│ │ │ ☑ Accesso Illimitato                            │  │ │
│ │ │ Validità: [12] mesi                             │  │ │
│ │ │ [⚙️ Regole Avanzate] [🕐 Fasce Orarie]         │  │ │
│ │ └──────────────────────────────────────────────────┘  │ │
│ │                                                        │ │
│ │ ┌─ Corso Yoga Promo ──────────────────────────────┐  │ │
│ │ │ Prodotto: Corso Yoga                            │  │ │
│ │ │ Ingressi Totali: [12]                           │  │ │
│ │ │ Max/Settimana: [2]                              │  │ │
│ │ │ Validità: [1] mese                              │  │ │
│ │ └──────────────────────────────────────────────────┘  │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ ┌─ Contenuti Opzionali (Cliente Sceglie) ──────────────┐ │
│ │ [+] Aggiungi Opzione                                  │ │
│ │                                                        │ │
│ │ ┌─ Personal Training (Opzionale) ─────────────────┐  │ │
│ │ │ Prodotto: PT Session                            │  │ │
│ │ │ Ingressi: [4]                                   │  │ │
│ │ │ Sconto: [10]%                                   │  │ │
│ │ └──────────────────────────────────────────────────┘  │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ [Salva] [Annulla]                                         │
└────────────────────────────────────────────────────────────┘
```

## Prossimi Step (In Ordine)

### Step 1: Refactor Service Layer
1. Aggiornare `SubscriptionPriceListService::store()` per gestire tutti i nuovi campi
2. Aggiornare `SubscriptionPriceListService::update()` per gestire tutti i nuovi campi
3. Aggiungere metodi helper per:
   - `syncServices(SubscriptionContent $content, array $serviceIds)`
   - `syncTimeRestrictions(SubscriptionContent $content, array $restrictions)`

### Step 2: Aggiornare Controller Validation
1. Espandere validation rules in `SubscriptionController::store()`
2. Espandere validation rules in `SubscriptionController::update()`
3. Aggiungere validation per:
   - Access rules fields
   - Booking rules fields
   - Validity rules fields
   - Benefits fields
   - Services array
   - Time restrictions array

### Step 3: Creare Frontend Components Base
1. Creare struttura pagina subscription
2. Form base subscription (nome, colore, parent)
3. SubscriptionContentManager (lista contents con add/remove)

### Step 4: Implementare Forms Dettagliati
1. AccessRulesForm (unlimited toggle + limits)
2. BookingRulesForm
3. ValidityForm (con switch type)
4. BenefitsForm
5. ServiceAccessManager (con autocomplete prodotti)
6. TimeRestrictionManager (simile a TimeSlotManager)

### Step 5: Testing & Refinement
1. Test creazione subscription completa
2. Test update con cambio contents
3. Test validations frontend/backend
4. UX refinements

## Note Tecniche

### Gestione Services (Pivot)
```php
// Nel service, dopo aver creato/aggiornato content:
if (!empty($contentData['services'])) {
    $serviceData = [];
    foreach ($contentData['services'] as $service) {
        $serviceData[$service['id']] = [
            'usage_limit' => $service['usage_limit'] ?? null,
            'usage_period' => $service['usage_period'] ?? null,
        ];
    }
    $content->services()->sync($serviceData);
}
```

### Gestione Time Restrictions
```php
// Nel service:
if (!empty($contentData['time_restrictions'])) {
    $content->timeRestrictions()->delete(); // Clear old
    foreach ($contentData['time_restrictions'] as $restriction) {
        $content->timeRestrictions()->create($restriction);
    }
}
```

### Validation Example
```php
'standard_content.*.unlimited_entries' => 'boolean',
'standard_content.*.total_entries' => 'nullable|integer|min:1',
'standard_content.*.daily_entries' => 'nullable|integer|min:1',
'standard_content.*.weekly_entries' => 'nullable|integer|min:1',
'standard_content.*.validity_type' => 'required|in:duration,fixed_date,first_use',
'standard_content.*.validity_days' => 'nullable|integer|min:1',
'standard_content.*.services' => 'nullable|array',
'standard_content.*.services.*.id' => 'required|exists:products,id',
'standard_content.*.time_restrictions' => 'nullable|array',
'standard_content.*.time_restrictions.*.days' => 'nullable|array',
'standard_content.*.time_restrictions.*.start_time' => 'required|date_format:H:i',
'standard_content.*.time_restrictions.*.end_time' => 'required|date_format:H:i',
```

## File Locations

### Backend
- Models: `app/Models/PriceList/`
  - `Subscription.php`
  - `SubscriptionContent.php`
  - `SubscriptionContentTimeRestriction.php`
- Controllers: `app/Http/Controllers/Application/PriceLists/SubscriptionController.php`
- Services: `app/Services/PriceList/SubscriptionPriceListService.php`
- Migrations: `database/migrations/tenant/2025_11_06_*`

### Frontend (Da creare/verificare)
- Pages: `resources/js/pages/price-lists/`
- Components: `resources/js/components/price-lists/`

### Routes
- `routes/tenant/web/price-lists.php`: Resource già esistente
