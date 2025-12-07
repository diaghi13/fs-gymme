# PricingCard Component

Componente riutilizzabile per mostrare i piani di abbonamento con stile Tailwind, identico a quello usato nella landing page.

## Caratteristiche

- **100% Tailwind CSS**: Usa solo Tailwind, nessuna dipendenza da Material-UI
- **Responsive**: Design ottimizzato per mobile e desktop
- **Dark Theme**: Matching dello stile della landing-new
- **Highlighted Variant**: Badge "POPOLARE" per il piano consigliato
- **Flexible CTA**: Supporta sia Link (Inertia) che onClick handler
- **Dynamic Features**: Lista automatica delle feature incluse

## Utilizzo Base

```tsx
import PricingCard from '@/components/subscription-plans/PricingCard';

<PricingCard
  name="Fitness Pro"
  description="Tutto quello che serve per scalare."
  price={69.00}
  interval="month"
  trial_days={14}
  features={[
    { id: 1, name: 'unlimited_members', display_name: 'Iscritti Illimitati', is_included: true, quota_limit: null },
    { id: 2, name: 'invoicing', display_name: 'Fatturazione Elettronica', is_included: true, quota_limit: null },
  ]}
  highlighted={true}
  ctaText="PROVA GRATIS"
  ctaHref="/register?plan=pro"
/>
```

## Props

| Prop | Type | Default | Descrizione |
|------|------|---------|-------------|
| `name` | `string` | required | Nome del piano |
| `description` | `string \| null` | `undefined` | Descrizione breve del piano |
| `price` | `number` | required | Prezzo in euro (già convertito da MoneyCast) |
| `interval` | `string` | required | Intervallo: 'month', 'year', etc. |
| `trial_days` | `number` | `0` | Giorni di prova gratuita |
| `features` | `PricingCardFeature[]` | `[]` | Lista delle features |
| `highlighted` | `boolean` | `false` | Se true, applica lo stile "POPOLARE" |
| `ctaText` | `string` | `'Scegli questo piano'` | Testo del bottone CTA |
| `ctaHref` | `string` | `undefined` | URL per Link component (Inertia) |
| `onCtaClick` | `() => void` | `undefined` | Handler per click del bottone |
| `disabled` | `boolean` | `false` | Disabilita il bottone CTA |

## Interface PricingCardFeature

```tsx
interface PricingCardFeature {
  id: number;
  name: string;
  display_name: string;
  is_included: boolean;
  quota_limit: number | null;
}
```

## Esempi di Utilizzo

### 1. Landing Page con Dati Dinamici

```tsx
// resources/js/pages/users/pricing.tsx
import PricingCard from '@/components/subscription-plans/PricingCard';

const PricingPage = ({ plans }) => (
  <div className="min-h-screen bg-brand-dark">
    <div className="container mx-auto px-4 py-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {plans.map((plan) => (
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
            ctaHref={`/register?plan=${plan.slug}`}
          />
        ))}
      </div>
    </div>
  </div>
);
```

### 2. Admin Preview (tramite PlanCard)

```tsx
// resources/js/components/central/subscription-plans/PlanCard.tsx
import PricingCard from '@/components/subscription-plans/PricingCard';

const PlanCard = ({ variant, ...props }) => {
  if (variant === 'marketing') {
    return <PricingCard {...props} />;
  }

  // Material-UI variant...
};
```

### 3. Modal o Dialog

```tsx
import PricingCard from '@/components/subscription-plans/PricingCard';

<Dialog open={open}>
  <div className="bg-brand-dark p-4">
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

## Backend Controller Example

```php
// app/Http/Controllers/PricingController.php
public function index(): Response
{
    $plans = SubscriptionPlan::query()
        ->where('is_active', true)
        ->orderBy('sort_order')
        ->get()
        ->map(function ($plan) {
            $features = $plan->features()
                ->withPivot(['is_included', 'quota_limit'])
                ->where('is_active', true)
                ->get()
                ->map(fn ($f) => [
                    'id' => $f->id,
                    'name' => $f->name,
                    'display_name' => $f->display_name,
                    'is_included' => $f->pivot->is_included,
                    'quota_limit' => $f->pivot->quota_limit,
                ]);

            return [
                'id' => $plan->id,
                'name' => $plan->name,
                'slug' => $plan->slug,
                'description' => $plan->description,
                'price' => $plan->price, // MoneyCast già converte in euro
                'interval' => $plan->interval,
                'trial_days' => $plan->trial_days,
                'tier' => $plan->tier?->value,
                'features' => $features,
            ];
        });

    return Inertia::render('users/pricing', ['plans' => $plans]);
}
```

## Stile e Design

Il componente usa esattamente lo stesso stile della landing-new:

- **Background normale**: `bg-brand-surface` con bordo `border-white/5`
- **Background highlighted**: `bg-[#1A2333]` con bordo `border-brand-accent` e glow effect
- **Badge POPOLARE**: Posizionato in alto a destra con `bg-brand-accent`
- **Transizioni**: Hover effects su bordi e bottoni
- **Typography**: Font sizes responsive (text-3xl/text-4xl)
- **Spacing**: Padding e gap consistenti con il design system

## Note Importanti

1. **MoneyCast**: Il componente si aspetta il prezzo già in euro (float), non in centesimi
2. **Features Filter**: Mostra solo le feature con `is_included: true`
3. **Dark Background**: Il componente è progettato per sfondi scuri. Avvolgere in un container con `bg-brand-dark` se necessario
4. **Responsive**: Usa `md:` breakpoints per layout mobile/desktop
5. **Accessibility**: Il bottone supporta stato `disabled` per piani non attivi
