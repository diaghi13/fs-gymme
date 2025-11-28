# 📊 Analisi Completa Tipi Prodotto/PriceList

## 🔍 Situazione Attuale

### **Product** (Catalog - Cosa offriamo fisicamente)
Tipi definiti in `ProductType` enum (STI su `products` table):

1. ✅ **BASE_PRODUCT** (`base_product`) - Prodotti base (sala pesi, piscina, sauna)
2. ✅ **COURSE** (`course`) - Corsi di gruppo (yoga, pilates, spinning)
3. ✅ **BOOKABLE_SERVICE** (`bookable_service`) - Servizi prenotabili (PT, massaggio, consulenza)

**Models esistenti in `app/Models/Product/`:**
- `BaseProduct` ✅ (nel enum)
- `CourseProduct` ✅ (nel enum come COURSE)
- `BookableService` ✅ (nel enum)
- `Token` ❌ (NON nel enum, ma esiste il model)
- `DayPass` ❌ (NON nel enum, ma esiste il model)
- `MembershipFee` ❌ (NON nel enum, ma esiste il model)
- `GiftCard` ❌ (NON nel enum, ma esiste il model)
- `Rental` ❌ (NON nel enum, ma esiste il model)
- `Service` ❌ (NON nel enum, ma esiste il model)
- `PersonalTraining` ❌ (NON nel enum, ma esiste il model)
- `Other` ❌ (NON nel enum, ma esiste il model)

### **PriceList** (Commercial Offerings - Come vendiamo)
Tipi definiti in `PriceListType` enum (STI su `price_lists` table):

1. ✅ **FOLDER** (`folder`) - Cartella organizzativa
2. ✅ **ARTICLE** (`article`) - Articolo vendibile (retail)
3. ✅ **MEMBERSHIP** (`membership`) - Quota associativa
4. ✅ **SUBSCRIPTION** (`subscription`) - Abbonamento (bundle di prodotti)
5. ✅ **DAY_PASS** (`day_pass`) - Ingresso giornaliero
6. ✅ **TOKEN** (`token`) - Token/Carnet (crediti prepagati)
7. ✅ **GIFT_CARD** (`gift_card`) - Carta regalo

**Models esistenti in `app/Models/PriceList/`:**
- `Folder` ✅
- `Article` ✅
- `Membership` ✅
- `Subscription` ✅
- `DayPass` ✅
- `Token` ✅
- `GiftCard` ✅

## 🎯 Tipi Validi per SubscriptionContent

### Cosa può essere incluso in un abbonamento?

**PRODUCT (Catalog):**
1. ✅ `App\Models\Product\BaseProduct` - Prodotti base
2. ✅ `App\Models\Product\CourseProduct` - Corsi
3. ✅ `App\Models\Product\BookableService` - Servizi prenotabili

**PRICELIST (Commercial):**
1. ✅ `App\Models\PriceList\Article` - Articoli vendibili
2. ✅ `App\Models\PriceList\Membership` - Quote associative
3. ✅ `App\Models\PriceList\Token` - Pacchetti token
4. ✅ `App\Models\PriceList\DayPass` - Ingressi giornalieri
5. ✅ `App\Models\PriceList\GiftCard` - Carte regalo

## ❌ ERRORI TROVATI

### 1. **Enum SubscriptionContentType Incompleto**
Attualmente include:
```php
case BaseProduct = 'App\\Models\\Product\\BaseProduct';
case CourseProduct = 'App\\Models\\Product\\CourseProduct';
case MembershipFee = 'App\\Models\\Product\\MembershipFee';  // ❌ SBAGLIATO!
case Token = 'App\\Models\\Product\\Token';                   // ❌ SBAGLIATO!
case DayPass = 'App\\Models\\Product\\DayPass';              // ❌ SBAGLIATO!
case Article = 'App\\Models\\PriceList\\Article';            // ✅ CORRETTO
```

**Problemi:**
- `MembershipFee` dovrebbe essere `App\Models\PriceList\Membership`
- `Token` dovrebbe essere `App\Models\PriceList\Token`
- `DayPass` dovrebbe essere `App\Models\PriceList\DayPass`
- Manca `BookableService`
- Manca `GiftCard`

### 2. **Frontend Types Sbagliati**
In `subscriptionContentTypes.ts`:
```typescript
MEMBERSHIP_FEE: 'App\\Models\\Product\\MembershipFee',  // ❌ SBAGLIATO!
TOKEN: 'App\\Models\\Product\\Token',                    // ❌ SBAGLIATO!
DAY_PASS: 'App\\Models\\Product\\DayPass',              // ❌ SBAGLIATO!
```

### 3. **Form Row usa tipo generico**
In `SubscriptionTableFormRow.tsx`:
```typescript
const isProduct = content.price_listable_type === 'App\\Models\\Product\\Product'; // ❌ GENERICO!
const isMembership = content.price_listable.type === MEMBERSHIP; // ❌ LEGACY!
```

## ✅ SOLUZIONE CORRETTA

### Tipi Validi per SubscriptionContent:

**PRODUCTS (3):**
1. `App\Models\Product\BaseProduct`
2. `App\Models\Product\CourseProduct`
3. `App\Models\Product\BookableService`

**PRICELISTS (5):**
1. `App\Models\PriceList\Article`
2. `App\Models\PriceList\Membership`
3. `App\Models\PriceList\Token`
4. `App\Models\PriceList\DayPass`
5. `App\Models\PriceList\GiftCard`

**TOTALE: 8 tipi validi**

## 📝 Azioni Necessarie

1. ✅ Aggiornare `SubscriptionContentType` enum
2. ✅ Aggiornare `subscriptionContentTypes.ts` costanti
3. ✅ Aggiornare `SubscriptionTableFormRow.tsx` logica
4. ✅ Aggiornare `StoreSubscriptionRequest` validazione
5. ✅ Aggiornare tipi TypeScript
6. ✅ Aggiornare mapping in `SubscriptionTable.tsx`

## 🚫 Dated Products

**NON ESISTONO** "dated products" nel progetto. Non c'è traccia di questa tipologia né negli enum né nei models.

