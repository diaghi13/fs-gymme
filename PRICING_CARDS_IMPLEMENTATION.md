# Implementazione Sistema Pricing Cards

Questo documento descrive l'implementazione del sistema di card per i piani di abbonamento, con componenti riutilizzabili e dinamici.

## Architettura

### 1. Componente Riutilizzabile: `PricingCard`

**Path**: `resources/js/components/subscription-plans/PricingCard.tsx`

Componente standalone che usa **solo Tailwind CSS**, identico allo stile della landing-new. Può essere utilizzato ovunque nell'applicazione senza dipendenze da Material-UI.

**Caratteristiche**:
- ✅ 100% Tailwind CSS
- ✅ Dark theme nativo
- ✅ Variante "highlighted" con badge "POPOLARE"
- ✅ Supporto Link (Inertia) e onClick handlers
- ✅ Lista dinamica features
- ✅ Trial period badge
- ✅ Responsive design

**Utilizzo**:
```tsx
import PricingCard from '@/components/subscription-plans/PricingCard';

<PricingCard
  name="Fitness Pro"
  description="Tutto quello che serve per scalare."
  price={69.00}
  interval="month"
  trial_days={14}
  features={planFeatures}
  highlighted={true}
  ctaText="PROVA GRATIS"
  ctaHref="/register?plan=pro"
/>
```

### 2. Wrapper Admin: `PlanCard`

**Path**: `resources/js/components/central/subscription-plans/PlanCard.tsx`

Componente wrapper per l'area admin che supporta due varianti:
- **purchase**: Stile Material-UI per gestione admin
- **marketing**: Delega al componente `PricingCard` riutilizzabile

**Utilizzo**:
```tsx
import PlanCard from '@/components/central/subscription-plans/PlanCard';

{/* Variante Admin */}
<PlanCard variant="purchase" {...planData} />

{/* Variante Marketing (usa PricingCard internamente) */}
<PlanCard variant="marketing" {...planData} />
```

### 3. Controller per Landing Dinamiche

**Path**: `app/Http/Controllers/PricingController.php`

Controller che carica i piani attivi con le loro features e li passa a Inertia.

**Funzionalità**:
- Carica solo piani attivi
- Include features con pivot data (is_included, quota_limit)
- Ordina per sort_order e price
- Converte tier enum in valore stringa
- **MoneyCast** già converte i prezzi in euro

**Esempio Route**:
```php
Route::get('/pricing', [PricingController::class, 'index'])->name('pricing');
```

## Esempi di Utilizzo

### Caso 1: Landing Page Dinamica

```tsx
// resources/js/pages/users/pricing-example.tsx
import PricingCard from '@/components/subscription-plans/PricingCard';

const PricingPage = ({ plans }) => (
  <div className="bg-brand-dark min-h-screen py-20">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {plans
        .filter(p => p.is_active)
        .map(plan => (
          <PricingCard
            key={plan.id}
            name={plan.name}
            description={plan.description}
            price={plan.price}
            interval={plan.interval}
            trial_days={plan.trial_days}
            features={plan.features}
            highlighted={plan.tier === 'gold'}
            ctaHref={`/register?plan=${plan.slug}`}
          />
        ))}
    </div>
  </div>
);
```

### Caso 2: Preview Admin

```tsx
// resources/js/pages/central/subscription-plans/show.tsx
import PlanCard from '@/components/central/subscription-plans/PlanCard';

<Grid container spacing={3}>
  {/* Preview Admin Style */}
  <Grid size={6}>
    <PlanCard
      variant="purchase"
      {...subscriptionPlan}
      features={planFeatures}
    />
  </Grid>

  {/* Preview Marketing Style */}
  <Grid size={6}>
    <Box sx={{ bgcolor: '#0F1419', p: 2 }}>
      <PlanCard
        variant="marketing"
        {...subscriptionPlan}
        features={planFeatures}
      />
    </Box>
  </Grid>
</Grid>
```

### Caso 3: Modal/Dialog di Upgrade

```tsx
import PricingCard from '@/components/subscription-plans/PricingCard';

<Dialog open={showUpgradeModal}>
  <div className="bg-brand-dark p-6">
    <PricingCard
      name="Upgrade a Pro"
      price={99.00}
      interval="month"
      features={upgradeFeatures}
      highlighted={true}
      ctaText="Conferma Upgrade"
      onCtaClick={handleUpgrade}
    />
  </div>
</Dialog>
```

## Dati Backend

Il controller restituisce i piani in questo formato:

```php
[
    'id' => 1,
    'name' => 'Fitness Pro',
    'slug' => 'fitness-pro',
    'description' => 'Tutto quello che serve per scalare.',
    'price' => 69.00, // MoneyCast converte da centesimi a euro
    'currency' => 'EUR',
    'interval' => 'month',
    'trial_days' => 14,
    'tier' => 'gold', // Enum convertito a stringa
    'is_active' => true,
    'features' => [
        [
            'id' => 1,
            'name' => 'unlimited_members',
            'display_name' => 'Iscritti Illimitati',
            'is_included' => true,
            'quota_limit' => null,
        ],
        // ...
    ],
]
```

## Integrazione con Landing Esistente

Per integrare i piani dinamici nella `landing-new.tsx`, sostituire la sezione `<Pricing>` hardcoded con:

```tsx
// landing-new.tsx
import PricingCard from '@/components/subscription-plans/PricingCard';

const LandingNew = ({ plans }) => (
  <div>
    {/* Hero, Features, etc. */}

    {/* Pricing Section - Dinamica */}
    <div id="pricing" className="py-32 bg-brand-dark">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-white">
            INVESTI NELLA CRESCITA
          </h2>
          <p className="text-brand-muted">Piani trasparenti. Nessun costo nascosto.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {plans
            .filter(p => p.is_active)
            .map(plan => (
              <PricingCard
                key={plan.id}
                name={plan.name}
                description={plan.description}
                price={plan.price}
                interval={plan.interval}
                trial_days={plan.trial_days}
                features={plan.features}
                highlighted={plan.tier === 'gold'}
                ctaText={plan.tier === 'gold' ? 'PROVA GRATIS' : `Scegli ${plan.name}`}
                ctaHref={route('tenant.register')}
              />
            ))}
        </div>
      </div>
    </div>

    {/* Contact, Footer, etc. */}
  </div>
);
```

E nel controller:

```php
// Route che rende la landing
Route::get('/', function () {
    $plans = SubscriptionPlan::where('is_active', true)
        ->orderBy('sort_order')
        ->with(['features' => fn($q) => $q->where('is_active', true)])
        ->get()
        ->map(function ($plan) {
            // Same mapping as PricingController
        });

    return Inertia::render('users/landing-new', [
        'plans' => $plans,
    ]);
});
```

## File Creati/Modificati

### Nuovi File
- `resources/js/components/subscription-plans/PricingCard.tsx` - Componente riutilizzabile
- `resources/js/components/subscription-plans/README.md` - Documentazione componente
- `resources/js/pages/users/pricing-example.tsx` - Esempio pagina pricing dinamica
- `app/Http/Controllers/PricingController.php` - Controller per landing dinamiche
- `PRICING_CARDS_IMPLEMENTATION.md` - Questa documentazione

### File Modificati
- `resources/js/components/central/subscription-plans/PlanCard.tsx` - Aggiunta variante marketing che usa PricingCard
- `resources/js/pages/central/subscription-plans/show.tsx` - Preview di entrambe le varianti

## Vantaggi

1. **Riutilizzabilità**: Un solo componente per landing, admin preview, modal, etc.
2. **Consistenza**: Lo stile è identico alla landing-new
3. **Dinamico**: I piani vengono caricati dal database, non hardcoded
4. **Manutenibilità**: Modifiche allo stile in un solo posto
5. **Flessibilità**: Supporta sia Link che onClick handlers
6. **Type Safety**: TypeScript interfaces per tutti i dati

## Note Importanti

- **MoneyCast**: I prezzi sono già in euro (float), non centesimi
- **Features**: Solo le features con `is_included: true` vengono mostrate
- **Dark Background**: Il componente richiede sfondo scuro (bg-brand-dark)
- **Tier Highlight**: Il piano con `tier === 'gold'` viene evidenziato
- **Responsive**: Usa `md:` breakpoints per mobile/desktop
