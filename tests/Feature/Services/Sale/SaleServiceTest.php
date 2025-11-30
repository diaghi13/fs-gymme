<?php

use App\Services\Sale\SaleService;
use Carbon\Carbon;

beforeEach(function () {
    $this->saleService = new SaleService;
});

describe('SaleService - Discount Calculations', function () {
    it('calculates row total without discounts', function () {
        $total = $this->saleService->calculateRowTotal(
            unitPrice: 10000, // 100.00 EUR
            quantity: 2
        );

        expect($total)->toBe(20000); // 200.00 EUR
    });

    it('calculates row total with percentage discount', function () {
        $total = $this->saleService->calculateRowTotal(
            unitPrice: 10000, // 100.00 EUR
            quantity: 2,
            percentageDiscount: 10 // 10%
        );

        expect($total)->toBe(18000); // 180.00 EUR (200 - 10%)
    });

    it('calculates row total with absolute discount', function () {
        $total = $this->saleService->calculateRowTotal(
            unitPrice: 10000, // 100.00 EUR
            quantity: 2,
            absoluteDiscount: 5000 // 50.00 EUR
        );

        expect($total)->toBe(15000); // 150.00 EUR (200 - 50)
    });

    it('calculates row total with both percentage and absolute discounts', function () {
        $total = $this->saleService->calculateRowTotal(
            unitPrice: 10000, // 100.00 EUR
            quantity: 2,
            percentageDiscount: 10, // 10%
            absoluteDiscount: 2000 // 20.00 EUR
        );

        // 200 EUR - 10% = 180 EUR
        // 180 EUR - 20 EUR = 160 EUR
        expect($total)->toBe(16000);
    });

    it('calculates sale total with multiple rows', function () {
        $rows = [
            ['unit_price' => 10000, 'quantity' => 2, 'percentage_discount' => null, 'absolute_discount' => null],
            ['unit_price' => 5000, 'quantity' => 1, 'percentage_discount' => null, 'absolute_discount' => null],
        ];

        $total = $this->saleService->calculateSaleTotal($rows);

        expect($total)->toBe(25000); // 200 + 50 = 250 EUR
    });

    it('calculates sale total with sale-level percentage discount', function () {
        $rows = [
            ['unit_price' => 10000, 'quantity' => 2, 'percentage_discount' => null, 'absolute_discount' => null],
            ['unit_price' => 5000, 'quantity' => 1, 'percentage_discount' => null, 'absolute_discount' => null],
        ];

        $total = $this->saleService->calculateSaleTotal(
            $rows,
            salePercentageDiscount: 10
        );

        // 250 EUR - 10% = 225 EUR
        expect($total)->toBe(22500);
    });

    it('calculates sale total with sale-level absolute discount', function () {
        $rows = [
            ['unit_price' => 10000, 'quantity' => 2, 'percentage_discount' => null, 'absolute_discount' => null],
        ];

        $total = $this->saleService->calculateSaleTotal(
            $rows,
            saleAbsoluteDiscount: 3000
        );

        // 200 EUR - 30 EUR = 170 EUR
        expect($total)->toBe(17000);
    });

    it('prevents negative totals', function () {
        $total = $this->saleService->calculateRowTotal(
            unitPrice: 10000,
            quantity: 1,
            absoluteDiscount: 20000 // Discount > total
        );

        expect($total)->toBe(0);
    });
});

describe('SaleService - Date Calculations', function () {
    it('calculates expiration date with months duration', function () {
        $startDate = Carbon::parse('2025-01-01');

        $endDate = $this->saleService->calculateExpirationDate(
            $startDate,
            monthsDuration: 3
        );

        expect($endDate->format('Y-m-d'))->toBe('2025-04-01');
    });

    it('calculates expiration date with days duration', function () {
        $startDate = Carbon::parse('2025-01-01');

        $endDate = $this->saleService->calculateExpirationDate(
            $startDate,
            daysDuration: 30
        );

        expect($endDate->format('Y-m-d'))->toBe('2025-01-31');
    });

    it('calculates expiration date with both months and days', function () {
        $startDate = Carbon::parse('2025-01-01');

        $endDate = $this->saleService->calculateExpirationDate(
            $startDate,
            monthsDuration: 1,
            daysDuration: 15
        );

        expect($endDate->format('Y-m-d'))->toBe('2025-02-16'); // +1 month +15 days
    });
});

describe('SaleService - Payment Installments', function () {
    it('calculates single installment', function () {
        $installments = $this->saleService->calculateInstallments(
            totalAmount: 10000,
            installmentsCount: 1,
            firstDueDate: Carbon::parse('2025-01-01')
        );

        expect($installments)->toHaveCount(1);
        expect($installments[0]['amount'])->toBe(10000);
        expect($installments[0]['due_date'])->toBe('2025-01-01');
    });

    it('calculates multiple installments with equal distribution', function () {
        $installments = $this->saleService->calculateInstallments(
            totalAmount: 30000,
            installmentsCount: 3,
            firstDueDate: Carbon::parse('2025-01-01'),
            daysBetweenInstallments: 30
        );

        expect($installments)->toHaveCount(3);

        expect($installments[0]['amount'])->toBe(10000);
        expect($installments[0]['due_date'])->toBe('2025-01-01');

        expect($installments[1]['amount'])->toBe(10000);
        expect($installments[1]['due_date'])->toBe('2025-01-31');

        expect($installments[2]['amount'])->toBe(10000);
        expect($installments[2]['due_date'])->toBe('2025-03-02');
    });

    it('calculates installments with remainder in first installment', function () {
        $installments = $this->saleService->calculateInstallments(
            totalAmount: 10001, // Not evenly divisible by 3
            installmentsCount: 3,
            firstDueDate: Carbon::parse('2025-01-01')
        );

        expect($installments)->toHaveCount(3);

        // First installment gets the remainder (10001 / 3 = 3333 + remainder 2)
        expect($installments[0]['amount'])->toBe(3335); // 3333 + 2
        expect($installments[1]['amount'])->toBe(3333);
        expect($installments[2]['amount'])->toBe(3333);

        // Total should equal original amount
        $total = $installments[0]['amount'] + $installments[1]['amount'] + $installments[2]['amount'];
        expect($total)->toBe(10001);
    });

    it('throws exception for invalid installments count', function () {
        expect(fn () => $this->saleService->calculateInstallments(
            totalAmount: 10000,
            installmentsCount: 0,
            firstDueDate: Carbon::now()
        ))->toThrow(\InvalidArgumentException::class);
    });
});

describe('SaleService - Quick Calculate', function () {
    it('calculates quick totals without tax', function () {
        $data = [
            'rows' => [
                ['unit_price' => 10000, 'quantity' => 2, 'percentage_discount' => null, 'absolute_discount' => null],
                ['unit_price' => 5000, 'quantity' => 1, 'percentage_discount' => null, 'absolute_discount' => null],
            ],
            'sale_percentage_discount' => null,
            'sale_absolute_discount' => null,
        ];

        $result = $this->saleService->quickCalculate($data);

        expect($result['subtotal'])->toBe(25000);
        expect($result['tax_total'])->toBe(0);
        expect($result['total'])->toBe(25000);
    });

    it('calculates quick totals with VAT', function () {
        $data = [
            'rows' => [
                [
                    'unit_price' => 10000,
                    'quantity' => 1,
                    'percentage_discount' => null,
                    'absolute_discount' => null,
                    'vat_rate_percentage' => 22, // 22% IVA
                ],
            ],
            'sale_percentage_discount' => null,
            'sale_absolute_discount' => null,
        ];

        $result = $this->saleService->quickCalculate($data);

        expect($result['subtotal'])->toBe(10000);
        expect($result['tax_total'])->toBe(2200); // 22% of 10000
        expect($result['total'])->toBe(12200);
    });

    it('calculates quick totals with discounts and VAT', function () {
        $data = [
            'rows' => [
                [
                    'unit_price' => 10000,
                    'quantity' => 1,
                    'percentage_discount' => 10, // 10% sconto riga
                    'absolute_discount' => null,
                    'vat_rate_percentage' => 22,
                ],
            ],
            'sale_percentage_discount' => 5, // 5% sconto vendita
            'sale_absolute_discount' => null,
        ];

        $result = $this->saleService->quickCalculate($data);

        // 10000 - 10% = 9000
        // 9000 - 5% = 8550
        expect($result['subtotal'])->toBe(8550);
        // 22% of 9000 (before sale discount) = 1980
        expect($result['tax_total'])->toBe(1980);
    });
});
