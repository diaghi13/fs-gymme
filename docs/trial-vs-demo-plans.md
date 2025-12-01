# Trial vs Demo Plans - Guida Completa

## Indice
1. [Differenza Fondamentale](#differenza-fondamentale)
2. [Giorni di Prova (trial_days)](#giorni-di-prova-trial_days)
3. [Piano di Prova (is_trial_plan)](#piano-di-prova-is_trial_plan)
4. [Strategie di Implementazione](#strategie-di-implementazione)
5. [Setup Demo Plan](#setup-demo-plan)
6. [Gestione Scadenze](#gestione-scadenze)
7. [Best Practices](#best-practices)

---

## Differenza Fondamentale

### Quick Comparison

| Aspetto | `trial_days` | `is_trial_plan` |
|---------|--------------|-----------------|
| **Tipo** | Periodo gratuito su piano pagato | Piano dedicato gratuito |
| **Prezzo piano** | €49/€99/€199 | €0 |
| **Quando paga** | Dopo N giorni automaticamente | Mai (deve scegliere piano) |
| **Features** | Tutte del piano scelto | Limitate (demo) |
| **Carta richiesta** | Sì (per Stripe) | No |
| **Uso tipico** | "Prova Gold gratis 14 giorni" | "Demo gratuita 14 giorni" |
| **Conversione** | Automatica | Manuale (upgrade) |

---

## Giorni di Prova (trial_days)

### Cos'è
Un **periodo gratuito** prima che inizi l'addebito di un piano a **pagamento**.

### Quando Usarlo
- User vuole provare un piano specifico (Base/Gold/Platinum)
- Vuoi conversione automatica (da trial a pagante)
- Hai integrazione Stripe completa

### Esempio

```php
// Piano Gold con trial di 14 giorni
SubscriptionPlan::create([
    'name' => 'Piano Gold',
    'slug' => 'gold',
    'price' => 9900, // €99/mese DOPO il trial
    'interval' => 'monthly',
    'trial_days' => 14, // ← 14 giorni GRATIS
    'is_trial_plan' => false, // Piano normale a pagamento
    'tier' => 'gold',
]);
```

### Flusso User

```
DAY 1:
User si iscrive a Piano Gold
→ Inserisce carta di credito (richiesta da Stripe)
→ Status: 'trial'
→ trial_ends_at: now() + 14 giorni
→ Accesso: TUTTE le features Gold

DAY 14:
Trial scade
→ Stripe webhook: customer.subscription.updated
→ Status: 'active'
→ Addebito automatico: €99
→ Accesso: continua normalmente

DAY 44 (fine primo mese):
Rinnovo automatico
→ Addebito: €99
→ Continua ogni mese...
```

### Implementazione

```php
// Controller subscription
public function subscribe(Request $request, SubscriptionPlan $plan)
{
    $checkout = Stripe\Checkout\Session::create([
        'customer_email' => $user->email,
        'payment_method_types' => ['card'],
        'line_items' => [[
            'price' => $plan->stripe_price_id,
            'quantity' => 1,
        ]],
        'mode' => 'subscription',
        'subscription_data' => [
            'trial_period_days' => $plan->trial_days, // ← Stripe gestisce il trial
        ],
        'success_url' => route('subscription.success'),
        'cancel_url' => route('subscription.cancel'),
    ]);

    return redirect($checkout->url);
}

// Webhook Stripe
public function handleCheckoutCompleted($session)
{
    TenantSubscription::create([
        'tenant_id' => $tenant->id,
        'subscription_plan_id' => $plan->id,
        'stripe_subscription_id' => $session->subscription,
        'starts_at' => now(),
        'trial_ends_at' => $plan->trial_days > 0
            ? now()->addDays($plan->trial_days)
            : null,
        'status' => $plan->trial_days > 0 ? 'trial' : 'active',
    ]);
}
```

### Pro & Contro

**Pro:**
- ✅ Conversione automatica (meno friction)
- ✅ User prova il prodotto completo
- ✅ Gestito da Stripe (affidabile)
- ✅ Billing automatico

**Contro:**
- ❌ Richiede carta di credito subito (barrier)
- ❌ User può dimenticare di cancellare (bad UX)
- ❌ Possibili chargeback se user non voleva pagare

---

## Piano di Prova (is_trial_plan)

### Cos'è
Un **piano separato**, completamente gratuito, con funzionalità **limitate**, usato per demo/onboarding.

### Quando Usarlo
- Onboarding senza barriere (no carta richiesta)
- Demo per sales/marketing
- Freemium model (versione gratuita permanente)
- User indecisi che vogliono esplorare

### Esempio

```php
// Piano Demo dedicato
SubscriptionPlan::create([
    'name' => 'Demo Gratuita',
    'slug' => 'demo',
    'description' => 'Prova Gymme per 14 giorni con funzionalità limitate',
    'price' => 0, // ← SEMPRE GRATIS
    'interval' => 'monthly',
    'trial_days' => 0, // Non serve, è già gratis
    'is_trial_plan' => true, // ← Piano dedicato al trial
    'tier' => null,
    'is_active' => true,
    'sort_order' => 0, // Mostra per primo
]);

// Configura features LIMITATE
$demoPlan->features()->attach($maxUsersFeature->id, [
    'is_included' => true,
    'quota_limit' => 5, // Solo 5 utenti (vs 50 in Gold)
    'price_cents' => null,
]);

$demoPlan->features()->attach($electronicInvoicingFeature->id, [
    'is_included' => false, // NON disponibile in demo
    'quota_limit' => null,
    'price_cents' => null,
]);
```

### Flusso User

```
DAY 1:
User si registra
→ Sceglie "Demo Gratuita"
→ NO carta di credito richiesta
→ Status: 'trial'
→ ends_at: now() + 14 giorni
→ Accesso: features LIMITATE (5 utenti, 1 GB, no fatturazione)

DAY 7:
User raggiunge limite (5 utenti)
→ Mostra paywall: "Upgrade a Piano Gold per più utenti"
→ User può continuare demo ma non aggiungere utenti

DAY 14:
Demo scade
→ Job schedulato: status → 'expired'
→ Email: "Trial scaduto, scegli un piano per continuare"
→ Middleware blocca accesso
→ Redirect: /subscription-plans (scegli piano)

User sceglie Piano Gold:
→ Migrazione dati da demo a Gold
→ Tutte le features sbloccate
→ Billing attivo (€99/mese)
```

### Implementazione

#### 1. Seeder Demo Plan

```php
// database/seeders/DemoSubscriptionPlanSeeder.php
$demoPlan = SubscriptionPlan::create([
    'name' => 'Demo Gratuita',
    'price' => 0,
    'is_trial_plan' => true,
]);

// Features limitate
$demoPlan->features()->attach($maxUsers->id, [
    'is_included' => true,
    'quota_limit' => 5, // Molto limitato
]);
```

#### 2. Registrazione con Demo

```php
// TenantRegistrationController
public function store(Request $request)
{
    $tenant = Tenant::create([...]);

    // Assegna automaticamente Demo Plan
    $demoPlan = SubscriptionPlan::where('is_trial_plan', true)->first();

    TenantSubscription::create([
        'tenant_id' => $tenant->id,
        'subscription_plan_id' => $demoPlan->id,
        'starts_at' => now(),
        'ends_at' => now()->addDays(14), // ← Demo dura 14 giorni
        'status' => 'trial',
        'payment_method' => null, // No payment
    ]);
}
```

#### 3. Scadenza Demo

```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule)
{
    // Controlla trial scaduti ogni giorno
    $schedule->call(function () {
        $demoPlanIds = SubscriptionPlan::where('is_trial_plan', true)
            ->pluck('id');

        TenantSubscription::where('status', 'trial')
            ->whereIn('subscription_plan_id', $demoPlanIds)
            ->where('ends_at', '<', now())
            ->each(function ($subscription) {
                // Marca come scaduto
                $subscription->update(['status' => 'expired']);

                // Invia email
                Mail::to($subscription->tenant->owner)
                    ->send(new DemoExpiredMail($subscription));

                // Log
                Log::info("Demo expired for tenant: {$subscription->tenant_id}");
            });
    })->daily();
}
```

#### 4. Middleware Blocco Accesso

```php
// app/Http/Middleware/CheckSubscriptionStatus.php
public function handle(Request $request, Closure $next)
{
    $subscription = $request->user()->tenant->subscription;

    if ($subscription->status === 'expired') {
        return redirect()->route('app.subscription-plans.index')
            ->with('warning', 'Il tuo periodo di prova è scaduto. Scegli un piano per continuare a usare Gymme.');
    }

    return $next($request);
}
```

### Pro & Contro

**Pro:**
- ✅ Nessuna barriera (no carta)
- ✅ User esplora liberamente
- ✅ Controllo completo sulla durata
- ✅ Nessun rischio di addebiti indesiderati
- ✅ Ideale per sales/marketing

**Contro:**
- ❌ Conversione manuale (friction)
- ❌ User può dimenticare di upgradefare
- ❌ Più codice custom da gestire
- ❌ Necessita job schedulati

---

## Strategie di Implementazione

### Strategia 1: Solo Trial Days (Semplice)

**Setup:**
```php
Piano Base: €49/mese, trial_days = 14
Piano Gold: €99/mese, trial_days = 14
Piano Platinum: €199/mese, trial_days = 30
```

**Pro:** Semplice, conversione automatica
**Contro:** Richiede carta subito

**Ideale per:** B2B, clienti enterprise, chi ha già budget

---

### Strategia 2: Solo Demo Plan (User-Friendly)

**Setup:**
```php
Demo: €0, is_trial_plan = true, 14 giorni
Piano Base: €49/mese, trial_days = 0
Piano Gold: €99/mese, trial_days = 0
```

**Pro:** Zero barriere, user esplora
**Contro:** Conversione manuale

**Ideale per:** B2C, startup, primo contatto user

---

### Strategia 3: Demo + Trial (CONSIGLIATO)

**Setup:**
```php
Demo: €0, is_trial_plan = true, 14 giorni
Piano Gold: €99/mese, trial_days = 7
```

**Flusso:**
```
1. User inizia con Demo (14 giorni, no carta)
2. Giorno 10: decide di upgradefare a Gold
3. Riceve ALTRI 7 giorni gratis (trial_days di Gold)
4. Totale: 21 giorni gratis prima di pagare
```

**Pro:** Massima flessibilità, doppio trial
**Contro:** Più complesso da gestire

**Ideale per:** Prodotto SaaS maturo, vuoi massimizzare conversioni

---

## Setup Demo Plan

### Passaggi Operativi

#### 1. Creare Features per Demo

```php
// Features che saranno limitate in demo
PlanFeature::create([
    'name' => 'max_users',
    'display_name' => 'Utenti Massimi',
    'feature_type' => 'quota',
    'default_addon_quota' => 10,
]);

PlanFeature::create([
    'name' => 'storage_gb',
    'display_name' => 'Storage GB',
    'feature_type' => 'quota',
]);

PlanFeature::create([
    'name' => 'electronic_invoicing',
    'display_name' => 'Fatturazione Elettronica',
    'feature_type' => 'boolean',
]);
```

#### 2. Eseguire Seeder

```bash
php artisan db:seed --class=DemoSubscriptionPlanSeeder
```

Output:
```
✓ Created Demo Plan
  ✓ Max Users: 5 (included)
  ✓ Storage: 1 GB (included)
  ✓ Electronic Invoicing: Not included

Demo Plan Summary:
  - Name: Demo Gratuita
  - Price: FREE
  - Duration: 14 days
  - Max Users: 5
```

#### 3. UI per Selezione

```php
// SubscriptionPlanChoiceController
public function __invoke()
{
    $plans = SubscriptionPlan::active()
        ->orderBy('sort_order')
        ->get();

    return Inertia::render('SubscriptionPlanChoice', [
        'plans' => $plans,
    ]);
}
```

```tsx
// SubscriptionPlanChoice.tsx
{plans.map(plan => (
  <Card key={plan.id}>
    <CardContent>
      <Typography variant="h5">{plan.display_name}</Typography>

      {plan.is_trial_plan && (
        <Chip label="DEMO GRATUITA" color="success" />
      )}

      <Typography variant="h4">
        {plan.price === 0 ? 'Gratis' : `€${(plan.price / 100).toFixed(2)}/mese`}
      </Typography>

      {plan.trial_days > 0 && (
        <Typography variant="caption">
          Prova gratis per {plan.trial_days} giorni
        </Typography>
      )}

      <Button onClick={() => subscribe(plan)}>
        {plan.is_trial_plan ? 'Inizia Demo' : 'Abbonati'}
      </Button>
    </CardContent>
  </Card>
))}
```

---

## Gestione Scadenze

### Email Promemoria

```php
// app/Mail/DemoExpiringMail.php
class DemoExpiringMail extends Mailable
{
    public function build()
    {
        return $this->subject('La tua demo scade tra 3 giorni')
            ->markdown('emails.demo-expiring', [
                'daysLeft' => 3,
                'upgradeUrl' => route('app.subscription-plans.index'),
            ]);
    }
}

// Job schedulato
$schedule->call(function () {
    $expiringSoon = TenantSubscription::where('status', 'trial')
        ->where('ends_at', '>=', now())
        ->where('ends_at', '<=', now()->addDays(3))
        ->get();

    foreach ($expiringSoon as $subscription) {
        Mail::to($subscription->tenant->owner)
            ->send(new DemoExpiringMail());
    }
})->daily();
```

### Graceful Degradation

Invece di bloccare completamente, puoi degradare:

```php
// Middleware
if ($subscription->status === 'expired') {
    // Permetti accesso READ-ONLY
    if (!$request->isMethod('GET')) {
        return redirect()->back()
            ->with('error', 'Demo scaduta. Upgrade per continuare.');
    }
}
```

---

## Best Practices

### 1. Comunicazione Chiara

❌ **Male:**
```
"Prova gratis"
(User non sa se è trial su piano pagato o piano demo)
```

✅ **Bene:**
```
Piano Demo: "14 giorni gratis, nessuna carta richiesta"
Piano Gold: "Prova Gold gratis per 14 giorni, poi €99/mese"
```

### 2. Limiti Demo Ragionevoli

❌ **Troppo Limitato:**
```
Demo: 1 utente, 100 MB storage
→ User non può testare seriamente
```

✅ **Giusto:**
```
Demo: 5 utenti, 1 GB storage
→ Sufficiente per testare workflow completo
```

### 3. Email Progressive

```
Giorno 1:  "Benvenuto! Ecco come iniziare"
Giorno 3:  "Hai provato feature X?"
Giorno 7:  "Sei a metà demo, hai bisogno di aiuto?"
Giorno 11: "La tua demo scade tra 3 giorni. Upgrade ora!"
Giorno 14: "Demo scaduta. Ecco i nostri piani"
```

### 4. Incentivi Upgrade

```php
// Sconto early bird
if ($daysIntoTrial <= 7) {
    $discount = 20; // 20% se upgrade entro 7 giorni
}

// Porta dati con te
"Tutti i tuoi dati saranno mantenuti quando fai upgrade"
```

---

## Testing

```php
// tests/Feature/SubscriptionPlanTest.php

it('allows signup with demo plan without payment', function () {
    $demoPlan = SubscriptionPlan::factory()->create([
        'price' => 0,
        'is_trial_plan' => true,
    ]);

    $response = $this->post('/subscribe', [
        'plan_id' => $demoPlan->id,
    ]);

    $response->assertRedirect('/dashboard');
    expect(TenantSubscription::first()->status)->toBe('trial');
});

it('expires demo after 14 days', function () {
    $subscription = TenantSubscription::factory()->create([
        'status' => 'trial',
        'ends_at' => now()->subDay(),
    ]);

    $this->artisan('schedule:run');

    expect($subscription->fresh()->status)->toBe('expired');
});

it('blocks access when demo expired', function () {
    $this->actingAs($userWithExpiredDemo);

    $response = $this->get('/dashboard');

    $response->assertRedirect('/subscription-plans');
});
```

---

## Riepilogo

**Use `trial_days` quando:**
- ✅ Vuoi conversione automatica
- ✅ User ha già budget/carta
- ✅ Prodotto maturo con pricing chiaro

**Use `is_trial_plan` quando:**
- ✅ Vuoi onboarding senza friction
- ✅ Target B2C o utenti indecisi
- ✅ Vuoi controllare scadenza manualmente
- ✅ Serve demo per sales/marketing

**Use entrambi quando:**
- ✅ Vuoi massimizzare conversioni
- ✅ Hai risorse per gestire complessità
- ✅ Vuoi dare 2 opportunità di trial

---

**Ultima modifica:** 2025-12-01
**Versione:** 1.0
