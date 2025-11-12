<?php

namespace App\Services\Sale;

use App\Models\PriceList\Membership;
use App\Models\PriceList\Subscription;
use App\Models\PriceList\SubscriptionContent;
use App\Models\Sale\Sale;
use App\Models\Support\DocumentTypeElectronicInvoice;
use App\Services\PriceList\PriceListService;
use Carbon\Carbon;

class SaleService
{
    public function create($customerId = null)
    {
        $progressiveNumberService = new ProgressiveNumberService;
        $progressiveData = $progressiveNumberService->generateNextForCurrentYear();

        $sale = new Sale([
            'date' => now(),
            'year' => $progressiveData['year'],
            'progressive_number' => $progressiveData['progressive_number'],
            'progressive_number_prefix' => $progressiveData['progressive_number_prefix'],
            'progressive_number_value' => $progressiveData['progressive_number_value'],
            'document_type_id' => DocumentTypeElectronicInvoice::query()->where('code', 'TD01')->first()?->id ?? null,
        ]);

        if ($customerId && $customer = \App\Models\Customer\Customer::find($customerId)) {
            $sale->customer_id = $customer->id;
            $sale->customer = $customer->append(['full_name', 'option_label']);
        }

        return [
            'sale' => $sale,
            'customers' => \App\Models\Customer\Customer::all()->append('option_label')->toArray(),
            'documentTypeElectronicInvoices' => DocumentTypeElectronicInvoice::all()->append('label')->toArray(),
            'paymentConditions' => \App\Models\Support\PaymentCondition::with(['installments', 'payment_method'])->get()->toArray(),
            'paymentMethods' => \App\Models\Support\PaymentMethod::all()->append('label')->toArray(),
            'financialResources' => \App\Models\Support\FinancialResource::with('financial_resource_type')->get()->toArray(),
            'promotions' => \App\Models\Sale\Promotion::all()->toArray(),
            'priceLists' => PriceListService::toTree()->toArray(),
            'vatRates' => \App\Models\VatRate::all()->toArray(),
        ];
    }

    /**
     * Calculate row total with discounts
     */
    public function calculateRowTotal(float $unitPrice, float $quantity, ?float $percentageDiscount = null, ?float $absoluteDiscount = null): int
    {
        $total = $unitPrice * $quantity;

        // Apply percentage discount first
        if ($percentageDiscount) {
            $total -= ($total * ($percentageDiscount / 100));
        }

        // Then apply absolute discount
        if ($absoluteDiscount) {
            $total -= $absoluteDiscount;
        }

        return max(0, (int) round($total));
    }

    /**
     * Calculate sale total with discounts applied
     */
    public function calculateSaleTotal(array $rows, ?float $salePercentageDiscount = null, ?float $saleAbsoluteDiscount = null): int
    {
        $rowsTotal = 0;

        foreach ($rows as $row) {
            $rowsTotal += $this->calculateRowTotal(
                $row['unit_price'],
                $row['quantity'],
                $row['percentage_discount'] ?? null,
                $row['absolute_discount'] ?? null
            );
        }

        // Apply sale-level percentage discount
        if ($salePercentageDiscount) {
            $rowsTotal -= ($rowsTotal * ($salePercentageDiscount / 100));
        }

        // Apply sale-level absolute discount
        if ($saleAbsoluteDiscount) {
            $rowsTotal -= $saleAbsoluteDiscount;
        }

        return max(0, (int) round($rowsTotal));
    }

    /**
     * Calculate subscription/membership expiration date
     *
     * @param  Carbon  $startDate  Start date
     * @param  int|null  $monthsDuration  Duration in months
     * @param  int|null  $daysDuration  Duration in days
     */
    public function calculateExpirationDate(Carbon $startDate, ?int $monthsDuration = null, ?int $daysDuration = null): Carbon
    {
        $endDate = $startDate->copy();

        if ($monthsDuration) {
            $endDate->addMonths($monthsDuration);
        }

        if ($daysDuration) {
            $endDate->addDays($daysDuration);
        }

        return $endDate;
    }

    /**
     * Calculate flexible payment installments
     *
     * @param  int  $totalAmount  Total amount in cents
     * @param  int  $installmentsCount  Number of installments
     * @param  Carbon  $firstDueDate  First installment due date
     * @param  int  $daysBetweenInstallments  Days between each installment
     */
    public function calculateInstallments(int $totalAmount, int $installmentsCount, Carbon $firstDueDate, int $daysBetweenInstallments = 30): array
    {
        if ($installmentsCount < 1) {
            throw new \InvalidArgumentException('Installments count must be at least 1');
        }

        // Calculate base amount per installment
        $baseAmount = intdiv($totalAmount, $installmentsCount);
        $remainder = $totalAmount % $installmentsCount;

        $installments = [];

        for ($i = 0; $i < $installmentsCount; $i++) {
            // Add remainder to first installment
            $amount = $baseAmount + ($i === 0 ? $remainder : 0);

            // Calculate due date
            $dueDate = $firstDueDate->copy()->addDays($i * $daysBetweenInstallments);

            $installments[] = [
                'installment_number' => $i + 1,
                'amount' => $amount,
                'due_date' => $dueDate->format('Y-m-d'),
                'payed_at' => null,
            ];
        }

        return $installments;
    }

    /**
     * Get subscription contents (standard + optional selected)
     */
    public function getSubscriptionContents(Subscription $subscription, array $selectedOptionalIds = []): array
    {
        $contents = [];

        // Add standard contents
        foreach ($subscription->standard_content as $content) {
            $contents[] = $this->formatSubscriptionContent($content, false);
        }

        // Add selected optional contents
        if (! empty($selectedOptionalIds)) {
            $optionalContents = $subscription->optional_content()
                ->whereIn('id', $selectedOptionalIds)
                ->get();

            foreach ($optionalContents as $content) {
                $contents[] = $this->formatSubscriptionContent($content, true);
            }
        }

        return $contents;
    }

    /**
     * Format subscription content for sale row
     */
    protected function formatSubscriptionContent(SubscriptionContent $content, bool $isOptional): array
    {
        $content->load('price_listable.vat_rate');

        return [
            'id' => $content->id,
            'price_listable_type' => $content->price_listable_type,
            'price_listable_id' => $content->price_listable_id,
            'price_listable' => $content->price_listable,
            'price' => $content->price,
            'vat_rate_id' => $content->vat_rate_id,
            'is_optional' => $isOptional,
            'months_duration' => $content->months_duration,
            'days_duration' => $content->days_duration,
            'validity_type' => $content->validity_type,
            'validity_days' => $content->validity_days,
            'validity_months' => $content->validity_months,
            'description' => $content->price_listable->selling_description ?? $content->price_listable->name,
        ];
    }

    /**
     * Calculate membership expiration from start date
     */
    public function calculateMembershipExpiration(Membership $membership, Carbon $startDate): Carbon
    {
        return $this->calculateExpirationDate(
            $startDate,
            $membership->months_duration,
            $membership->days_duration
        );
    }

    /**
     * Quick price calculation for display (without saving)
     */
    public function quickCalculate(array $data): array
    {
        $rowsTotal = $this->calculateSaleTotal(
            $data['rows'] ?? [],
            $data['sale_percentage_discount'] ?? null,
            $data['sale_absolute_discount'] ?? null
        );

        $taxTotal = 0;

        foreach ($data['rows'] ?? [] as $row) {
            if (isset($row['vat_rate_percentage'])) {
                $rowTotal = $this->calculateRowTotal(
                    $row['unit_price'],
                    $row['quantity'],
                    $row['percentage_discount'] ?? null,
                    $row['absolute_discount'] ?? null
                );

                $taxTotal += $rowTotal * ($row['vat_rate_percentage'] / 100);
            }
        }

        return [
            'subtotal' => $rowsTotal,
            'tax_total' => (int) round($taxTotal),
            'total' => $rowsTotal + (int) round($taxTotal),
        ];
    }
}
