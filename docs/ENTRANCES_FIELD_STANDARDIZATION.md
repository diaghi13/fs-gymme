# 🎯 Standardizzazione Campo Ingressi: `entrances`

## 📊 Problema

Prima dell'uniformazione, il sistema usava **3 nomi diversi** per lo stesso concetto:
- `entrances` in `subscription_contents` table
- `max_uses` in `price_lists` table (Token)
- `token_quantity` nel codice frontend

Questo creava confusione e rendeva difficile il controllo accessi.

## ✅ Soluzione: Campo Standard `entrances`

### Campo Unico per Tutto il Sistema

**`entrances`** (plurale) = Numero totale di ingressi/utilizzi consentiti

Usato per:
- ✅ Limitare accessi a strutture/servizi
- ✅ Controllo accessi a scalare
- ✅ Monitoraggio utilizzo abbonamenti
- ✅ Token/carnet prepagati

## 🗂️ Struttura Database

### `subscription_contents` (Standard)
```sql
subscription_contents:
  id: 1
  subscription_id: 1
  price_listable_type: 'App\Models\Product\BaseProduct'
  price_listable_id: 1
  entrances: 10              ← Campo standard
  days_duration: 30
  months_duration: null
```

### `price_lists` (Token con Accessor)
```sql
price_lists:
  id: 1
  type: 'token'
  name: 'Carnet 20 Ingressi'
  max_uses: 20               ← DB column (legacy)
```

**Backend Model aggiunge accessor:**
```php
// Token::class
public function getEntrancesAttribute(): ?int
{
    return $this->attributes['max_uses'] ?? null;
}

// Ora $token->entrances ritorna 20 ✅
```

## 📝 Naming Convention

### ✅ CORRETTO (Standard)
```php
// Backend
$content->entrances = 10;
$token->entrances = 20;

// Frontend
content.entrances = 10;
entity.entrances = 20;
```

### ❌ DEPRECATO (Legacy, ma supportato)
```php
// Backend - ancora funziona per retrocompatibilità
$token->max_uses = 20;
$token->token_quantity = 20;  // alias

// Frontend - fallback
entity.token_quantity  // ritorna entrances
entity.max_uses       // DB value
```

## 🔄 Mapping Automatico

### Token Model (PriceList)

```php
class Token extends PriceList
{
    protected $appends = ['entrances', 'token_quantity'];

    // PRIMARY: Standard field name
    public function getEntrancesAttribute(): ?int
    {
        return $this->attributes['max_uses'] ?? null;
    }

    public function setEntrancesAttribute(?int $value): void
    {
        $this->attributes['max_uses'] = $value;
    }

    // LEGACY: Backward compatibility
    public function getTokenQuantityAttribute(): ?int
    {
        return $this->attributes['max_uses'] ?? null;
    }
}
```

**Risultato JSON:**
```json
{
  "id": 1,
  "name": "Carnet 20",
  "type": "token",
  "max_uses": 20,
  "entrances": 20,        ← Aggiunto da accessor
  "token_quantity": 20    ← Legacy alias
}
```

### Frontend Mapping

```typescript
// createRow() in SubscriptionTable.tsx
if (entity.type === TOKEN) {
  // Use entrances (standard) with fallback to legacy names
  entrances = entity.entrances 
           ?? entity.token_quantity 
           ?? entity.max_uses 
           ?? null;
}
```

## 🎯 Utilizzo per Controllo Accessi

### Scenario 1: Abbonamento con Ingressi Limitati

**Subscription Content:**
```php
SubscriptionContent {
  price_listable_type: 'App\Models\Product\BaseProduct',
  price_listable_id: 1,  // Sala Pesi
  entrances: 10,         // 10 ingressi totali
  months_duration: 1,    // Valido 1 mese
}
```

**Customer Subscription (runtime):**
```php
CustomerSubscription {
  entrances_total: 10,      // Assegnati
  entrances_used: 3,        // Già usati
  entrances_remaining: 7,   // Disponibili
}
```

### Scenario 2: Token Prepagato

**Token (PriceList):**
```php
Token {
  name: 'Carnet 20 Ingressi',
  max_uses: 20,        // DB
  entrances: 20,       // Accessor (standard)
  validity_months: 6,
}
```

**Customer Token (runtime):**
```php
CustomerToken {
  entrances_total: 20,
  entrances_used: 8,
  entrances_remaining: 12,
  expires_at: '2025-05-19',
}
```

### Scenario 3: Accesso Illimitato

```php
SubscriptionContent {
  entrances: null,           // null = illimitato
  unlimited_entries: true,
}
```

## 📊 Compatibilità

### Retrocompatibilità Garantita

**Codice Legacy funziona ancora:**
```php
// Vecchio codice
$token->max_uses;           // 20 ✅
$token->token_quantity;     // 20 ✅

// Nuovo codice (preferito)
$token->entrances;          // 20 ✅
```

**Frontend con fallback:**
```typescript
// Prova entrances prima, poi fallback
const entrances = entity.entrances 
               ?? entity.token_quantity 
               ?? entity.max_uses;
```

## 🚀 Vantaggi

### 1. Naming Consistency
- ✅ Un solo nome in tutto il sistema
- ✅ Facile da ricordare
- ✅ Semanticamente corretto (plurale = quantità)

### 2. Controllo Accessi Semplificato
```php
// Verifica ingressi rimasti
if ($customer->subscription->entrances_remaining > 0) {
    $customer->checkIn();
    $customer->subscription->decrement('entrances_remaining');
}
```

### 3. Codice Pulito
```typescript
// Frontend consistente
<TableCell>{content.entrances || 'Illimitati'}</TableCell>
```

### 4. Database Migration Free
- ✅ Nessuna migration necessaria
- ✅ Accessor fa il mapping automatico
- ✅ Dati esistenti compatibili

## 📝 Guidelines per Sviluppatori

### ✅ DO: Usa sempre `entrances`

```php
// Backend
$content->entrances = 10;
$token->entrances = 20;

// Frontend
content.entrances
entity.entrances
```

### ❌ DON'T: Non usare nomi legacy in nuovo codice

```php
// ❌ Non fare questo in nuovo codice
$token->max_uses = 20;
$token->token_quantity = 20;

// ✅ Usa sempre entrances
$token->entrances = 20;
```

### 🔄 Migration Path

Se devi aggiornare codice legacy:

**Prima:**
```php
$token->max_uses
$subscription->token_quantity
```

**Dopo:**
```php
$token->entrances
$subscription->entrances
```

## 🎉 Risultato Finale

**Campo Standard Unificato:**
- ✅ `entrances` ovunque nel codice
- ✅ Backend accessor per retrocompatibilità
- ✅ Frontend fallback automatico
- ✅ Nessuna breaking change
- ✅ Pronto per controllo accessi a scalare

**Tutti i sistemi usano `entrances` come campo principale!** 🚀

