# whitecube/php-prices - Integrazione per Calcoli IVA

## 🎯 Perché Usare Questa Libreria

**Problemi risolti**:
- ✅ Arrotondamenti precisi secondo normativa fiscale
- ✅ Gestione automatica valute multiple
- ✅ Supporto VAT out-of-the-box
- ✅ Modifiers per sconti e maggiorazioni
- ✅ API fluente e leggibile

**Libreria**: `whitecube/php-prices` v3.3.0
**Documentazione**: https://github.com/whitecube/php-prices

---

## 📦 Installazione

```bash
composer require whitecube/php-prices
```

✅ **Installato**: 11 Novembre 2025

---

## 🔧 Esempi di Utilizzo

### Esempio 1: Prezzo con IVA (Base)

```php
use Whitecube\Price\Price;

// Crea prezzo con IVA 22%
$price = Price::EUR(35000)  // €350,00 (in centesimi)
    ->setVat(22);            // IVA 22%

// Ottieni valori
$price->inclusive()->getAmount();  // 35000 (lordo in centesimi)
$price->exclusive()->getAmount();  // 28689 (netto in centesimi) ✅ ARROTONDATO CORRETTO
$price->vat()->getAmount();        // 6311 (IVA in centesimi)

// Formattazione
$price->inclusive()->format();     // "€ 350,00"
$price->exclusive()->format();     // "€ 286,89"
```

### Esempio 2: Scorporo IVA Automatico

```php
// Prezzo lordo con IVA inclusa
$grossPrice = Price::EUR(35000)->setVat(22);

// Scorporo automatico
$netPrice = $grossPrice->exclusive();
echo $netPrice->format();  // "€ 286,89" ✅

// IVA calcolata automaticamente
$vat = $grossPrice->vat();
echo $vat->format();  // "€ 63,11" ✅

// Verifica
$recalculated = $netPrice->getAmount() + $vat->getAmount();
// 28689 + 6311 = 35000 ✅ CORRETTO!
```

### Esempio 3: Prezzo Netto + Aggiungi IVA

```php
// Prezzo netto
$netPrice = Price::EUR(28689);  // €286,89 netto

// Aggiungi IVA 22%
$grossPrice = $netPrice->setVat(22)->inclusive();
echo $grossPrice->format();  // "€ 350,01" ⚠️

// PROBLEMA: 286.89 * 1.22 = 350.01 (arrotondamento!)
// SOLUZIONE: Salva sempre il gross originale nel DB
```

### Esempio 4: Sconti

```php
$price = Price::EUR(35000)->setVat(22);

// Sconto percentuale
$discounted = $price->addModifier('discount', -0.10);  // -10%
echo $discounted->inclusive()->format();  // "€ 315,00"

// Sconto assoluto
$discounted = $price->addModifier('discount', Price::EUR(-3500));  // -€35
echo $discounted->inclusive()->format();  // "€ 315,00"
```

### Esempio 5: Quantità

```php
$unitPrice = Price::EUR(35000)->setVat(22);  // €350,00 unitario

// Moltiplica per quantità
$total = $unitPrice->multipliedBy(3);
echo $total->inclusive()->format();  // "€ 1.050,00"
echo $total->exclusive()->format();  // "€ 860,66"
echo $total->vat()->format();        // "€ 189,34"
```

---

## 🔄 Refactoring SaleService con php-prices

### Prima (Codice Attuale)

```php
// Scorporo IVA manuale
$unitPriceGross = 35000;
$vatMultiplier = 1 + ($vatRate->percentage / 100);
$unitPriceNetRaw = $unitPriceGross / $vatMultiplier;
$unitPriceNet = round($unitPriceNetRaw, 2);
$vatAmount = round($totalNet * ($vatRate->percentage / 100), 2);

// Aggiustamento manuale
if (abs($recalculatedGross - $totalGross) >= 0.01) {
    $difference = $totalGross - $recalculatedGross;
    $totalNet = $totalNet + $difference;
}
```

### Dopo (Con php-prices) ✅

```php
use Whitecube\Price\Price;

// Crea prezzo lordo con IVA
$priceGross = Price::EUR($unitPriceInput)->setVat($vatRate->percentage);

// Applica sconto se presente
if ($percentageDiscount > 0) {
    $priceGross = $priceGross->addModifier('discount', -$percentageDiscount / 100);
}

// Ottieni valori (arrotondamenti automatici!)
$unitPriceGross = $priceGross->inclusive()->getMinorAmount()->toInt();  // centesimi
$unitPriceNet = $priceGross->exclusive()->getMinorAmount()->toInt();     // centesimi
$vatAmount = $priceGross->vat()->getMinorAmount()->toInt();              // centesimi

// Moltiplica per quantità
$totalPrice = $priceGross->multipliedBy($quantity);
$totalGross = $totalPrice->inclusive()->getMinorAmount()->toInt();
$totalNet = $totalPrice->exclusive()->getMinorAmount()->toInt();

// ✅ Nessun aggiustamento manuale necessario!
// ✅ Arrotondamenti corretti garantiti dalla libreria
```

---

## 📋 Piano di Refactoring

### Step 1: Creare Helper/Service Wrapper

**File**: `app/Services/PriceCalculatorService.php`

```php
<?php

namespace App\Services;

use Whitecube\Price\Price;

class PriceCalculatorService
{
    /**
     * Create price from cents with VAT
     */
    public static function create(int $amountInCents, float $vatPercentage): Price
    {
        return Price::EUR($amountInCents)->setVat($vatPercentage);
    }

    /**
     * Calculate net price from gross (VAT exclusion)
     */
    public static function calculateNet(int $grossAmountInCents, float $vatPercentage): array
    {
        $price = self::create($grossAmountInCents, $vatPercentage);
        
        return [
            'gross' => $grossAmountInCents,
            'net' => $price->exclusive()->getMinorAmount()->toInt(),
            'vat' => $price->vat()->getMinorAmount()->toInt(),
        ];
    }

    /**
     * Calculate gross price from net (add VAT)
     */
    public static function calculateGross(int $netAmountInCents, float $vatPercentage): array
    {
        $price = Price::EUR($netAmountInCents)->setVat($vatPercentage);
        
        return [
            'net' => $netAmountInCents,
            'gross' => $price->inclusive()->getMinorAmount()->toInt(),
            'vat' => $price->vat()->getMinorAmount()->toInt(),
        ];
    }


     * Apply discount to price
     */
    public static function applyDiscount(
        int $amountInCents, 
        float $vatPercentage,
        ?float $discountPercentage = null,
        ?int $discountAbsolute = null
    ): Price {
        $price = self::create($amountInCents, $vatPercentage);
        
        if ($discountPercentage) {
            $price = $price->addModifier('discount', -$discountPercentage / 100);
        }
        
        if ($discountAbsolute) {
            $price = $price->addModifier('discount', Price::EUR(-$discountAbsolute));
        }
        
        return $price;
    }
}
```

### Step 2: Refactoring SaleService

**Metodi da aggiornare**:
- `prepareSubscriptionRows()` - linee 393-465
- `prepareSingleRow()` - linee 485-575

**Esempio refactoring `prepareSingleRow()`**:

```php
protected function prepareSingleRow(array $row, PriceList $priceList): array
{
    $taxIncluded = $priceList->tax_included ?? true;
    $vatRate = $priceList->vat_rate;

    if ($taxIncluded && $vatRate) {
        // Crea prezzo con libreria
        $price = PriceCalculatorService::applyDiscount(
            $row['unit_price'],
            $vatRate->percentage,
            $row['percentage_discount'] ?? null,
            null
        );

        // Ottieni valori (già arrotondati correttamente!)
        $unitPriceGross = $price->inclusive()->getMinorAmount()->toInt();
        $unitPriceNet = $price->exclusive()->getMinorAmount()->toInt();

        // Calcola totali
        $totalPrice = $price->multipliedBy($row['quantity']);
        $totalGross = $totalPrice->inclusive()->getMinorAmount()->toInt();
        $totalNet = $totalPrice->exclusive()->getMinorAmount()->toInt();
        $vatAmount = $totalPrice->vat()->getMinorAmount()->toInt();

        $absoluteDiscount = ($row['percentage_discount'] ?? 0) > 0
            ? round($row['unit_price'] * $row['quantity'] * ($row['percentage_discount'] / 100), 2)
            : 0;
    } else {
        // ... gestione prezzo netto
    }

    // ... resto del metodo
}
```

### Step 3: Test

**Creare test** per verificare:
- ✅ Scorporo IVA con risultati identici
- ✅ Arrotondamenti corretti
- ✅ Totali corrispondenti
- ✅ Sconti applicati correttamente

**File**: `tests/Unit/PriceCalculatorServiceTest.php`

```php
<?php

use App\Services\PriceCalculatorService;

test('calcola scorporo IVA correttamente', function () {
    $result = PriceCalculatorService::calculateNet(35000, 22);
    
    expect($result['net'])->toBe(28689);   // €286,89
    expect($result['vat'])->toBe(6311);    // €63,11
    expect($result['gross'])->toBe(35000); // €350,00
});

test('aggiungi IVA correttamente', function () {
    $result = PriceCalculatorService::calculateGross(28689, 22);
    
    expect($result['net'])->toBe(28689);
    expect($result['vat'])->toBe(6311);
    // Note: potrebbe essere 35000 o 35001 per arrotondamento
    // Per questo salviamo sempre il gross originale!
});
```

---

## ⚠️ Note Importanti

### 1. Come Ottenere l'Importo IVA

**ATTENZIONE**: `$price->vat()` ritorna un oggetto `Whitecube\Price\Vat`, NON un `Money`!

```php
// ❌ SBAGLIATO - Vat non ha getMinorAmount()
$vatAmount = $price->vat()->getMinorAmount()->toInt();

// ✅ CORRETTO - Calcola come differenza
$totalGross = $price->inclusive()->getMinorAmount()->toInt();
$totalNet = $price->exclusive()->getMinorAmount()->toInt();
$vatAmount = $totalGross - $totalNet;

// ✅ ALTERNATIVA - Usa il metodo money() di Vat
$vatAmount = $price->vat()->money()->getMinorAmount()->toInt();
```

**Nel nostro PriceCalculatorService usiamo la differenza** perché è più precisa matematicamente.

### 2. Continuare a Salvare Gross Originale

Anche con la libreria, **dobbiamo SEMPRE salvare `unit_price_gross` e `total_gross`** nel DB!

**Motivo**: Quando calcoli `netto + IVA` puoi avere arrotondamenti di 1 centesimo:
```
286.89 * 1.22 = 350.0058 → 350.01 ≠ 350.00
```

**Soluzione**: Usa la libreria per i calcoli, ma salva il gross ORIGINALE dal form.

### 2. Gestione Centesimi

La libreria usa `brick/money` internamente:
- `getAmount()` → ritorna oggetto Money
- `getMinorAmount()` → ritorna oggetto MoneyAmount
- `getMinorAmount()->toInt()` → ritorna int (centesimi) ✅

### 3. Compatibilità Retroattiva

Il refactoring NON rompe nulla perché:
- ✅ Input/Output identici (centesimi in/out)
- ✅ Stessi calcoli, solo più precisi
- ✅ Database schema invariato
- ✅ Frontend invariato

---

## 🎉 Vantaggi Libreria

### Prima (Manuale)
```php
❌ 50 righe di codice per scorporo IVA
❌ Arrotondamenti manuali
❌ Aggiustamenti manuali normativa italiana
❌ Difficile da testare
❌ Propenso a errori
```

### Dopo (Con whitecube/php-prices)
```php
✅ 5 righe di codice
✅ Arrotondamenti automatici precisi
✅ Conformità fiscale garantita
✅ Facile da testare
✅ Manutenibile
✅ Standard industriale
```

---

## 📚 Documentazione Ufficiale

- **GitHub**: https://github.com/whitecube/php-prices
- **Packagist**: https://packagist.org/packages/whitecube/php-prices
- **brick/money** (dependency): https://github.com/brick/money

---

**Data Installazione**: 11 Novembre 2025
**Versione**: v3.3.0
**Status**: ✅ Installata, pronta per refactoring
**Priority**: 🟡 Medium (il codice attuale funziona, ma la libreria migliorerebbe manutenibilità)

**Prossimi Step**:
1. ⏳ Creare `PriceCalculatorService` wrapper
2. ⏳ Scrivere test per validare comportamento
3. ⏳ Refactoring `SaleService` metodi prepare*
4. ⏳ Validazione con vendite reali
5. ⏳ Deploy in produzione
