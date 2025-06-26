<?php

namespace App\Http\Controllers\App\Sales;

use App\Enums\SaleAccountingStatusEnum;
use App\Enums\SaleExportedStatusEnum;
use App\Enums\SalePaymentStatusEnum;
use App\Http\Controllers\Controller;
use App\Models\PriceList\SubscriptionContent;
use App\Models\Sale\Sale;
use App\Services\Sale\SaleService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SaleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * CustomerShow the form for creating a new resource.
     */
    public function create(Request $request, SaleService $saleService)
    {
        $props = $saleService->create($request->get('customer_id'));

        return Inertia::render('sales/sales', [
            ...$props,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'document_type_id' => 'required|exists:document_types,id',
            'progressive_number' => 'required|string|max:4',
            'date' => 'required|date',
            'year' => 'required|integer',
            'customer_id' => 'required|exists:customers,id',
            'payment_condition_id' => 'required|exists:payment_conditions,id',
            'financial_resource_id' => 'nullable|exists:financial_resources,id',
            'promotion_id' => 'nullable|exists:promotions,id',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'discount_absolute' => 'nullable|numeric|min:0',
            'status' => 'required|in:draft,completed,cancelled',
            'notes' => 'nullable|string|max:500',

            'sale_rows' => 'required|array',
            'sale_rows.*.price_list_id' => 'required|exists:price_lists,id',
            'sale_rows.*.quantity' => 'required|numeric|min:1',
            'sale_rows.*.unit_price' => 'required|numeric|min:0',
            'sale_rows.*.percentage_discount' => 'nullable|numeric|min:0|max:100',
            'sale_rows.*.absolute_discount' => 'nullable|numeric|min:0',
            'sale_rows.*.start_date' => 'nullable|date',

            'sale_rows.*.subscription_selected_content' => 'nullable|array',

            'payments' => 'required|array',
            'payments.*.due_date' => 'required|date',
            'payments.*.amount' => 'required|numeric|min:0',
            'payments.*.payment_method_id' => 'required|exists:payment_methods,id',
            'payments.*.payed_at' => 'nullable|date',
            // Add other validation rules as necessary
        ]);

        //dd($validated);

        $totalAmount = 0;

        foreach ($validated['sale_rows'] as $row) {
            $totalAmount += ($row['unit_price'] * $row['quantity']) - ($row['unit_price'] * $row['quantity'] * ($row['percentage_discount'] ?? 0) / 100) - ($row['absolute_discount'] ?? 0);
        }
        // Calculate sale discounts
        $discountAmount = ($validated['discount_percentage'] ?? 0) / 100 * $totalAmount + ($validated['discount_absolute'] ?? 0);
        $totalAmount -= $discountAmount;

        $totalPayed = 0;
        foreach ($validated['payments'] as $payment) {
            $totalPayed += $payment['amount'];
        }

        $paymentStatus = SalePaymentStatusEnum::NOT_PAIED->value;
        switch (true) {
            case $totalPayed < $totalAmount:
                $paymentStatus = SalePaymentStatusEnum::PARTIAL->value;
                break;
            case $totalPayed === $totalAmount:
                $paymentStatus = SalePaymentStatusEnum::PAID->value;
                break;
        }

        //dd($validated['sale_rows']);

        $rows = [];

        collect($validated['sale_rows'])->map(function ($row) use (&$rows) {
            $selectedContent = $row['subscription_selected_content'] ?? null;
            $priceList = \App\Models\PriceList\PriceList::find($row['price_list_id']);

            if ($selectedContent) {
                if (!$priceList) {
                    throw new \Exception('Price list not found for the selected content.');
                }

                // ??????????????????????????????
                $startDate = null;
                if ($priceList instanceof \App\Models\PriceList\Subscription) {
                    $startDate = Carbon::parse($priceList->start_date);
                }

                $innerRows = collect($selectedContent)->map(function ($content) use ($row, $startDate, $priceList) {
                    $absoluteDiscount = ($content['price'] * $row['quantity'] * ($row['percentage_discount'] ?? 0) / 100) ?? 0;
                    $hasDuration = $content['months_duration'] || $content['days_duration'];
                    $endDate = $hasDuration
                        ? Carbon::parse($startDate)
                            ->addMonths($content['months_duration'] ?? 0)
                            ->addDays($content['days_duration'] ?? 0)
                        : null;

                    $data = [
                        'price_list_id' => $row['price_list_id'],
                        'entitable_type' => SubscriptionContent::class,
                        'entitable_id' => $content['id'],
                        'description' => $content['price_listable']['selling_description'] . ' - ' . $priceList->name . ($startDate ? ' (dal ' . $startDate->format('d/m/Y') . ($endDate ? ' al ' . $endDate->format('d/m/Y') : '') . ')' : ''),
                        'quantity' => $row['quantity'],
                        'unit_price' => $content['price'],
                        'percentage_discount' => $row['percentage_discount'] ?? 0,
                        // Calcola lo sconto assoluto dallo sconto percentuale
                        'absolute_discount' => ($content['price'] * $row['quantity'] * ($row['percentage_discount'] ?? 0) / 100) ?? 0,
                        'vat_rate_id' => $content['price_listable']['vat_rate_id'] ?? null,
                        'total' => $content['price'] * $row['quantity'] - $absoluteDiscount,
                    ];

                    if ($hasDuration) {
                        $data['start_date'] = Carbon::parse($startDate) ?? null;
                        $data['end_date'] = $endDate;
                    }

                    return $data;
                });

                $rows = [
                    ...$rows,
                    ...$innerRows->toArray(),
                ];

                return;
            }

            $priceList = \App\Models\PriceList\PriceList::with(['vat_rate'])->find($row['price_list_id']);
            $absoluteDiscount = ($row['unit_price'] * $row['quantity'] * ($row['percentage_discount'] ?? 0) / 100) ?? 0;
            $hasDuration = $priceList->type === \App\Enums\PriceListItemTypeEnum::MEMBERSHIP->value;;

            $data = [
                'price_list_id' => $row['price_list_id'],
                'entitable_type' => $priceList->getMorphClass(),
                'entitable_id' => $priceList->id,
                'description' => $priceList->name,
                'quantity' => $row['quantity'],
                'unit_price' => $row['unit_price'],
                'percentage_discount' => $row['percentage_discount'] ?? 0,
                // Calcola lo sconto assoluto dallo sconto percentuale
                'absolute_discount' => ($row['unit_price'] * $row['quantity'] * ($row['percentage_discount'] ?? 0) / 100) ?? 0,
                'vat_rate_id' => $priceList->vat_rate->id ?? null,
                'total' => $row['unit_price'] * $row['quantity'] - $absoluteDiscount,
            ];

            if ($hasDuration) {
                $startDate = Carbon::parse($row['start_date'] ?? now());
                $endDate = $startDate->copy()->addMonths($priceList->months_duration ?? 0)
                    ->addDays($priceList->days_duration ?? 0);
                $data['start_date'] = $startDate;
                $data['end_date'] = $endDate;
                $data['description'] .= ' (dal ' . $startDate->format('d/m/Y') . ' al ' . $endDate->format('d/m/Y') . ')';
            }

            $rows[] = $data;
        })->toArray();

        //dd($rows);

        $sale = DB::transaction(function () use ($validated, $paymentStatus, $rows) {
            // Check if the sale already exists
            $existingSale = Sale::query()
                ->where('progressive_number', $validated['progressive_number'])
                ->where('year', $validated['year'])
                ->first();

            if ($existingSale) {
                throw new \Exception('A sale with this progressive number and year already exists.');
            }

            $sale = Sale::query()->create([
                'document_type_id' => $validated['document_type_id'],
                'progressive_number' => $validated['progressive_number'],
                'date' => $validated['date'],
                'year' => $validated['year'],
                'customer_id' => $validated['customer_id'],
                'payment_condition_id' => $validated['payment_condition_id'],
                'financial_resource_id' => $validated['financial_resource_id'],
                //'promotion_id' => $validated['promotion_id'],
                'discount_percentage' => $validated['discount_percentage'],
                'discount_absolute' => $validated['discount_absolute'],
                'status' => $validated['status'],
                'payment_status' => $paymentStatus, // Assuming default payment status
                'accounting_status' => SaleAccountingStatusEnum::NOT_ACCOUNTED->value, // Assuming default payment status
                'exported_status' => SaleExportedStatusEnum::NOT_EXPORTED->value, // Assuming default payment status
                'currency' => 'EUR', // Assuming EUR as default currency
            ]);

            // Attach sale rows
            foreach ($rows as $row) {
                $sale->rows()->create([
                    'price_list_id' => $row['price_list_id'],
                    'entitable_type' => $row['entitable_type'],
                    'entitable_id' => $row['entitable_id'],
                    'description' => $row['description'] ?? null,
                    'quantity' => $row['quantity'],
                    'unit_price' => $row['unit_price'],
                    'percentage_discount' => $row['percentage_discount'] ?? 0,
                    'absolute_discount' => $row['absolute_discount'] ?? 0,
                    'vat_rate_id' => $row['vat_rate_id'] ?? null,
                    'total' => $row['total'],
                    'start_date' => $row['start_date'] ?? null,
                    'end_date' => $row['end_date'] ?? null,
                ]);
            }

            // Attach payments
            foreach ($validated['payments'] as $payment) {
                $sale->payments()->create([
                    'due_date' => $payment['due_date'],
                    'amount' => $payment['amount'],
                    'payment_method_id' => $payment['payment_method_id'],
                    'payed_at' => $payment['payed_at'] ?? null,
                ]);
            }

            return $sale;
        });

        return redirect()->route('app.sales.show', ['sale' => $sale->id])
            ->with('status', 'Sale created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Sale $sale)
    {
        $sale->load([
            'customer',
            'payment_condition',
            'financial_resource',
            'promotion',
            'rows.vat_rate',
            'payments.payment_method',
        ]);

        $sale->customer->append(['full_name', 'option_label']);

        return inertia()->render('sales/sale-show', [
            'sale' => $sale,
        ]);
    }

    /**
     * CustomerShow the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
