<?php

/**
 * Test di verifica calcoli IVA per vendite
 * Basato su vendita reale ID 20 con prodotti multipli e aliquote diverse
 */
uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    // Setup tenant per tests multi-tenancy
    $this->tenant = \App\Models\Tenant::factory()->create();
    tenancy()->initialize($this->tenant);

    // Crea VatRates standard
    $this->vat22 = \App\Models\VatRate::factory()->create(['percentage' => 22]);
    $this->vat0 = \App\Models\VatRate::factory()->create(['percentage' => 0]);

    // Crea customer
    $this->customer = \App\Models\Customer\Customer::factory()->create();

    // Crea document type
    $this->documentType = \App\Models\DocumentType::factory()->create();

    // Crea payment condition e method
    $this->paymentCondition = \App\Models\PaymentCondition::factory()->create();
    $this->paymentMethod = \App\Models\PaymentMethod::factory()->create();

    // Crea financial resource
    $this->financialResource = \App\Models\FinancialResource::factory()->create();
});

/**
 * Test: Vendita con subscription + extra products (caso vendita ID 20)
 *
 * Prodotti:
 * - Abbonamento: €350,00 IVA 22% → Netto €286,89
 * - Quota associativa: €35,00 IVA 0% → Netto €35,00
 * - Asciugamano: €12,00 IVA 22% → Netto €9,84
 * - Borsone: €45,00 IVA 22% → Netto €36,89
 *
 * Totale atteso: Lordo €442,00 / Netto €368,62 / IVA €73,38
 */
test('calcola correttamente IVA per vendita multi-prodotto con aliquote diverse', function () {
    // Arrange - Crea price lists per i prodotti
    $membership = \App\Models\PriceList\Membership::factory()->create([
        'price' => 35000, // €350 (centesimi)
        'vat_rate_id' => $this->vat22->id,
        'tax_included' => true,
    ]);

    $quotaAssociativa = \App\Models\PriceList\Article::factory()->create([
        'price' => 3500, // €35
        'vat_rate_id' => $this->vat0->id,
        'tax_included' => true,
    ]);

    $asciugamano = \App\Models\PriceList\Article::factory()->create([
        'price' => 1200, // €12
        'vat_rate_id' => $this->vat22->id,
        'tax_included' => true,
    ]);

    $borsone = \App\Models\PriceList\Article::factory()->create([
        'price' => 4500, // €45
        'vat_rate_id' => $this->vat22->id,
        'tax_included' => true,
    ]);

    // Act - Crea vendita tramite SaleService
    $saleData = [
        'customer_id' => $this->customer->id,
        'document_type_id' => $this->documentType->id,
        'payment_condition_id' => $this->paymentCondition->id,
        'financial_resource_id' => $this->financialResource->id,
        'date' => now()->format('Y-m-d'),
        'year' => now()->year,
        'tax_included' => true,
        'status' => 'saved',
        'sale_rows' => [
            [
                'price_list_id' => $membership->id,
                'unit_price' => 35000,
                'quantity' => 1,
                'percentage_discount' => 0,
            ],
            [
                'price_list_id' => $quotaAssociativa->id,
                'unit_price' => 3500,
                'quantity' => 1,
                'percentage_discount' => 0,
            ],
            [
                'price_list_id' => $asciugamano->id,
                'unit_price' => 1200,
                'quantity' => 1,
                'percentage_discount' => 0,
            ],
            [
                'price_list_id' => $borsone->id,
                'unit_price' => 4500,
                'quantity' => 1,
                'percentage_discount' => 0,
            ],
        ],
        'payments' => [
            [
                'payment_method_id' => $this->paymentMethod->id,
                'amount' => 442.00, // Totale lordo
                'due_date' => now()->format('Y-m-d'),
                'payed_at' => now()->format('Y-m-d'),
            ],
        ],
    ];

    $saleService = new \App\Services\Sale\SaleService;
    $sale = $saleService->store($saleData);

    // Assert - Verifica ogni singola riga
    expect($sale->rows)->toHaveCount(4);

    // Riga 1: Abbonamento €350 IVA 22%
    $row1 = $sale->rows[0];
    expect($row1->unit_price_gross)->toBe(350.00);
    expect($row1->unit_price_net)->toBe(286.89);
    expect($row1->vat_amount)->toBe(63.11);
    expect($row1->total_gross)->toBe(350.00);
    expect($row1->total_net)->toBe(286.89);

    // Riga 2: Quota €35 IVA 0%
    $row2 = $sale->rows[1];
    expect($row2->unit_price_gross)->toBe(35.00);
    expect($row2->unit_price_net)->toBe(35.00);
    expect($row2->vat_amount)->toBe(0.00);
    expect($row2->total_gross)->toBe(35.00);

    // Riga 3: Asciugamano €12 IVA 22%
    $row3 = $sale->rows[2];
    expect($row3->unit_price_gross)->toBe(12.00);
    expect($row3->unit_price_net)->toBe(9.84);
    expect($row3->vat_amount)->toBe(2.16);
    expect($row3->total_gross)->toBe(12.00);

    // Riga 4: Borsone €45 IVA 22%
    $row4 = $sale->rows[3];
    expect($row4->unit_price_gross)->toBe(45.00);
    expect($row4->unit_price_net)->toBe(36.89);
    expect($row4->vat_amount)->toBe(8.11);
    expect($row4->total_gross)->toBe(45.00);

    // Verifica totali vendita tramite sale_summary
    $summary = $sale->sale_summary;
    expect($summary['gross_price'])->toBe(442.00);
    expect($summary['net_price'])->toBe(368.62); // 286.89 + 35.00 + 9.84 + 36.89
    expect($summary['total_tax'])->toBe(73.38);   // 63.11 + 0 + 2.16 + 8.11

    // Verifica breakdown IVA per aliquota
    expect($summary['vat_breakdown'])->toHaveCount(2); // IVA 22% e IVA 0%
});

/**
 * Test: Verifica arrotondamenti conformi normativa italiana
 *
 * Regola: L'aggiustamento arrotondamenti va sull'imponibile, MAI sull'IVA
 */
test('applica arrotondamenti conformi alla normativa italiana', function () {
    // Arrange
    $priceList = \App\Models\PriceList\Article::factory()->create([
        'price' => 35000, // €350
        'vat_rate_id' => $this->vat22->id,
        'tax_included' => true,
    ]);

    // Act
    $result = \App\Services\PriceCalculatorService::excludeVat(
        grossAmountInCents: 35000,
        vatPercentage: 22,
        quantity: 1
    );

    // Assert - Verifica formula scorporo
    // Netto = Lordo / (1 + VAT%)
    // 350 / 1.22 = 286.885... → arrotonda a 286.89
    expect($result['unit_price_net'])->toBe(286.89);
    expect($result['unit_price_gross'])->toBe(350.00);

    // IVA = Lordo - Netto
    // 350.00 - 286.89 = 63.11 ✅
    expect($result['vat_amount'])->toBe(63.11);

    // Verifica: Netto + IVA = Lordo
    $sum = round($result['unit_price_net'] + $result['vat_amount'], 2);
    expect($sum)->toBe($result['unit_price_gross']);
});

/**
 * Test: Salvataggio corretto nel database con MoneyCast
 *
 * Verifica che i valori in EURO vengano convertiti correttamente in centesimi
 */
test('salva correttamente i valori nel database tramite MoneyCast', function () {
    // Arrange
    $priceList = \App\Models\PriceList\Article::factory()->create([
        'price' => 35000,
        'vat_rate_id' => $this->vat22->id,
    ]);

    $sale = \App\Models\Sale\Sale::factory()->create([
        'customer_id' => $this->customer->id,
        'tax_included' => true,
    ]);

    // Act - Crea SaleRow con valori in EURO (come restituiti dal PriceCalculatorService)
    $saleRow = \App\Models\Sale\SaleRow::create([
        'sale_id' => $sale->id,
        'price_list_id' => $priceList->id,
        'description' => 'Test prodotto',
        'quantity' => 1,
        'unit_price_net' => 286.89,    // EURO
        'unit_price_gross' => 350.00,  // EURO
        'vat_amount' => 63.11,          // EURO
        'total_net' => 286.89,
        'total_gross' => 350.00,
        'vat_rate_id' => $this->vat22->id,
    ]);

    // Assert - Verifica che MoneyCast converta correttamente
    // Lettura raw dal DB (dovrebbe essere in centesimi)
    $rawNet = \DB::connection('tenant')
        ->table('sale_rows')
        ->where('id', $saleRow->id)
        ->value('unit_price_net');

    expect($rawNet)->toBe(28689); // 286.89 * 100

    // Lettura con cast (dovrebbe essere in euro)
    $saleRow->refresh();
    expect($saleRow->unit_price_net)->toBe(286.89);
    expect($saleRow->unit_price_gross)->toBe(350.00);
    expect($saleRow->vat_amount)->toBe(63.11);
});

/**
 * Test: Prezzi con IVA 0% (esenti)
 */
test('calcola correttamente prezzi con IVA 0%', function () {
    // Arrange
    $priceList = \App\Models\PriceList\Article::factory()->create([
        'price' => 3500, // €35
        'vat_rate_id' => $this->vat0->id,
        'tax_included' => true,
    ]);

    // Act
    $result = \App\Services\PriceCalculatorService::excludeVat(
        grossAmountInCents: 3500,
        vatPercentage: 0,
        quantity: 1
    );

    // Assert - Con IVA 0%, netto = lordo
    expect($result['unit_price_net'])->toBe(35.00);
    expect($result['unit_price_gross'])->toBe(35.00);
    expect($result['vat_amount'])->toBe(0.00);
});

/**
 * Test: Quantità multiple con prezzi corretti
 */
test('calcola correttamente IVA con quantità multiple', function () {
    // Arrange & Act
    $result = \App\Services\PriceCalculatorService::excludeVat(
        grossAmountInCents: 35000, // €350 unitario
        vatPercentage: 22,
        quantity: 3
    );

    // Assert
    expect($result['unit_price_net'])->toBe(286.89);   // Prezzo unitario netto
    expect($result['unit_price_gross'])->toBe(350.00); // Prezzo unitario lordo

    // Totali (x3)
    expect($result['total_net'])->toBe(860.67);   // 286.89 * 3
    expect($result['total_gross'])->toBe(1050.00); // 350.00 * 3
    expect($result['vat_amount'])->toBe(189.33);   // 1050 - 860.67
});

/**
 * Test: Sconti applicati correttamente
 */
test('calcola correttamente IVA con sconto percentuale', function () {
    // Arrange & Act - €350 con sconto 10%
    $result = \App\Services\PriceCalculatorService::excludeVat(
        grossAmountInCents: 35000,
        vatPercentage: 22,
        quantity: 1,
        discountPercentage: 10
    );

    // Assert
    // Lordo scontato: €350 - 10% = €315
    expect($result['total_gross'])->toBe(315.00);

    // Netto scontato: €315 / 1.22 = €258.20
    expect($result['total_net'])->toBe(258.20);

    // IVA: €315 - €258.20 = €56.80
    expect($result['vat_amount'])->toBe(56.80);
});
