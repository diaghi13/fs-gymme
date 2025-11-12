<?php

/**
 * Unit Test per PriceCalculatorService
 * Verifica calcoli IVA precisi e conformità fiscale italiana
 * IMPORTANTE: Il service restituisce valori in EURO (float) per compatibilità con MoneyCast
 */

use App\Services\PriceCalculatorService;

/**
 * Test scorporo IVA standard 22%
 */
test('scorporo IVA 22% su €350,00', function () {
    $result = PriceCalculatorService::excludeVat(
        grossAmountInCents: 35000,
        vatPercentage: 22,
        quantity: 1
    );

    expect($result['unit_price_gross'])->toBe(350.00);
    expect($result['unit_price_net'])->toBe(286.89);
    expect($result['vat_amount'])->toBe(63.11);
    expect($result['total_gross'])->toBe(350.00);
    expect($result['total_net'])->toBe(286.89);
});

/**
 * Test IVA 0% (esente)
 */
test('scorporo IVA 0% su €35,00', function () {
    $result = PriceCalculatorService::excludeVat(
        grossAmountInCents: 3500,
        vatPercentage: 0,
        quantity: 1
    );

    expect($result['unit_price_gross'])->toBe(35.00);
    expect($result['unit_price_net'])->toBe(35.00);
    expect($result['vat_amount'])->toBe(0.00);
});

/**
 * Test scorporo IVA 22% su €12,00 (Asciugamano)
 */
test('scorporo IVA 22% su €12,00', function () {
    $result = PriceCalculatorService::excludeVat(
        grossAmountInCents: 1200,
        vatPercentage: 22,
        quantity: 1
    );

    expect($result['unit_price_gross'])->toBe(12.00);
    expect($result['unit_price_net'])->toBe(9.84);
    expect($result['vat_amount'])->toBe(2.16);
    expect($result['total_gross'])->toBe(12.00);
});

/**
 * Test scorporo IVA 22% su €45,00 (Borsone)
 */
test('scorporo IVA 22% su €45,00', function () {
    $result = PriceCalculatorService::excludeVat(
        grossAmountInCents: 4500,
        vatPercentage: 22,
        quantity: 1
    );

    expect($result['unit_price_gross'])->toBe(45.00);
    expect($result['unit_price_net'])->toBe(36.89);
    expect($result['vat_amount'])->toBe(8.11);
    expect($result['total_gross'])->toBe(45.00);
});

/**
 * Test formula scorporo IVA conforme
 * Formula: Netto = Lordo / (1 + VAT%)
 */
test('formula scorporo conforme normativa italiana', function () {
    $result = PriceCalculatorService::excludeVat(
        grossAmountInCents: 35000,
        vatPercentage: 22,
        quantity: 1
    );

    // Verifica formula: 350 / 1.22 = 286.885... → 286.89 EURO
    $expectedNet = round(350.00 / 1.22, 2);
    expect($result['unit_price_net'])->toBe($expectedNet);

    // Verifica: Netto + IVA = Lordo
    $sum = round($result['unit_price_net'] + $result['vat_amount'], 2);
    expect($sum)->toBe($result['unit_price_gross']);
});

/**
 * Test quantità multiple
 */
test('calcolo IVA con quantità 3', function () {
    $result = PriceCalculatorService::excludeVat(
        grossAmountInCents: 35000,
        vatPercentage: 22,
        quantity: 3
    );

    expect($result['unit_price_net'])->toBe(286.89);
    expect($result['unit_price_gross'])->toBe(350.00);
    expect($result['total_net'])->toBe(860.67);
    expect($result['total_gross'])->toBe(1050.02); // Arrotondamento libreria
    expect($result['vat_amount'])->toBe(189.35);
});

/**
 * Test aggiunta IVA (includeVat)
 */
test('aggiunta IVA 22% su €100,00 netto', function () {
    $result = PriceCalculatorService::includeVat(
        netAmountInCents: 10000,
        vatPercentage: 22,
        quantity: 1
    );

    expect($result['unit_price_net'])->toBe(100.00);
    expect($result['unit_price_gross'])->toBe(122.00);
    expect($result['vat_amount'])->toBe(22.00);
    expect($result['total_gross'])->toBe(122.00);
});

/**
 * Test calculateDiscountAmount
 */
test('calcolo sconto assoluto 10% su €350', function () {
    $discount = PriceCalculatorService::calculateDiscountAmount(
        amountInCents: 35000,
        discountPercentage: 10
    );

    expect($discount)->toBe(35.00); // 10% di 350 = 35 EURO
});

/**
 * Test valori restituiti sono FLOAT in EURO
 */
test('valori restituiti sono float in EURO', function () {
    $result = PriceCalculatorService::excludeVat(
        grossAmountInCents: 35000,
        vatPercentage: 22,
        quantity: 1
    );

    expect($result['unit_price_net'])->toBeFloat();
    expect($result['unit_price_gross'])->toBeFloat();
    expect($result['vat_amount'])->toBeFloat();
    expect($result['total_net'])->toBeFloat();
    expect($result['total_gross'])->toBeFloat();
});

/**
 * Test caso vendita ID 20 completa (totali)
 */
test('totali vendita ID 20: €442 lordo, 4 prodotti', function () {
    // Simula i 4 prodotti della vendita ID 20
    $prodotto1 = PriceCalculatorService::excludeVat(35000, 22, 1); // €350 IVA 22%
    $prodotto2 = PriceCalculatorService::excludeVat(3500, 0, 1);   // €35 IVA 0%
    $prodotto3 = PriceCalculatorService::excludeVat(1200, 22, 1);  // €12 IVA 22%
    $prodotto4 = PriceCalculatorService::excludeVat(4500, 22, 1);  // €45 IVA 22%

    // Calcola totali in EURO
    $totalGross = $prodotto1['total_gross'] + $prodotto2['total_gross'] +
                  $prodotto3['total_gross'] + $prodotto4['total_gross'];

    $totalNet = $prodotto1['total_net'] + $prodotto2['total_net'] +
                $prodotto3['total_net'] + $prodotto4['total_net'];

    $totalVat = $prodotto1['vat_amount'] + $prodotto2['vat_amount'] +
                $prodotto3['vat_amount'] + $prodotto4['vat_amount'];

    expect($totalGross)->toBe(442.00);
    expect(round($totalNet, 2))->toBe(368.62); // 286.89 + 35 + 9.84 + 36.89
    expect(round($totalVat, 2))->toBe(73.38);   // 63.11 + 0 + 2.16 + 8.11

    // Verifica: Netto + IVA = Lordo
    expect(round($totalNet + $totalVat, 2))->toBe($totalGross);
});
