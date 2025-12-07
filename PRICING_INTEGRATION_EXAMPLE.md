# Esempio Integrazione Pricing Dinamico nella Landing

Questo file mostra esattamente come modificare `landing-new.tsx` per usare i piani dinamici dal database.

## Step 1: Modificare il Controller

```php
// routes/web.php o routes/guest.php
use App\Http\Controllers\PricingController;
use App\Models\SubscriptionPlan;

Route::get('/', function () {
    // Carica i piani attivi
    $plans = SubscriptionPlan::query()
        ->where('is_active', true)
        ->orderBy('sort_order')
        ->orderBy('price')
        ->get()
        ->map(function ($plan) {
            $features = $plan->features()
                ->withPivot(['is_included', 'quota_limit'])
                ->where('is_active', true)
                ->orderBy('sort_order')
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
                'price' => $plan->price, // MoneyCast converte in euro
                'interval' => $plan->interval,
                'trial_days' => $plan->trial_days,
                'tier' => $plan->tier?->value,
                'features' => $features,
            ];
        });

    return Inertia::render('users/landing-new', [
        'plans' => $plans,
    ]);
})->name('landing');
```

## Step 2: Modificare landing-new.tsx

### 2.1 Aggiungere Import

```tsx
// All'inizio del file, aggiungere:
import PricingCard from '@/components/subscription-plans/PricingCard';

// Aggiungere l'interface per i piani
interface PlanFeature {
  id: number;
  name: string;
  display_name: string;
  is_included: boolean;
  quota_limit: number | null;
}

interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  interval: string;
  trial_days: number;
  tier: string | null;
  features: PlanFeature[];
}
```

### 2.2 Modificare il componente Pricing

Sostituire l'intero componente `Pricing` con questo:

```tsx
// PRIMA (hardcoded):
const Pricing = () => {
  return (
    <div id="pricing" className="py-32 bg-brand-dark relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">
            INVESTI NELLA<br />CRESCITA.
          </h2>
          <p className="text-brand-muted">Piani trasparenti. Nessun costo nascosto.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Hardcoded cards... */}
        </div>
      </div>
    </div>
  );
};

// DOPO (dinamico):
const Pricing = ({ plans }: { plans: SubscriptionPlan[] }) => {
  return (
    <div id="pricing" className="py-32 bg-brand-dark relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">
            INVESTI NELLA<br />CRESCITA.
          </h2>
          <p className="text-brand-muted">Piani trasparenti. Nessun costo nascosto.</p>
        </div>

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
              ctaHref={route('tenant.register')}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
```

### 2.3 Modificare il componente principale

```tsx
// PRIMA:
const LandingNew = () => {
  return (
    <>
      <Head title="GymMe - Gestionale per Palestre" />
      <div className="min-h-screen bg-brand-dark text-white overflow-x-hidden">
        <Header />
        <Hero />
        <Stats />
        <Features />
        <Testimonials />
        <Pricing />  {/* ⚠️ Senza props */}
        <Contact />
        <Footer />
      </div>
    </>
  );
};

// DOPO:
interface LandingNewProps {
  plans: SubscriptionPlan[];
}

const LandingNew = ({ plans }: LandingNewProps) => {
  return (
    <>
      <Head title="GymMe - Gestionale per Palestre" />
      <div className="min-h-screen bg-brand-dark text-white overflow-x-hidden">
        <Header />
        <Hero />
        <Stats />
        <Features />
        <Testimonials />
        <Pricing plans={plans} />  {/* ✅ Con props */}
        <Contact />
        <Footer />
      </div>
    </>
  );
};
```

## Step 3: Testare

1. Assicurarsi che ci siano piani attivi nel database:
   ```bash
   php artisan tinker
   >>> \App\Models\SubscriptionPlan::where('is_active', true)->count()
   >>> # Dovrebbe essere > 0
   ```

2. Se non ci sono piani, eseguire il seeder:
   ```bash
   php artisan db:seed --class=SubscriptionPlanWithFeaturesSeeder
   ```

3. Visitare la landing page e verificare che i piani vengano mostrati correttamente

## Risultato Finale

Ora la landing page:
- ✅ Mostra i piani direttamente dal database
- ✅ Aggiorna automaticamente quando si modificano i piani nell'admin
- ✅ Mantiene lo stesso stile della versione hardcoded
- ✅ Supporta trial periods, features dinamiche, tier highlighting
- ✅ È completamente type-safe con TypeScript

## Backup della Versione Hardcoded

Prima di fare le modifiche, è consigliabile fare un backup:

```bash
cp resources/js/pages/users/landing-new.tsx resources/js/pages/users/landing-new.tsx.backup
```

In questo modo puoi sempre tornare alla versione hardcoded se necessario.

## Alternative: Mantenere Entrambe le Versioni

Se vuoi mantenere sia la versione hardcoded che quella dinamica:

1. Rinomina `landing-new.tsx` in `landing-hardcoded.tsx`
2. Crea `landing-dynamic.tsx` con la nuova versione
3. Scegli quale usare nella route:

```php
// Versione statica
Route::get('/', fn() => Inertia::render('users/landing-hardcoded'))->name('landing');

// Versione dinamica
Route::get('/', [PricingController::class, 'landing'])->name('landing');
```
