<?php

use App\Services\Sale\SaleService;

beforeEach(function () {
    $this->service = new SaleService;
});

describe('quickCalculate with include_taxes = true (prices are gross)', function () {
    it('calculates correctly with single numeric VAT rate', function () {
        $data = [
            'include_taxes' => true,
            'rows' => [
                [
                    'unit_price' => 122, // 122€ lordo con IVA 22%
                    'quantity' => 1,
                    'vat_rate_percentage' => 22,
                ],
            ],
        ];

        $result = $this->service->quickCalculate($data);

        expect($result['subtotal'])->toBe(100); // 100€ netto
        expect($result['tax_total'])->toBe(22); // 22€ IVA
        expect($result['total'])->toBe(122); // 122€ totale
    });

    it('calculates correctly with subscription vat_breakdown', function () {
        $data = [
            'include_taxes' => true,
            'rows' => [
                [
                    'unit_price' => 100,
                    'quantity' => 1,
                    'vat_rate_percentage' => [22, 10, 0], // Array di aliquote
                    'vat_breakdown' => [
                        ['subtotal' => 61, 'vat_rate' => 22], // 50€ netto + 11€ IVA = 61€
                        ['subtotal' => 33, 'vat_rate' => 10], // 30€ netto + 3€ IVA = 33€
                        ['subtotal' => 20, 'vat_rate' => 0],  // 20€ netto + 0€ IVA = 20€
                    ],
                ],
            ],
        ];

        $result = $this->service->quickCalculate($data);

        // Netto totale: 50 + 30 + 20 = 100€
        // IVA totale: 11 + 3 + 0 = 14€
        // Totale: 114€
        expect($result['subtotal'])->toBe(100);
        expect($result['tax_total'])->toBe(14);
        expect($result['total'])->toBe(114);
    });

    it('applies stamp duty when VAT is 0 and total exceeds threshold', function () {
        $data = [
            'include_taxes' => true,
            'rows' => [
                [
                    'unit_price' => 100,
                    'quantity' => 1,
                    'vat_rate_percentage' => 0, // IVA 0%
                ],
            ],
        ];

        $result = $this->service->quickCalculate($data);

        expect($result['stamp_duty_applied'])->toBeTrue();
        expect($result['stamp_duty_amount'])->toBe(2.0); // 2€
        expect($result['total'])->toBe(102); // 100€ + 2€ bollo
    });

    it('does not apply stamp duty when VAT is 0 but total is below threshold', function () {
        $data = [
            'include_taxes' => true,
            'rows' => [
                [
                    'unit_price' => 50,
                    'quantity' => 1,
                    'vat_rate_percentage' => 0,
                ],
            ],
        ];

        $result = $this->service->quickCalculate($data);

        expect($result['stamp_duty_applied'])->toBeFalse();
        expect($result['total'])->toBe(50);
    });

    it('applies stamp duty for subscription with at least one 0% VAT', function () {
        $data = [
            'include_taxes' => true,
            'rows' => [
                [
                    'unit_price' => 100,
                    'quantity' => 1,
                    'vat_rate_percentage' => [22, 0],
                    'vat_breakdown' => [
                        ['subtotal' => 61, 'vat_rate' => 22], // 50€ netto
                        ['subtotal' => 50, 'vat_rate' => 0],  // 50€ netto
                    ],
                ],
            ],
        ];

        $result = $this->service->quickCalculate($data);

        expect($result['stamp_duty_applied'])->toBeTrue();
        expect($result['total'])->toBe(113); // 100 netto + 11 IVA + 2 bollo
    });
});

describe('quickCalculate with include_taxes = false (prices are net)', function () {
    it('calculates correctly with single numeric VAT rate', function () {
        $data = [
            'include_taxes' => false,
            'rows' => [
                [
                    'unit_price' => 100, // 100€ netto
                    'quantity' => 1,
                    'vat_rate_percentage' => 22,
                ],
            ],
        ];

        $result = $this->service->quickCalculate($data);

        expect($result['subtotal'])->toBe(100); // 100€ netto
        expect($result['tax_total'])->toBe(22); // 22€ IVA aggiunta
        expect($result['total'])->toBe(122); // 122€ totale
    });

    it('calculates correctly with subscription vat_breakdown', function () {
        $data = [
            'include_taxes' => false,
            'rows' => [
                [
                    'unit_price' => 100,
                    'quantity' => 1,
                    'vat_rate_percentage' => [22, 10, 0],
                    'vat_breakdown' => [
                        ['subtotal' => 50, 'vat_rate' => 22], // 50€ netto → +11€ IVA
                        ['subtotal' => 30, 'vat_rate' => 10], // 30€ netto → +3€ IVA
                        ['subtotal' => 20, 'vat_rate' => 0],  // 20€ netto → +0€ IVA
                    ],
                ],
            ],
        ];

        $result = $this->service->quickCalculate($data);

        expect($result['subtotal'])->toBe(100); // 100€ netto
        expect($result['tax_total'])->toBe(14); // 14€ IVA (11+3+0)
        expect($result['total'])->toBe(114); // 114€ totale
    });

    it('applies stamp duty when VAT is 0 and total exceeds threshold', function () {
        $data = [
            'include_taxes' => false,
            'rows' => [
                [
                    'unit_price' => 100,
                    'quantity' => 1,
                    'vat_rate_percentage' => 0,
                ],
            ],
        ];

        $result = $this->service->quickCalculate($data);

        expect($result['stamp_duty_applied'])->toBeTrue();
        expect($result['stamp_duty_amount'])->toBe(2.0);
        expect($result['total'])->toBe(102); // 100€ + 2€ bollo (no IVA)
    });
});

describe('quickCalculate with discounts', function () {
    it('applies row-level percentage discount with gross prices', function () {
        $data = [
            'include_taxes' => true,
            'rows' => [
                [
                    'unit_price' => 122,
                    'quantity' => 1,
                    'percentage_discount' => 10, // 10% sconto
                    'vat_rate_percentage' => 22,
                ],
            ],
        ];

        $result = $this->service->quickCalculate($data);

        // 122€ - 10% = 109.8€ lordo
        // Netto: 109.8 / 1.22 = 90€
        // IVA: 109.8 - 90 = 19.8€
        expect($result['subtotal'])->toBe(90);
        expect($result['tax_total'])->toBe(20); // arrotondato
        expect($result['total'])->toBe(110); // arrotondato
    });

    it('applies sale-level discount', function () {
        $data = [
            'include_taxes' => true,
            'sale_percentage_discount' => 10,
            'rows' => [
                [
                    'unit_price' => 122,
                    'quantity' => 1,
                    'vat_rate_percentage' => 22,
                ],
            ],
        ];

        $result = $this->service->quickCalculate($data);

        // Sconto applicato al totale righe (122 - 10% = 109.8)
        expect($result['total'])->toBe(110); // arrotondato
    });
});

describe('quickCalculate edge cases', function () {
    it('handles null vat_rate_percentage as exempt', function () {
        $data = [
            'include_taxes' => true,
            'rows' => [
                [
                    'unit_price' => 100,
                    'quantity' => 1,
                    'vat_rate_percentage' => null,
                ],
            ],
        ];

        $result = $this->service->quickCalculate($data);

        expect($result['stamp_duty_applied'])->toBeTrue();
        expect($result['tax_total'])->toBe(0);
    });

    it('handles multiple rows with different VAT rates', function () {
        $data = [
            'include_taxes' => true,
            'rows' => [
                [
                    'unit_price' => 122,
                    'quantity' => 1,
                    'vat_rate_percentage' => 22,
                ],
                [
                    'unit_price' => 110,
                    'quantity' => 1,
                    'vat_rate_percentage' => 10,
                ],
                [
                    'unit_price' => 50,
                    'quantity' => 1,
                    'vat_rate_percentage' => 0,
                ],
            ],
        ];

        $result = $this->service->quickCalculate($data);

        // Row 1: 100€ netto + 22€ IVA = 122€
        // Row 2: 100€ netto + 10€ IVA = 110€
        // Row 3: 50€ netto + 0€ IVA = 50€
        expect($result['subtotal'])->toBe(250);
        expect($result['tax_total'])->toBe(32);
        expect($result['stamp_duty_applied'])->toBeTrue();
        expect($result['total'])->toBe(284); // 282 + 2 bollo
    });
});
