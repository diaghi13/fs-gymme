# 🔧 FIX CRITICO: Calcolo IVA Scorporo - 11 Novembre 2025

## ❌ Problema Identificato

Durante la creazione vendite, i prezzi **netti** (senza IVA) venivano salvati con il valore **lordo**, causando doppiotassazione.

### Esempio Errore

```
Input frontend: €350,00 (lordo IVA 22%)
Salvato DB:     unit_price_net = 35000 (€350) ❌ SBAGLIATO!
IVA calcolata:  7700 (€77) = 35000 * 0.22
Totale:         42700 (€427) ❌ SBAGLIATO!

ATTESO:
unit_price_net = 28689 (€286,89) ✅
IVA calcolata:  6311 (€63,11)
Totale:         35000 (€350,00) ✅
```

### Dati Errati nel Database

```sql
-- Vendita recente PRIMA del fix:
unit_price_net:   35000  -- ❌ questo è il LORDO!
unit_price_gross: 35000  -- ok
vat_amount:       7700   -- ❌ calcolata su prezzo lordo invece di netto
total_gross:      42700  -- ❌ €427 invece di €350!
```

## 🔍 Causa Root

Il problema era nel `PriceCalculatorService::excludeVat()`.

### Codice Problematico

```php
// ❌ ERRATO - La libreria interpreta il prezzo come NETTO!
$price = Price::EUR($grossAmountInCents)->setVat($vatPercentage);

// Risultato:
// exclusive() = 35000 (pensa sia il netto che abbiamo passato)
// inclusive() = 42700 (aggiunge IVA: 35000 * 1.22)
```

**La libreria `whitecube/php-prices` interpreta SEMPRE il prezzo iniziale come NETTO**, non lordo!

Quindi quando passavamo €350 (lordo), la libreria pensava fosse il netto e aggiungeva l'IVA sopra: 350 * 1.22 = €427.

## ✅ Soluzione Implementata

### 1. Fix PriceCalculatorService

**File**: `app/Services/PriceCalculatorService.php`

```php
public static function excludeVat(
    int $grossAmountInCents,
    float $vatPercentage,
    int $quantity = 1,
    ?float $discountPercentage = null
): array {
    // Step 1: Scorporo IVA MANUALE (la libreria non ha metodo diretto)
    // Formula standard: Netto = Lordo / (1 + VAT%)
    $vatMultiplier = 1 + ($vatPercentage / 100);
    $unitPriceNetRaw = $grossAmountInCents / $vatMultiplier;
    $unitPriceNet = (int) round($unitPriceNetRaw);

    // Step 2: Usa libreria partendo dal NETTO per gestire sconti/quantità
    $price = Price::EUR($unitPriceNet)->setVat($vatPercentage);

    if ($discountPercentage && $discountPercentage > 0) {
        $price = $price->addModifier('discount', -$discountPercentage / 100);
    }

    if ($quantity > 1) {
        $price = $price->setUnits($quantity);
    }

    // Step 3: Ottieni valori
    $totalNet = $price->exclusive()->getMinorAmount()->toInt();
    $totalGross = $price->inclusive()->getMinorAmount()->toInt();
    $vatAmount = $totalGross - $totalNet;

    // Step 4: IMPORTANTE - Preserva prezzo lordo originale
    // Evita arrotondamenti quando non ci sono sconti/quantità multiple
    if ($quantity == 1 && (!$discountPercentage || $discountPercentage == 0)) {
        $totalGross = $grossAmountInCents;  // ✅ Usa originale
        $vatAmount = $totalGross - $totalNet;
    }

    return [
        'unit_price_gross' => $grossAmountInCents,  // Originale
        'unit_price_net' => $unitPriceNet,          // Scorporato
        'total_gross' => $totalGross,               // Con eventuale sconto/qta
        'total_net' => $totalNet,                   // Con eventuale sconto/qta
        'vat_amount' => $vatAmount,                 // IVA corretta
    ];
}
```

### 2. Punti Chiave

1. **Scorporo manuale**: Calcoliamo il netto con formula standard `Netto = Lordo / (1 + VAT%)`
2. **Libreria per sconti**: Usiamo `whitecube/php-prices` PARTENDO dal netto per gestire sconti e quantità
3. **Preserva originale**: Il `total_gross` finale usa il prezzo originale per evitare arrotondamenti

## 🧪 Test di Verifica

### Test Automatici

```php
// Test 1: €350,00 IVA 22%
$result = PriceCalculatorService::excludeVat(35000, 22, 1);
// ✅ unit_price_net:   28689 (€286,89)
// ✅ unit_price_gross: 35000 (€350,00)
// ✅ vat_amount:       6311  (€63,11)
// ✅ total_gross:      35000 (€350,00)

// Test 2: €35,00 IVA 0%
$result = PriceCalculatorService::excludeVat(3500, 0, 1);
// ✅ unit_price_net:   3500 (€35,00)
// ✅ vat_amount:       0    (€0,00)

// Test 3: €15,00 IVA 22%
$result = PriceCalculatorService::excludeVat(1500, 22, 1);
// ✅ unit_price_net:   1230 (€12,30)
// ✅ vat_amount:       270  (€2,70)

// Test 4: €55,00 IVA 22%
$result = PriceCalculatorService::excludeVat(5500, 22, 1);
// ✅ unit_price_net:   4508 (€45,08)
// ✅ vat_amount:       992  (€9,92)
```

**TUTTI I TEST PASSANO ✅**

### Test Manuale

1. **Crea nuova vendita** con prodotti esistenti
2. **Verifica che i prezzi netti siano corretti** nel database
3. **Controlla i totali** nella vista vendita

## 📊 Risultati Attesi

### Prima del Fix ❌

```
Descrizione                              Qta  Prezzo Lordo  Totale Netto  Totale Lordo
Test - Palestra open (2025)              1    €350,00       €350,00 ❌    €427,00 ❌
Quota associativa 2025                   1    €35,00        €35,00 ✅     €35,00 ✅
Asciugamano                              1    €15,00        €12,00 ❌     €15,00 ❌
Borsone                                  1    €55,00        €45,00 ❌     €55,00 ❌
```

### Dopo il Fix ✅

```
Descrizione                              Qta  Prezzo Lordo  Totale Netto  Totale Lordo
Test - Palestra open (2025)              1    €350,00       €286,89 ✅    €350,00 ✅
Quota associativa 2025                   1    €35,00        €35,00 ✅     €35,00 ✅
Asciugamano                              1    €15,00        €12,30 ✅     €15,00 ✅
Borsone                                  1    €55,00        €45,08 ✅     €55,00 ✅
```

## 📝 File Modificati

1. **app/Services/PriceCalculatorService.php** ✅
   - Fix metodo `excludeVat()`
   - Aggiunto scorporo IVA manuale
   - Preserva prezzo lordo originale

## ⚠️ Vendite Esistenti

Le vendite create **PRIMA** del fix hanno dati errati nel database.

### Opzioni

1. **Ignora** - Le vendite vecchie rimangono così (non bloccante)
2. **Correggi manualmente** - Ricalcola i valori corretti per vendite importanti
3. **Script di migrazione** - Crea script per correggere tutte le vendite

**Raccomandazione**: Ignora per ora, le vendite future saranno corrette.

## 🎯 Prossimi Passi

1. ✅ **Fix implementato e testato**
2. ⏳ **Test vendita reale** - Crea vendita e verifica calcoli
3. ⏳ **Monitor produzione** - Osserva vendite successive per conferma

## 📅 Timeline

- **Data problema**: 11 Novembre 2025 - ore 16:00
- **Diagnosi**: 11 Novembre 2025 - ore 16:30
- **Fix implementato**: 11 Novembre 2025 - ore 17:00
- **Test completati**: 11 Novembre 2025 - ore 17:10
- **Status**: ✅ **RISOLTO E PRONTO**

---

**Developer**: Claude Code + Davide Donghi
**Severity**: 🔴 CRITICO (doppio tassazione IVA)
**Impact**: Tutte le vendite con IVA > 0%
**Resolution**: ✅ COMPLETO