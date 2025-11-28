<?php

namespace App\Services\Sale;

use App\Enums\SaleAccountingStatusEnum;
use App\Enums\SaleExportedStatusEnum;
use App\Enums\SalePaymentStatusEnum;
use App\Models\PriceList\Membership;
use App\Models\PriceList\PriceList;
use App\Models\PriceList\Subscription;
use App\Models\PriceList\SubscriptionContent;
use App\Models\Sale\Sale;
use App\Models\Support\DocumentTypeElectronicInvoice;
use App\Services\PriceList\PriceListService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

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
            'paymentConditions' => \App\Models\Support\PaymentCondition::with(['installments', 'payment_method'])
                ->where('active', true)
                ->whereHas('payment_method', function ($query) {
                    $query->where('is_active', true);
                })
                ->get()
                ->toArray(),
            'paymentMethods' => \App\Models\Support\PaymentMethod::where('is_active', true)
                ->orderBy('order')
                ->get()
                ->append('label')
                ->toArray(),
            'financialResources' => \App\Models\Support\FinancialResource::with('financial_resource_type')->get()->toArray(),
            'promotions' => \App\Models\Sale\Promotion::all()->toArray(),
            'priceLists' => PriceListService::toTree()->toArray(),
            'vatRates' => \App\Models\VatRate::where('is_active', true)
                ->orderBy('percentage', 'desc')
                ->get()
                ->toArray(),
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
     *
     * @param  array  $data  Array containing:
     *                       - rows: array of sale rows with vat_rate_percentage (numeric or array), vat_rate_nature, and optional vat_breakdown
     *                       - sale_percentage_discount: optional percentage discount on total
     *                       - sale_absolute_discount: optional absolute discount on total
     *                       - tax_included: bool - true if prices are gross (VAT included), false if net
     */
    public function quickCalculate(array $data): array
    {
        $taxIncluded = $data['tax_included'] ?? true;

        // Calculate rows total (base subtotal before VAT calculations)
        $rowsTotal = $this->calculateSaleTotal(
            $data['rows'] ?? [],
            $data['sale_percentage_discount'] ?? null,
            $data['sale_absolute_discount'] ?? null
        );

        $taxTotal = 0;
        $hasExemptOperation = false;
        $netTotal = 0;

        // Exempt/non-taxable nature codes that require stamp duty
        $exemptNatures = ['N2.1', 'N2.2', 'N3.5', 'N3.6', 'N4'];

        foreach ($data['rows'] ?? [] as $row) {
            // Calculate row subtotal with discounts
            $rowSubtotal = $this->calculateRowTotal(
                $row['unit_price'],
                $row['quantity'],
                $row['percentage_discount'] ?? null,
                $row['absolute_discount'] ?? null
            );

            // Handle VAT calculation based on vat_rate_percentage type
            if (isset($row['vat_rate_percentage'])) {
                // Case 1: Single numeric VAT rate (regular products)
                if (is_numeric($row['vat_rate_percentage'])) {
                    $vatRate = (float) $row['vat_rate_percentage'];

                    if ($taxIncluded) {
                        // Prices are GROSS (VAT included) - scorporare l'IVA
                        $rowNet = $rowSubtotal / (1 + ($vatRate / 100));
                        $rowVat = $rowSubtotal - $rowNet;
                    } else {
                        // Prices are NET - aggiungere l'IVA
                        $rowNet = $rowSubtotal;
                        $rowVat = $rowSubtotal * ($vatRate / 100);
                    }

                    $netTotal += $rowNet;
                    $taxTotal += $rowVat;

                    // Check for exempt operations by nature code
                    $nature = $row['vat_rate_nature'] ?? null;
                    if ($nature && in_array($nature, $exemptNatures)) {
                        $hasExemptOperation = true;
                    }
                }
                // Case 2: Array of VAT rates (subscriptions with vat_breakdown)
                elseif (is_array($row['vat_rate_percentage']) && isset($row['vat_breakdown'])) {
                    foreach ($row['vat_breakdown'] as $breakdown) {
                        $breakdownSubtotal = $breakdown['subtotal'] ?? 0;
                        $breakdownVatRate = (float) ($breakdown['vat_rate'] ?? 0);

                        if ($taxIncluded) {
                            // Prices are GROSS - scorporare l'IVA
                            $breakdownNet = $breakdownSubtotal / (1 + ($breakdownVatRate / 100));
                            $breakdownVat = $breakdownSubtotal - $breakdownNet;
                        } else {
                            // Prices are NET - aggiungere l'IVA
                            $breakdownNet = $breakdownSubtotal;
                            $breakdownVat = $breakdownSubtotal * ($breakdownVatRate / 100);
                        }

                        $netTotal += $breakdownNet;
                        $taxTotal += $breakdownVat;

                        // Check for exempt operations in breakdown by nature
                        $breakdownNature = $breakdown['vat_nature'] ?? null;
                        if ($breakdownNature && in_array($breakdownNature, $exemptNatures)) {
                            $hasExemptOperation = true;
                        }
                    }
                }
                // Case 3: Array of VAT rates without vat_breakdown (fallback - check for exempt by nature)
                elseif (is_array($row['vat_rate_percentage'])) {
                    // Check natures if available
                    $natures = $row['vat_rate_nature'] ?? [];
                    if (is_array($natures)) {
                        foreach ($natures as $nature) {
                            if ($nature && in_array($nature, $exemptNatures)) {
                                $hasExemptOperation = true;
                                break;
                            }
                        }
                    }

                    // Per il calcolo IVA, usiamo la media o trattiamo come netto senza IVA per sicurezza
                    if ($taxIncluded) {
                        // Assumiamo che sia lordo ma non possiamo calcolare precisamente
                        $netTotal += $rowSubtotal / 1.22; // Assumiamo 22% come default prudenziale
                        $taxTotal += $rowSubtotal - ($rowSubtotal / 1.22);
                    } else {
                        $netTotal += $rowSubtotal;
                        // Niente IVA aggiunta senza breakdown
                    }
                }
            } elseif (is_null($row['vat_rate_percentage'])) {
                // Check nature if available
                $nature = $row['vat_rate_nature'] ?? null;
                if ($nature && in_array($nature, $exemptNatures)) {
                    $hasExemptOperation = true;
                }
                $netTotal += $rowSubtotal;
            } else {
                // Fallback: no VAT info
                $netTotal += $rowSubtotal;
            }
        }

        // Round to 2 decimal places (centesimi)
        $taxTotal = round($taxTotal, 2);
        $netTotal = round($netTotal, 2);

        // Calculate gross total
        if ($taxIncluded) {
            // Se i prezzi sono lordi, rowsTotal è già il lordo
            $grossTotal = $rowsTotal;
        } else {
            // Se i prezzi sono netti, aggiungiamo l'IVA
            $grossTotal = $netTotal + $taxTotal;
        }

        // Calculate stamp duty (Imposta di Bollo)
        $stampDutyApplied = false;
        $stampDutyAmountEuro = 0;

        $stampDutyChargeCustomer = \App\Models\TenantSetting::get('invoice.stamp_duty.charge_customer', true);
        $stampDutyThreshold = \App\Models\TenantSetting::get('invoice.stamp_duty.threshold', 77.47);
        $stampDutyAmountCents = \App\Models\TenantSetting::get('invoice.stamp_duty.amount', 200); // 200 centesimi dal setting

        // Apply stamp duty if:
        // 1. Total exceeds threshold (77.47€)
        // 2. There's at least one exempt/non-taxable operation (VAT = 0%)
        if ($grossTotal > $stampDutyThreshold && $hasExemptOperation) {
            $stampDutyApplied = true;
            $stampDutyAmountEuro = $stampDutyAmountCents / 100; // Converti in euro (2.00)
            $stampDutyAmountEuro = $stampDutyChargeCustomer ? $stampDutyAmountEuro : 0;
        }

        return [
            'subtotal' => $netTotal,
            'tax_total' => $taxTotal,
            'stamp_duty_applied' => $stampDutyApplied,
            'stamp_duty_amount' => $stampDutyAmountEuro,
            'total' => $grossTotal + $stampDutyAmountEuro,
        ];
    }

    /**
     * Store a new sale with all related data
     */
    public function store(array $validated): Sale
    {
        return DB::transaction(function () use ($validated) {
            // Estrai il valore numerico dal progressive_number
            // Es: "0004" → 4, "FAT0005" → 5
            $progressiveNumber = $validated['progressive_number'];
            preg_match('/\d+$/', $progressiveNumber, $matches);
            $progressiveValue = isset($matches[0]) ? (int) $matches[0] : 0;

            // Estrai eventuale prefix (lettere all'inizio)
            preg_match('/^([A-Z]*)/', $progressiveNumber, $prefixMatches);
            $progressivePrefix = $prefixMatches[1] ?: null;

            // Verifica duplicato
            $this->checkDuplicateSale($progressiveNumber, $validated['year']);

            // Prepare sale rows from raw data (passando il flag tax_included dalla vendita)
            $taxIncluded = $validated['tax_included'] ?? true;
            $preparedRows = $this->prepareSaleRows($validated['sale_rows'], $taxIncluded);

            // Calculate payment status
            $totalAmount = $this->calculateTotalAmount($preparedRows, $validated);
            $paymentStatus = $this->determinePaymentStatus($validated['payments'], $totalAmount);

            // NOTE: document_type_id dal frontend è in realtà document_type_electronic_invoice_id
            // Questo è un quick fix temporaneo. Vedi docs/SALES_DOCUMENT_TYPE_REFACTORING.md
            // per il refactoring completo pianificato.
            $documentTypeElectronicInvoiceId = $validated['document_type_id'];

            // Map electronic invoice code to document_type_id
            $documentTypeId = $this->mapElectronicInvoiceToDocumentType($documentTypeElectronicInvoiceId);

            // Create the sale con tutti i campi progressivo
            $sale = Sale::query()->create([
                'document_type_id' => $documentTypeId,
                'document_type_electronic_invoice_id' => $documentTypeElectronicInvoiceId,
                'progressive_number' => $progressiveNumber,
                'progressive_number_value' => $progressiveValue,
                'progressive_number_prefix' => $progressivePrefix,
                'date' => $validated['date'],
                'year' => $validated['year'],
                'customer_id' => $validated['customer_id'],
                'payment_condition_id' => $validated['payment_condition_id'],
                'financial_resource_id' => $validated['financial_resource_id'] ?? null,
                'promotion_id' => $validated['promotion_id'] ?? null,
                'discount_percentage' => $validated['discount_percentage'] ?? 0,
                'discount_absolute' => $validated['discount_absolute'] ?? 0,
                'status' => $validated['status'],
                'payment_status' => $paymentStatus,
                'accounting_status' => SaleAccountingStatusEnum::NOT_ACCOUNTED->value,
                'exported_status' => SaleExportedStatusEnum::NOT_EXPORTED->value,
                'currency' => 'EUR',
                'tax_included' => $validated['tax_included'] ?? true,  // Default: IVA inclusa (Italia)
                'notes' => $validated['notes'] ?? \App\Models\TenantSetting::get('invoice.default_notes'),
            ]);

            // Create sale rows
            $this->createSaleRows($sale, $preparedRows);

            // Refresh sale to load relationships for stamp duty calculation
            $sale->refresh();
            $sale->load('rows.vat_rate');

            // Calculate and apply stamp duty (imposta di bollo)
            $this->applyStampDuty($sale);

            // Create payments
            $this->createPayments($sale, $validated['payments']);

            // Recalculate payment status AFTER stamp duty is applied
            // This ensures the comparison uses the final total (with stamp duty)
            $sale->refresh();
            $finalTotal = $sale->sale_summary['final_total'] ?? $sale->sale_summary['gross_price'];

            $correctPaymentStatus = $this->determinePaymentStatusFromSale($sale, $finalTotal);

            if ($correctPaymentStatus !== $sale->payment_status) {
                $sale->update(['payment_status' => $correctPaymentStatus]);
            }

            return $sale;
        });
    }

    /**
     * Update an existing sale with all related data
     */
    public function update(Sale $sale, array $validated): Sale
    {
        return DB::transaction(function () use ($sale, $validated) {
            // Estrai il valore numerico dal progressive_number
            // Es: "0004" → 4, "FAT0005" → 5
            $progressiveNumber = $validated['progressive_number'];
            preg_match('/\d+$/', $progressiveNumber, $matches);
            $progressiveValue = isset($matches[0]) ? (int) $matches[0] : 0;

            // Estrai eventuale prefix (lettere all'inizio)
            preg_match('/^([A-Z]*)/', $progressiveNumber, $prefixMatches);
            $progressivePrefix = $prefixMatches[1] ?: null;

            // Verifica duplicato (escludi la vendita corrente)
            $existingSale = Sale::query()
                ->where('progressive_number', $progressiveNumber)
                ->where('year', $validated['year'])
                ->where('id', '!=', $sale->id)
                ->first();

            if ($existingSale) {
                throw new \Exception("Esiste già una vendita con progressivo {$progressiveNumber} nell'anno {$validated['year']}");
            }

            // Delete existing rows and payments
            $sale->rows()->delete();
            $sale->payments()->delete();

            // Prepare sale rows from raw data (passando il flag tax_included dalla vendita)
            $taxIncluded = $validated['tax_included'] ?? true;
            $preparedRows = $this->prepareSaleRows($validated['sale_rows'], $taxIncluded);

            // Calculate payment status
            $totalAmount = $this->calculateTotalAmount($preparedRows, $validated);
            $paymentStatus = $this->determinePaymentStatus($validated['payments'], $totalAmount);

            // NOTE: document_type_id dal frontend è in realtà document_type_electronic_invoice_id
            // Questo è un quick fix temporaneo. Vedi docs/SALES_DOCUMENT_TYPE_REFACTORING.md
            // per il refactoring completo pianificato.
            $documentTypeElectronicInvoiceId = $validated['document_type_id'];

            // Map electronic invoice code to document_type_id
            $documentTypeId = $this->mapElectronicInvoiceToDocumentType($documentTypeElectronicInvoiceId);

            // Update the sale with new data
            $sale->update([
                'document_type_id' => $documentTypeId,
                'document_type_electronic_invoice_id' => $documentTypeElectronicInvoiceId,
                'progressive_number' => $progressiveNumber,
                'progressive_number_value' => $progressiveValue,
                'progressive_number_prefix' => $progressivePrefix,
                'date' => $validated['date'],
                'year' => $validated['year'],
                'customer_id' => $validated['customer_id'],
                'payment_condition_id' => $validated['payment_condition_id'],
                'financial_resource_id' => $validated['financial_resource_id'] ?? null,
                'promotion_id' => $validated['promotion_id'] ?? null,
                'discount_percentage' => $validated['discount_percentage'] ?? 0,
                'discount_absolute' => $validated['discount_absolute'] ?? 0,
                'status' => $validated['status'],
                'payment_status' => $paymentStatus,
                'tax_included' => $validated['tax_included'] ?? true,
                'notes' => $validated['notes'] ?? null,
            ]);

            // Create sale rows
            $this->createSaleRows($sale, $preparedRows);

            // Refresh sale to load relationships for stamp duty calculation
            $sale->refresh();
            $sale->load('rows.vat_rate');

            // Calculate and apply stamp duty (imposta di bollo)
            $this->applyStampDuty($sale);

            // Create payments
            $this->createPayments($sale, $validated['payments']);

            // Recalculate payment status AFTER stamp duty is applied
            // This ensures the comparison uses the final total (with stamp duty)
            $sale->refresh();
            $finalTotal = $sale->sale_summary['final_total'] ?? $sale->sale_summary['gross_price'];

            $correctPaymentStatus = $this->determinePaymentStatusFromSale($sale, $finalTotal);

            if ($correctPaymentStatus !== $sale->payment_status) {
                $sale->update(['payment_status' => $correctPaymentStatus]);
            }

            return $sale;
        });
    }

    /**
     * Check if a sale with the same progressive number and year already exists
     * NOTA: Non più necessario perché il progressivo viene generato automaticamente
     * ma lo tengo per sicurezza
     */
    protected function checkDuplicateSale(string $progressiveNumber, int $year): void
    {
        $existingSale = Sale::query()
            ->where('progressive_number', $progressiveNumber)
            ->where('year', $year)
            ->first();

        if ($existingSale) {
            throw new \Exception('Una vendita con questo numero progressivo e anno esiste già.');
        }
    }

    /**
     * Prepare sale rows from validated data
     */
    protected function prepareSaleRows(array $saleRows, bool $taxIncluded = true): array
    {
        $preparedRows = [];

        foreach ($saleRows as $row) {
            $priceList = PriceList::with(['vat_rate'])->find($row['price_list_id']);

            if (! $priceList) {
                throw new \Exception('Listino non trovata.');
            }

            $selectedContent = $row['subscription_selected_content'] ?? null;

            // Handle subscription with selected content
            if ($selectedContent && ! empty($selectedContent)) {
                $preparedRows = array_merge(
                    $preparedRows,
                    $this->prepareSubscriptionRows($row, $priceList, $selectedContent, $taxIncluded)
                );
            } else {
                // Handle regular price list item
                $preparedRows[] = $this->prepareSingleRow($row, $priceList, $taxIncluded);
            }
        }

        return $preparedRows;
    }

    /**
     * Prepare subscription rows with content
     */
    protected function prepareSubscriptionRows(array $row, PriceList $priceList, array $selectedContent, bool $taxIncluded = true): array
    {
        $rows = [];
        $startDate = isset($row['start_date']) ? new Carbon($row['start_date']) : now();

        foreach ($selectedContent as $content) {
            $contentModel = SubscriptionContent::with(['price_listable', 'vat_rate'])->find($content['id']);

            if (! $contentModel) {
                continue;
            }

            $hasDuration = $contentModel->months_duration || $contentModel->days_duration;
            $endDate = $hasDuration
                ? $this->calculateExpirationDate(
                    $startDate->copy(),
                    $contentModel->months_duration,
                    $contentModel->days_duration
                )
                : null;

            // Calcolo prezzi con PriceCalculatorService (whitecube/php-prices)
            // NOTA IMPORTANTE:
            // - Il prezzo nel price_list è SEMPRE salvato come LORDO (IVA inclusa)
            // - Il parametro $taxIncluded indica se nella VENDITA i prezzi sono mostrati IVA inclusa
            // - Se $taxIncluded = true (default): scorporiamo l'IVA dal prezzo lordo per ottenere il netto
            // - Se $taxIncluded = false: il prezzo è già considerato netto, aggiungiamo l'IVA
            $unitPriceInput = $contentModel->price;
            // IMPORTANTE: Usa vat_rate del SubscriptionContent, NON del prodotto base!
            $vatRate = $contentModel->vat_rate;

            if ($taxIncluded && $vatRate) {
                // I prezzi nel price_list sono LORDI → scorporiamo l'IVA per ottenere il netto
                // IMPORTANTE: $unitPriceInput è in EURO (da MoneyCast), convertiamo in CENTESIMI
                $calculated = \App\Services\PriceCalculatorService::excludeVat(
                    grossAmountInCents: (int) round($unitPriceInput * 100),
                    vatPercentage: $vatRate->percentage,
                    quantity: $row['quantity'],
                    discountPercentage: $row['percentage_discount'] ?? null
                );

                $unitPriceNet = $calculated['unit_price_net'];      // EURO (float)
                $unitPriceGross = $calculated['unit_price_gross']; // EURO (float)
                $totalNet = $calculated['total_net'];              // EURO (float)
                $totalGross = $calculated['total_gross'];          // EURO (float)
                $vatAmount = $calculated['vat_amount'];            // EURO (float)

                $absoluteDiscount = ($row['percentage_discount'] ?? 0) > 0
                    ? \App\Services\PriceCalculatorService::calculateDiscountAmount(
                        (int) round($unitPriceInput * $row['quantity'] * 100),  // EURO → CENTESIMI
                        $row['percentage_discount']
                    )
                    : 0;
            } else {
                // Prezzo già netto - calcolo standard
                // IMPORTANTE: $unitPriceInput è in EURO (da MoneyCast), già float
                $unitPriceNet = $unitPriceInput;
                $unitPriceGross = $unitPriceNet;
                $subtotal = $unitPriceNet * $row['quantity'];
                $absoluteDiscount = ($row['percentage_discount'] ?? 0) > 0
                    ? \App\Services\PriceCalculatorService::calculateDiscountAmount(
                        (int) round($subtotal * 100),  // EURO → CENTESIMI
                        $row['percentage_discount']
                    )
                    : 0;
                $totalNet = $subtotal - $absoluteDiscount;
                $totalGross = $totalNet;

                // Calcola IVA se presente
                if ($vatRate) {
                    // IMPORTANTE: $totalNet è in EURO, convertiamo in CENTESIMI per il service
                    $calculated = \App\Services\PriceCalculatorService::includeVat(
                        netAmountInCents: (int) round($totalNet * 100),
                        vatPercentage: $vatRate->percentage,
                        quantity: 1
                    );
                    $vatAmount = $calculated['vat_amount'];        // EURO (float)
                    $totalGross = $calculated['total_gross'];      // EURO (float)
                    $unitPriceGross = round($totalGross / $row['quantity'], 2);  // EURO (float)
                } else {
                    $vatAmount = 0;
                }
            }

            $description = $contentModel->price_listable->selling_description ?? $contentModel->price_listable->name;
            $description .= ' - '.$priceList->name;

            if ($hasDuration && $endDate) {
                $description .= ' (dal '.$startDate->format('d/m/Y').' al '.$endDate->format('d/m/Y').')';
            }

            $rows[] = [
                'price_list_id' => $row['price_list_id'],
                'entitable_type' => SubscriptionContent::class,
                'entitable_id' => $contentModel->id,
                'description' => $description,
                'quantity' => $row['quantity'],
                'unit_price_net' => $unitPriceNet,
                'unit_price_gross' => $unitPriceGross,
                'percentage_discount' => $row['percentage_discount'] ?? 0,
                'absolute_discount' => $absoluteDiscount,
                'vat_rate_id' => $contentModel->vat_rate_id,
                'vat_amount' => $vatAmount ?? 0,
                'total_net' => $totalNet,
                'total_gross' => $totalGross,
                'start_date' => $hasDuration ? $startDate : null,
                'end_date' => $endDate,
            ];
        }

        return $rows;
    }

    /**
     * Prepare a single sale row
     * IMPORTANTE:
     * - Il prezzo nel price_list è SEMPRE salvato come LORDO (IVA inclusa)
     * - Il parametro $taxIncluded indica se nella VENDITA i prezzi sono mostrati IVA inclusa
     * - Se $taxIncluded = true (default): scorporiamo l'IVA dal prezzo lordo per ottenere il netto
     * - Se $taxIncluded = false: il prezzo è già considerato netto, aggiungiamo l'IVA
     */
    protected function prepareSingleRow(array $row, PriceList $priceList, bool $taxIncluded = true): array
    {
        $vatRate = $priceList->vat_rate;

        // Calcolo prezzi con PriceCalculatorService (whitecube/php-prices)
        if ($taxIncluded && $vatRate) {
            // I prezzi nel price_list sono LORDI → scorporiamo l'IVA per ottenere il netto
            // IMPORTANTE: $row['unit_price'] arriva dal frontend in EURO, convertiamo in CENTESIMI
            $calculated = \App\Services\PriceCalculatorService::excludeVat(
                grossAmountInCents: (int) round($row['unit_price'] * 100),
                vatPercentage: $vatRate->percentage,
                quantity: $row['quantity'],
                discountPercentage: $row['percentage_discount'] ?? null
            );

            $unitPriceNet = $calculated['unit_price_net'];      // EURO (float)
            $unitPriceGross = $calculated['unit_price_gross']; // EURO (float)
            $totalNet = $calculated['total_net'];              // EURO (float)
            $totalGross = $calculated['total_gross'];          // EURO (float)
            $vatAmount = $calculated['vat_amount'];            // EURO (float)

            $absoluteDiscount = ($row['percentage_discount'] ?? 0) > 0
                ? \App\Services\PriceCalculatorService::calculateDiscountAmount(
                    $row['unit_price'] * $row['quantity'],
                    $row['percentage_discount']
                )
                : 0;
        } else {
            // Prezzo già netto - calcolo standard
            $unitPriceNet = round($row['unit_price'], 2);
            $unitPriceGross = $unitPriceNet;
            $subtotal = $unitPriceNet * $row['quantity'];
            $absoluteDiscount = ($row['percentage_discount'] ?? 0) > 0
                ? \App\Services\PriceCalculatorService::calculateDiscountAmount($subtotal, $row['percentage_discount'])
                : 0;
            $totalNet = $subtotal - $absoluteDiscount;
            $totalGross = $totalNet;

            // Calcola IVA se presente
            if ($vatRate) {
                // IMPORTANTE: $totalNet è in EURO, convertiamo in CENTESIMI per il service
                $calculated = \App\Services\PriceCalculatorService::includeVat(
                    netAmountInCents: (int) round($totalNet * 100),
                    vatPercentage: $vatRate->percentage,
                    quantity: 1
                );
                $vatAmount = $calculated['vat_amount'];        // EURO (float)
                $totalGross = $calculated['total_gross'];      // EURO (float)
                $unitPriceGross = round($totalGross / $row['quantity'], 2);  // EURO (float)
            } else {
                $vatAmount = 0;
            }
        }

        $hasDuration = $priceList->type === \App\Enums\PriceListItemTypeEnum::MEMBERSHIP->value;

        $description = $priceList->name;
        $startDate = null;
        $endDate = null;

        if ($hasDuration) {
            $startDate = isset($row['start_date']) ? new Carbon($row['start_date']) : now();
            $endDate = $this->calculateExpirationDate(
                $startDate->copy(),
                $priceList->months_duration ?? 0,
                $priceList->days_duration ?? 0
            );
            $description .= ' (dal '.$startDate->format('d/m/Y').' al '.$endDate->format('d/m/Y').')';
        }

        return [
            'price_list_id' => $row['price_list_id'],
            'entitable_type' => $priceList->getMorphClass(),
            'entitable_id' => $priceList->id,
            'description' => $description,
            'quantity' => $row['quantity'],
            'unit_price_net' => $unitPriceNet,
            'unit_price_gross' => $unitPriceGross,
            'percentage_discount' => $row['percentage_discount'] ?? 0,
            'absolute_discount' => $absoluteDiscount,
            'vat_rate_id' => $priceList->vat_rate->id ?? null,
            'vat_amount' => $vatAmount ?? 0,
            'total_net' => $totalNet,
            'total_gross' => $totalGross,
            'start_date' => $startDate,
            'end_date' => $endDate,
        ];
    }

    /**
     * Calculate total amount including discounts
     * IMPORTANTE: Calcola sul LORDO (con IVA) per i pagamenti
     */
    protected function calculateTotalAmount(array $preparedRows, array $validated): float
    {
        // Calcola totale NETTO
        $totalNet = 0;
        foreach ($preparedRows as $row) {
            $totalNet += $row['total_net'];
        }

        // Calcola IVA totale usando vat_amount già calcolato nelle righe preparate
        $totalVat = 0;
        foreach ($preparedRows as $row) {
            $totalVat += $row['vat_amount'] ?? 0;
        }

        // Totale LORDO = Netto + IVA
        $totalGross = round($totalNet + $totalVat, 2);

        // Apply sale-level discounts sul lordo
        $discountAmount = round(($validated['discount_percentage'] ?? 0) / 100 * $totalGross, 2);
        $discountAmount += ($validated['discount_absolute'] ?? 0);

        $finalTotal = max(0, round($totalGross - $discountAmount, 2));

        // NOTA: NON aggiungiamo stamp duty qui!
        // Lo stamp duty viene calcolato e applicato DOPO tramite applyStampDuty()
        // che aggiorna direttamente il record Sale

        return $finalTotal;
    }

    /**
     * Determine payment status based on payments and total amount
     */
    protected function determinePaymentStatus(array $payments, float $totalAmount): string
    {
        $totalPaid = 0;

        foreach ($payments as $payment) {
            if (isset($payment['payed_at']) && $payment['payed_at']) {
                $totalPaid += $payment['amount'];
            }
        }

        if ($totalPaid === 0) {
            return SalePaymentStatusEnum::NOT_PAIED->value;
        }

        // Tolleriamo una differenza di 0.01€ per arrotondamenti
        if ($totalPaid < ($totalAmount - 0.01)) {
            return SalePaymentStatusEnum::PARTIAL->value;
        }

        // Se pagato più del dovuto (con tolleranza), consideriamo overpaid
        if ($totalPaid > ($totalAmount + 0.01)) {
            return SalePaymentStatusEnum::OVERPAID->value;
        }

        return SalePaymentStatusEnum::PAID->value;
    }

    /**
     * Determine payment status from existing Sale model
     * Uses actual payments from DB and final total (including stamp duty)
     */
    protected function determinePaymentStatusFromSale(Sale $sale, float $finalTotal): string
    {
        // IMPORTANTE: sum('amount') restituisce centesimi dal DB, dobbiamo convertire in euro
        $totalPaidCents = $sale->payments()
            ->whereNotNull('payed_at')
            ->sum('amount');

        $totalPaid = $totalPaidCents / 100; // Converti da centesimi a euro

        if ($totalPaid === 0) {
            return SalePaymentStatusEnum::NOT_PAIED->value;
        }

        // Tolleriamo una differenza di 0.01€ per arrotondamenti
        if ($totalPaid < ($finalTotal - 0.01)) {
            return SalePaymentStatusEnum::PARTIAL->value;
        }

        // Se pagato più del dovuto (con tolleranza), consideriamo overpaid
        if ($totalPaid > ($finalTotal + 0.01)) {
            return SalePaymentStatusEnum::OVERPAID->value;
        }

        return SalePaymentStatusEnum::PAID->value;
    }

    /**
     * Create sale rows
     */
    protected function createSaleRows(Sale $sale, array $preparedRows): void
    {
        foreach ($preparedRows as $row) {
            $sale->rows()->create($row);
        }
    }

    /**
     * Create payments
     */
    protected function createPayments(Sale $sale, array $payments): void
    {
        foreach ($payments as $payment) {
            $sale->payments()->create([
                'due_date' => $payment['due_date'],
                'amount' => $payment['amount'],
                'payment_method_id' => $payment['payment_method_id'],
                'payed_at' => $payment['payed_at'] ?? null,
            ]);
        }
    }

    /**
     * Calculate and apply stamp duty (imposta di bollo) if applicable
     *
     * Regole AdE:
     * - Si applica se totale > 77,47€
     * - E almeno una riga ha Nature: N2.1, N2.2, N3.5, N3.6, N4 (non soggette/non imponibili/esenti IVA)
     * - Importo fisso: 2€
     */
    public function applyStampDuty(Sale $sale): void
    {
        // Get settings
        $threshold = \App\Models\TenantSetting::get('invoice.stamp_duty.threshold', 77.47);
        $stampAmountCents = \App\Models\TenantSetting::get('invoice.stamp_duty.amount', 200); // centesimi dal setting (RAW)
        $stampAmountEuro = $stampAmountCents / 100; // Converti in euro per salvare nel DB (MoneyCast farà poi la conversione in centesimi)

        // Calculate sale total (gross price)
        $saleSummary = $sale->sale_summary;
        $grossTotal = $saleSummary['gross_price'] ?? 0;

        // Check if total exceeds threshold
        if ($grossTotal <= $threshold) {
            $sale->update([
                'stamp_duty_applied' => false,
                'stamp_duty_amount' => 0,
            ]);

            return;
        }

        // Check if any row has exempt/non-taxable nature codes
        $exemptNatures = ['N2.1', 'N2.2', 'N3.5', 'N3.6', 'N4'];
        $hasExemptOperation = $sale->rows()
            ->whereHas('vat_rate', function ($query) use ($exemptNatures) {
                $query->whereIn('nature', $exemptNatures);
            })
            ->exists();

        if (! $hasExemptOperation) {
            $sale->update([
                'stamp_duty_applied' => false,
                'stamp_duty_amount' => 0,
            ]);

            return;
        }

        // Apply stamp duty
        $sale->update([
            'stamp_duty_applied' => true,
            'stamp_duty_amount' => $stampAmountEuro, // in euro, MoneyCast lo convertirà in centesimi nel DB
        ]);
    }

    /**
     * Map document_type_electronic_invoice_id to document_type_id
     * Based on TD code mapping to document types
     */
    private function mapElectronicInvoiceToDocumentType(?int $documentTypeElectronicInvoiceId): ?int
    {
        if (! $documentTypeElectronicInvoiceId) {
            return null;
        }

        $electronicInvoice = DocumentTypeElectronicInvoice::find($documentTypeElectronicInvoiceId);

        if (! $electronicInvoice) {
            return null;
        }

        // Mapping TD codes to document_types
        return match ($electronicInvoice->code) {
            'TD01' => 1, // Fattura
            'TD02', 'TD03' => 6, // Fattura d'acconto
            'TD04' => 4, // Nota di credito
            'TD05' => 5, // Nota di debito
            'TD06' => 7, // Ricevuta fiscale
            'TD21' => 9, // Autofattura per splafonamento
            'TD24', 'TD25' => 2, // Fattura differita
            default => 1, // Default: Fattura
        };
    }
}
