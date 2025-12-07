# Guida Completa: Sincronizzazione Stripe

Questo documento spiega come funziona il sistema di sincronizzazione automatica tra i piani di abbonamento nel database e Stripe.

## 📚 Indice

1. [Panoramica](#panoramica)
2. [Architettura](#architettura)
3. [Configurazione](#configurazione)
4. [Utilizzo](#utilizzo)
5. [Gestione Errori](#gestione-errori)
6. [Best Practices](#best-practices)

---

## 🎯 Panoramica

Il sistema gestisce automaticamente la sincronizzazione bidirezionale tra:
- **Database locale**: `subscription_plans` table
- **Stripe**: Products e Prices API

### Cosa Viene Sincronizzato

| Campo Locale | Stripe Product | Stripe Price | Note |
|--------------|----------------|--------------|------|
| `name` | ✓ name | - | Nome visualizzato |
| `description` | ✓ description | - | Descrizione piano |
| `price` | - | ✓ unit_amount | In centesimi |
| `currency` | - | ✓ currency | ISO code lowercase |
| `interval` | - | ✓ recurring.interval | month/year |
| `trial_days` | - | ✓ metadata | Giorni prova |
| `is_active` | ✓ active | ✓ active | Attivo/Archiviato |
| `tier` | ✓ metadata | ✓ metadata | demo/base/gold/platinum |

---

## 🏗️ Architettura

### Componenti del Sistema

```
┌─────────────────────────────────────────────────────┐
│           Frontend (Admin Panel)                     │
│  resources/js/pages/central/subscription-plans/*    │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│         Controller Layer                             │
│  SubscriptionPlanController.php                      │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│         Model Layer                                  │
│  SubscriptionPlan.php (Model)                        │
│  + SubscriptionPlanObserver.php (Observer)           │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│         Service Layer                                │
│  StripeProductService.php                            │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│         Stripe API                                   │
│  Products & Prices                                   │
└─────────────────────────────────────────────────────┘
```

### File Principali

1. **StripeProductService.php** (`app/Services/`)
   - Logica business per sync Stripe
   - Gestione creazione/update/archiving
   - Gestione immutabilità Prices

2. **SubscriptionPlanObserver.php** (`app/Observers/`)
   - Ascolta eventi Model (created, updated, deleted)
   - Triggera sync automatico
   - Gestione errori graceful

3. **SyncSubscriptionPlansToStripe.php** (`app/Console/Commands/`)
   - Comando manuale: `php artisan stripe:sync-plans`
   - Sync bulk o singolo piano
   - Progress bar e reports

---

## ⚙️ Configurazione

### 1. Environment Variables

Aggiungi le tue chiavi Stripe nel file `.env`:

```env
# Stripe Configuration
STRIPE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Cashier Configuration
CASHIER_CURRENCY=eur
CASHIER_CURRENCY_LOCALE=it_IT
CASHIER_LOGGER=stack
```

### 2. Verifica Configurazione

Controlla che Cashier sia configurato correttamente:

```bash
php artisan tinker
>>> config('cashier.key')
=> "pk_test_xxxxx"
>>> config('cashier.secret')
=> "sk_test_xxxxx"
```

### 3. Database

Assicurati che la tabella `subscription_plans` abbia le colonne Stripe:

```php
Schema::table('subscription_plans', function (Blueprint $table) {
    $table->string('stripe_product_id')->nullable()->after('slug');
    $table->string('stripe_price_id')->nullable()->after('stripe_product_id');
});
```

---

## 🚀 Utilizzo

### Sync Automatico (Consigliato)

Il sistema sincronizza automaticamente quando:

#### 1. Crei un Nuovo Piano

```php
// Nel controller o admin panel
$plan = SubscriptionPlan::create([
    'name' => 'Gold Plan',
    'price' => 69.00, // MoneyCast lo converte in 6900 centesimi
    'currency' => 'EUR',
    'interval' => 'month',
    'trial_days' => 14,
    'is_active' => true,
]);

// Automaticamente:
// - Crea Stripe Product
// - Crea Stripe Price
// - Salva stripe_product_id e stripe_price_id nel DB
```

#### 2. Modifichi un Piano Esistente

```php
$plan = SubscriptionPlan::find(1);

// Cambio nome/descrizione -> aggiorna Product
$plan->update([
    'name' => 'Gold Plan Plus',
    'description' => 'Now with more features!',
]);

// Cambio prezzo -> archivia vecchia Price, crea nuova
$plan->update([
    'price' => 79.00, // Nuova price_id verrà creata
]);
```

#### 3. Elimini un Piano

```php
$plan = SubscriptionPlan::find(1);
$plan->delete();

// Automaticamente:
// - Archivia (active: false) Stripe Product
// - Archivia (active: false) Stripe Price
// - NON elimina da Stripe (preserva storico transazioni)
```

### Sync Manuale (Opzionale)

Usa il comando Artisan quando:
- Setup iniziale (sync piani esistenti)
- Recovery da errori
- Testing

#### Sync Tutti i Piani

```bash
php artisan stripe:sync-plans
```

Output:
```
🚀 Starting Stripe synchronization...

Found 3 subscription plan(s)

Do you want to sync all plans to Stripe? (yes/no) [yes]:
> yes

 3/3 [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%

📊 Sync Results:
✅ Successfully synced: 3

Successfully synced plans:
+----+----------------+----------------------+----------------------+--------+
| ID | Name           | Stripe Product       | Stripe Price         | Active |
+----+----------------+----------------------+----------------------+--------+
| 1  | Demo Plan      | prod_xxxxxxxxxxxxx...| price_xxxxxxxxxxxx...| ✓      |
| 2  | Gold Plan      | prod_xxxxxxxxxxxxx...| price_xxxxxxxxxxxx...| ✓      |
| 3  | Platinum Plan  | prod_xxxxxxxxxxxxx...| price_xxxxxxxxxxxx...| ✓      |
+----+----------------+----------------------+----------------------+--------+
```

#### Sync Piano Specifico

```bash
php artisan stripe:sync-plans --plan=1
```

#### Sync Senza Conferma (CI/CD)

```bash
php artisan stripe:sync-plans --force
```

---

## 🔍 Comportamenti Importanti

### Prices sono Immutabili

**Problema**: In Stripe, i Prices non possono essere modificati una volta creati.

**Soluzione**: Quando cambi il prezzo:
1. La vecchia Price viene archiviata (`active: false`)
2. Una nuova Price viene creata con il nuovo importo
3. Il nuovo `price_id` viene salvato nel DB

**Esempio**:
```php
$plan = SubscriptionPlan::find(1);

// Prima del cambio
echo $plan->stripe_price_id; // price_abc123

// Cambio prezzo
$plan->update(['price' => 99.00]);

// Dopo il cambio
echo $plan->stripe_price_id; // price_def456 (nuovo!)
```

### Archiving vs Deletion

**Non eliminiamo mai** Products o Prices da Stripe. Li archiviamo.

**Perché?**
- Preservare storico transazioni
- Subscriptions attive potrebbero usarli
- Compliance e reporting

**Come?**
```php
// Quando elimini un piano
$plan->delete();

// In Stripe:
// Product: active = false
// Price: active = false
// Ma esistono ancora!
```

### Metadata Personalizzati

Il sistema salva metadata custom in Stripe:

**Product Metadata**:
```json
{
  "plan_id": "1",
  "slug": "gold-plan",
  "tier": "gold",
  "trial_days": "14",
  "sort_order": "2",
  "features_count": "5"
}
```

**Price Metadata**:
```json
{
  "plan_id": "1",
  "tier": "gold",
  "trial_days": "14"
}
```

Puoi recuperarli in Stripe Dashboard o via API.

---

## ⚠️ Gestione Errori

### Errori Non Bloccanti

Il sistema è progettato per **non bloccare** operazioni CRUD se Stripe fallisce:

```php
// Crei un piano
$plan = SubscriptionPlan::create([...]);
// ✅ Piano salvato nel DB
// ❌ Stripe sync fallito
// ℹ️  Errore loggato, ma operazione completata
```

**Perché?**
- Stripe potrebbe essere temporaneamente offline
- Puoi sincronizzare manualmente dopo
- Non blocchi l'admin

### Log degli Errori

Tutti gli errori vengono loggati in `storage/logs/laravel.log`:

```php
[2025-12-07 15:30:45] local.ERROR: Stripe sync failed on plan creation
{
  "plan_id": 1,
  "error": "Invalid API Key provided"
}
```

### Recovery da Errori

Se un sync fallisce:

1. **Controlla i log**:
```bash
tail -f storage/logs/laravel.log | grep Stripe
```

2. **Verifica configurazione Stripe**:
```bash
php artisan tinker
>>> \Laravel\Cashier\Cashier::stripe()->products->all(['limit' => 1])
```

3. **Re-sync manualmente**:
```bash
php artisan stripe:sync-plans --plan=1
```

---

## ✅ Best Practices

### 1. Testing in Modalità Test

Usa sempre le **test keys** di Stripe per development:

```env
# .env.local / .env.testing
STRIPE_KEY=pk_test_xxxxx  # NON pk_live_xxxxx
STRIPE_SECRET=sk_test_xxxxx  # NON sk_live_xxxxx
```

### 2. Sync Iniziale

Quando deploi in produzione per la prima volta:

```bash
# 1. Verifica configurazione
php artisan tinker
>>> config('cashier.secret')

# 2. Sync tutti i piani
php artisan stripe:sync-plans --force

# 3. Verifica su Stripe Dashboard
# https://dashboard.stripe.com/test/products
```

### 3. Cambio Prezzo su Piani Attivi

**Attenzione**: Cambiare il prezzo di un piano con subscriptions attive:
- ❌ Non aggiorna automaticamente le subscriptions esistenti
- ✅ Le nuove subscriptions useranno il nuovo prezzo

**Per aggiornare subscriptions esistenti** usa:
```php
// Manualmente per ogni subscription
$subscription->swap($newPriceId);
```

### 4. Monitoring

Monitora i sync in produzione:

```bash
# Cron job giornaliero per verificare consistenza
0 2 * * * cd /path/to/app && php artisan stripe:sync-plans --force >> /var/log/stripe-sync.log 2>&1
```

### 5. Backup Before Bulk Operations

Prima di sync bulk in produzione:

```bash
# Backup database
php artisan db:backup

# Sync
php artisan stripe:sync-plans
```

---

## 🐛 Troubleshooting

### Errore: "Invalid API Key"

**Causa**: Chiavi Stripe non configurate o errate

**Soluzione**:
```bash
# Verifica .env
grep STRIPE .env

# Test connessione
php artisan tinker
>>> \Laravel\Cashier\Cashier::stripe()->products->all(['limit' => 1])
```

### Errore: "Product not found"

**Causa**: `stripe_product_id` nel DB punta a un Product eliminato in Stripe

**Soluzione**:
```php
$plan = SubscriptionPlan::find(1);
$plan->update([
    'stripe_product_id' => null,
    'stripe_price_id' => null,
]);
php artisan stripe:sync-plans --plan=1
```

### Nessun Sync Automatico

**Causa**: Observer non registrato

**Soluzione**:
```php
// Verifica AppServiceProvider.php
\App\Models\SubscriptionPlan::observe(\App\Observers\SubscriptionPlanObserver::class);

// Clear cache
php artisan config:clear
php artisan cache:clear
```

---

## 📖 Riferimenti

**Stripe Documentation**:
- [Products API](https://docs.stripe.com/api/products)
- [Prices API](https://docs.stripe.com/api/prices)
- [Manage Products and Prices](https://docs.stripe.com/products-prices/manage-prices)

**Laravel Cashier Documentation**:
- [Laravel Cashier (Stripe) - Laravel 12.x](https://laravel.com/docs/12.x/billing)
- [GitHub - laravel/cashier-stripe](https://github.com/laravel/cashier-stripe)

**File di Riferimento**:
- `app/Services/StripeProductService.php` - Logica sync
- `app/Observers/SubscriptionPlanObserver.php` - Auto-sync
- `app/Console/Commands/SyncSubscriptionPlansToStripe.php` - Comando manuale
