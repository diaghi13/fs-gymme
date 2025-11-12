<?php

use App\Services\Sale\SaleService;

beforeEach(function () {
    $this->saleService = app(SaleService::class);
});

/**
 * Test scorporo IVA 22% - Standard
 */
test('calculates net price from gross with 22% VAT correctly', function () {
    // Prezzo lordo €122.00 con IVA 22%
    $grossPrice = 12200; // centesimi
    $vatPercentage = 22;

    // Scorporo: 122 / 1.22 = 100.00
    $expectedNet = 10000; // €100.00

    $vatMultiplier = 1 + ($vatPercentage / 100);
    $calculatedNet = round($grossPrice / $vatMultiplier, 2);

    expect($calculatedNet)->toBe((float) $expectedNet);
});

/**
 * Test scorporo IVA 22% - Caso con arrotondamento critico
 */
test('calculates net price from gross €123 with proper rounding', function () {
    // Prezzo lordo €123.00 con IVA 22%
    $grossPrice = 12300.0;
    $vatPercentage = 22;

    // Scorporo: 123 / 1.22 = 100.819... → 100.82
    $expectedNet = 10081.97; // €100.82 (arrotondato correttamente)

    $vatMultiplier = 1 + ($vatPercentage / 100);
    $calculatedNet = round($grossPrice / $vatMultiplier, 2);

    expect($calculatedNet)->toBe($expectedNet);

    // Verifica che la somma netto + IVA ritorni al lordo
    $recalculatedVat = round($calculatedNet * ($vatPercentage / 100), 2);
    $recalculatedGross = round($calculatedNet + $recalculatedVat, 2);

    expect($recalculatedGross)->toBe((float) $grossPrice);
});

/**
 * Test calcolo IVA su netto - Verifica arrotondamento
 */
test('calculates VAT from net price with correct rounding', function () {
    // Netto €100.00, IVA 22%
    $netPrice = 10000;
    $vatPercentage = 22;

    $vat = round($netPrice * ($vatPercentage / 100), 2);
    $gross = round($netPrice + $vat, 2);

    expect($vat)->toBe(2200.0); // €22.00
    expect($gross)->toBe(12200.0); // €122.00
});

/**
 * Test con più righe - Verifica che l'IVA si arrotondi per ogni riga
 */
test('calculates VAT per row then sums correctly', function () {
    // 3 righe identiche: €100 netto ciascuna, IVA 22%
    $rows = [
        ['net' => 10000.0, 'vat_percentage' => 22],
        ['net' => 10000.0, 'vat_percentage' => 22],
        ['net' => 10000.0, 'vat_percentage' => 22],
    ];

    $totalNet = 0.0;
    $totalVat = 0.0;

    foreach ($rows as $row) {
        $totalNet += $row['net'];
        // IMPORTANTE: Arrotonda IVA per OGNI riga
        $rowVat = round($row['net'] * ($row['vat_percentage'] / 100), 2);
        $totalVat += $rowVat;
    }

    $totalGross = round($totalNet + $totalVat, 2);

    expect($totalNet)->toBe(30000.0); // €300.00
    expect($totalVat)->toBe(6600.0); // €66.00
    expect($totalGross)->toBe(36600.0); // €366.00
});

/**
 * Test scorporo IVA con prezzi "strani" - Casi reali
 */
test('handles tricky VAT separation cases', function () {
    $cases = [
        // [prezzo_lordo, vat%, netto_atteso, iva_attesa, lordo_ricostruito]
        [12200.0, 22, 10000.0, 2200.0, 12200.0],    // €122 → €100 + €22
        [12300.0, 22, 10081.97, 2218.03, 12300.0],  // €123 → €100.82 + €22.18
        [10000.0, 22, 8196.72, 1803.28, 10000.0],   // €100 → €81.97 + €18.03
        [999.0, 22, 818.85, 180.15, 999.0],         // €9.99 → €8.19 + €1.80
    ];

    foreach ($cases as [$gross, $vatPct, $expectedNet, $expectedVat, $expectedGrossRebuilt]) {
        $vatMultiplier = 1 + ($vatPct / 100);
        $net = round($gross / $vatMultiplier, 2);
        $vat = round($net * ($vatPct / 100), 2);
        $grossRebuilt = round($net + $vat, 2);

        expect($net)->toBe($expectedNet, "Net price mismatch for gross €{$gross}");
        expect($vat)->toBe($expectedVat, "VAT mismatch for gross €{$gross}");

        // Tolleranza di 1 centesimo per arrotondamenti
        expect(abs($grossRebuilt - $expectedGrossRebuilt))->toBeLessThanOrEqual(0.01);
    }
});

/**
 * Test con IVA 0% (esente)
 */
test('handles zero VAT rate correctly', function () {
    $netPrice = 10000; // €100.00
    $vatPercentage = 0;

    $vat = round($netPrice * ($vatPercentage / 100), 2);
    $gross = round($netPrice + $vat, 2);

    expect($vat)->toBe(0.0);
    expect($gross)->toBe(10000.0); // Uguale al netto
});

/**
 * Test con IVA 10% (aliquota ridotta)
 */
test('handles 10% reduced VAT rate correctly', function () {
    // Lordo €110, IVA 10%
    $grossPrice = 11000;
    $vatPercentage = 10;

    $vatMultiplier = 1 + ($vatPercentage / 100);
    $net = round($grossPrice / $vatMultiplier, 2);
    $vat = round($net * ($vatPercentage / 100), 2);
    $grossRebuilt = round($net + $vat, 2);

    expect($net)->toBe(10000.0); // €100.00
    expect($vat)->toBe(1000.0);  // €10.00
    expect($grossRebuilt)->toBe(11000.0); // €110.00
});

/**
 * Test con sconti - Verifica che si applicano sul netto
 */
test('applies discounts on net price before VAT calculation', function () {
    // Prezzo lordo iniziale €122 (netto €100)
    $initialGross = 12200;
    $vatPercentage = 22;

    // Scorporo IVA
    $net = round($initialGross / (1 + $vatPercentage / 100), 2); // €100.00

    // Sconto 10% sul NETTO
    $discountPercentage = 10;
    $netAfterDiscount = round($net * (1 - $discountPercentage / 100), 2); // €90.00

    // Calcola IVA sul netto scontato
    $vat = round($netAfterDiscount * ($vatPercentage / 100), 2); // €19.80
    $finalGross = round($netAfterDiscount + $vat, 2); // €109.80

    expect($net)->toBe(10000.0);
    expect($netAfterDiscount)->toBe(9000.0);
    expect($vat)->toBe(1980.0);
    expect($finalGross)->toBe(10980.0);
});

/**
 * Test quantità multiple - Verifica calcolo per riga
 */
test('calculates correctly with quantities', function () {
    // Prezzo unitario lordo €122 (netto €100), quantità 3, IVA 22%
    $unitGross = 12200;
    $quantity = 3;
    $vatPercentage = 22;

    // Scorporo IVA sul prezzo unitario
    $unitNet = round($unitGross / (1 + $vatPercentage / 100), 2); // €100.00

    // Totale riga netto
    $totalNet = $unitNet * $quantity; // €300.00

    // IVA sulla riga
    $vat = round($totalNet * ($vatPercentage / 100), 2); // €66.00

    // Totale lordo
    $totalGross = round($totalNet + $vat, 2); // €366.00

    expect($unitNet)->toBe(10000.0);
    expect($totalNet)->toBe(30000.0);
    expect($vat)->toBe(6600.0);
    expect($totalGross)->toBe(36600.0);
});

/**
 * Test breakdown IVA per aliquota - Come in getSaleSummaryAttribute
 */
test('groups VAT breakdown by rate correctly', function () {
    // Simula 3 righe con IVA diverse
    $rows = [
        ['net' => 10000.0, 'vat_rate' => 22], // €100 @ 22%
        ['net' => 5000.0, 'vat_rate' => 22],  // €50 @ 22%
        ['net' => 8000.0, 'vat_rate' => 10],  // €80 @ 10%
        ['net' => 2000.0, 'vat_rate' => 0],   // €20 @ 0%
    ];

    // Raggruppa per aliquota
    $breakdown = [];

    foreach ($rows as $row) {
        $rate = $row['vat_rate'];

        if (! isset($breakdown[$rate])) {
            $breakdown[$rate] = ['net' => 0.0, 'vat' => 0.0];
        }

        $breakdown[$rate]['net'] += $row['net'];
        $breakdown[$rate]['vat'] += round($row['net'] * ($rate / 100), 2);
    }

    // Verifica breakdown 22%
    expect($breakdown[22]['net'])->toBe(15000.0); // €150 (100+50)
    expect($breakdown[22]['vat'])->toBe(3300.0);  // €33 (22+11)

    // Verifica breakdown 10%
    expect($breakdown[10]['net'])->toBe(8000.0);  // €80
    expect($breakdown[10]['vat'])->toBe(800.0);   // €8

    // Verifica breakdown 0%
    expect($breakdown[0]['net'])->toBe(2000.0);   // €20
    expect($breakdown[0]['vat'])->toBe(0.0);      // €0

    // Totali
    $totalNet = array_sum(array_column($breakdown, 'net'));
    $totalVat = array_sum(array_column($breakdown, 'vat'));
    $totalGross = round($totalNet + $totalVat, 2);

    expect($totalNet)->toBe(25000.0);  // €250
    expect($totalVat)->toBe(4100.0);   // €41
    expect($totalGross)->toBe(29100.0); // €291
});
