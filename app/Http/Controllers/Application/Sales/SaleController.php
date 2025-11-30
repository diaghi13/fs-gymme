<?php

namespace App\Http\Controllers\Application\Sales;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sales\StoreSaleRequest;
use App\Models\Sale\Sale;
use App\Services\Sale\SaleService;
use App\Services\Sale\SdiErrorParserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = Sale::with([
            'customer',
            'payment_condition',
            'electronic_invoice',
            'rows.vat_rate',
            'payments',
        ])
            ->orderBy('date', 'desc')
            ->orderBy('progressive_number_value', 'desc');

        // Filter by search (progressive number or customer name)
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('progressive_number', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($q) use ($search) {
                        $q->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('company_name', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Filter by payment status
        if ($paymentStatus = $request->input('payment_status')) {
            $query->where('payment_status', $paymentStatus);
        }

        // Filter by electronic invoice status
        if ($electronicInvoiceStatus = $request->input('electronic_invoice_status')) {
            $query->where('electronic_invoice_status', $electronicInvoiceStatus);
        }

        // Filter by date range
        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('date', '>=', $dateFrom);
        }
        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('date', '<=', $dateTo);
        }

        $sales = $query->paginate(25)
            ->withQueryString()
            ->through(fn ($sale) => [
                'id' => $sale->id,
                'progressive_number' => $sale->progressive_number,
                'date' => $sale->date->format('Y-m-d'),
                'type' => $sale->type,
                'customer' => [
                    'id' => $sale->customer->id,
                    'full_name' => $sale->customer->full_name ?? $sale->customer->company_name,
                ],
                'payment_condition' => $sale->payment_condition?->description,
                'status' => $sale->status,
                'payment_status' => $sale->payment_status,
                'electronic_invoice_status' => $sale->electronic_invoice_status,
                'electronic_invoice' => $sale->electronic_invoice ? [
                    'sdi_status' => $sale->electronic_invoice->sdi_status,
                    'transmission_id' => $sale->electronic_invoice->transmission_id,
                    'send_attempts' => $sale->electronic_invoice->send_attempts,
                    'xml_generated' => $sale->electronic_invoice->xml_content !== null,
                    'error_message' => $sale->electronic_invoice->sdi_error_messages,
                    'last_send_attempt_at' => $sale->electronic_invoice->last_send_attempt_at?->format('d/m/Y H:i'),
                ] : null,
                'gross_total' => $sale->sale_summary['final_total'] ?? 0,  // Use final_total which includes stamp duty
                'net_total' => $sale->sale_summary['net_price'] ?? 0,
                'total_tax' => $sale->sale_summary['total_tax'] ?? 0,
                'stamp_duty_amount' => $sale->sale_summary['stamp_duty_amount'] ?? 0,
            ]);

        // Calculate stats - optimized queries
        // Total amount: sum of (total_net + vat_amount) for all sale_rows PLUS stamp duty when charged to customer
        $totalAmountCents = \DB::table('sale_rows')
            ->whereNull('deleted_at')
            ->selectRaw('SUM(total_net + vat_amount) as total')
            ->value('total') ?? 0;

        // Add stamp duty for all sales where it's applied and charged to customer
        $chargeStampToCustomer = \App\Models\TenantSetting::get('invoice.stamp_duty.charge_customer', true);
        if ($chargeStampToCustomer) {
            $stampDutyTotalCents = \DB::table('sales')
                ->whereNull('deleted_at')
                ->where('stamp_duty_applied', true)
                ->sum('stamp_duty_amount') ?? 0;
            $totalAmountCents += $stampDutyTotalCents;
        }

        $totalAmount = $totalAmountCents / 100; // Convert from cents to euros

        $paidCount = Sale::where('payment_status', 'paid')->count();
        $unpaidCount = Sale::where('payment_status', 'not_paid')->count();

        return Inertia::render('sales/sale-index', [
            'sales' => $sales,
            'filters' => $request->only(['search', 'status', 'payment_status', 'electronic_invoice_status', 'date_from', 'date_to']),
            'stats' => [
                'total_amount' => $totalAmount,
                'paid_count' => $paidCount,
                'unpaid_count' => $unpaidCount,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request, SaleService $saleService): Response
    {
        $props = $saleService->create($request->get('customer_id'));

        return Inertia::render('sales/sale-create', $props);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSaleRequest $request, SaleService $saleService): RedirectResponse
    {
        $sale = $saleService->store($request->validated());

        return to_route('app.sales.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'sale' => $sale->id,
        ])->with('status', 'Vendita creata con successo.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Sale $sale, SdiErrorParserService $errorParser): Response
    {
        $sale->load([
            'customer',
            'payment_condition',
            'financial_resource',
            'promotion',
            'rows.vat_rate',
            'rows.price_list',
            'rows.entity',
            'payments.payment_method',
            'electronic_invoice',
            'original_sale',
        ]);

        // Load send attempts separately to customize the key name
        if ($sale->electronic_invoice) {
            $sale->electronic_invoice->load(['sendAttempts.user']);
            $sale->electronic_invoice->send_attempts_list = $sale->electronic_invoice->sendAttempts;
        }

        $sale->append(['sale_summary']);
        $sale->customer->append(['full_name', 'option_label']);

        // Parse SDI errors se presenti
        $parsedErrors = null;
        if ($sale->electronic_invoice && $sale->electronic_invoice->sdi_error_messages) {
            $parsedErrors = $errorParser->parseErrors($sale->electronic_invoice->sdi_error_messages)->toArray();
        }

        return Inertia::render('sales/sale-show', [
            'sale' => $sale,
            'parsedSdiErrors' => $parsedErrors,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Sale $sale, SaleService $saleService): Response
    {
        // Load all relationships needed for editing
        $sale->load([
            'customer',
            'rows.vat_rate',
            'document_type_electronic_invoice',
            'payment_condition',
            'financial_resource',
            'promotion',
            'payments.payment_method',
            'structure',
        ]);

        // Get initial data (customers, payment conditions, etc.)
        $props = $saleService->create($sale->customer_id);

        // Override sale with existing data
        $props['sale'] = $sale;

        // Format sale rows for the form
        $props['sale']['sale_rows'] = $sale->rows->map(function ($row) {
            return [
                'id' => $row->id,
                'price_list_id' => $row->price_list_id,
                'description' => $row->description,
                'quantity' => $row->quantity,
                'unit_price' => $row->unit_price_gross,
                'percentage_discount' => $row->percentage_discount,
                'absolute_discount' => $row->absolute_discount,
                'vat_rate_id' => $row->vat_rate_id,
                'total_price' => $row->total_gross,
                'start_date' => $row->start_date,
                'end_date' => $row->end_date,
            ];
        })->toArray();

        // Format payments for the form
        $props['sale']['payments'] = $sale->payments->map(function ($payment) {
            return [
                'due_date' => $payment->due_date,
                'amount' => $payment->amount,
                'payment_method' => $payment->payment_method,
                'payed_at' => $payment->payed_at,
            ];
        })->toArray();

        return Inertia::render('sales/sale-create', $props);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreSaleRequest $request, Sale $sale, SaleService $saleService): RedirectResponse
    {
        // Update the sale using the service (includes stamp duty recalculation)
        $updatedSale = $saleService->update($sale, $request->validated());

        return to_route('app.sales.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'sale' => $updatedSale->id,
        ])->with('status', 'Vendita aggiornata con successo.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Quick calculate totals for UI display (real-time calculation)
     */
    public function quickCalculate(Request $request, SaleService $saleService)
    {
        $data = $request->validate([
            'rows' => 'required|array',
            'rows.*.unit_price' => 'required|numeric|min:0',
            'rows.*.quantity' => 'required|numeric|min:0',
            'rows.*.percentage_discount' => 'nullable|numeric|min:0|max:100',
            'rows.*.absolute_discount' => 'nullable|numeric|min:0',
            'rows.*.vat_rate_percentage' => ['nullable', 'numeric_or_array'],
            'rows.*.vat_rate_name' => ['nullable', 'string'],
            'rows.*.vat_breakdown' => ['nullable', 'array'],
            'rows.*.vat_breakdown.*.subtotal' => ['required_with:rows.*.vat_breakdown', 'numeric'],
            'rows.*.vat_breakdown.*.vat_rate' => ['required_with:rows.*.vat_breakdown', 'numeric'],
            'rows.*.vat_breakdown.*.vat_nature' => ['nullable', 'string'],
            'sale_percentage_discount' => 'nullable|numeric|min:0|max:100',
            'sale_absolute_discount' => 'nullable|numeric|min:0',
            'tax_included' => 'required|boolean',
        ]);

        return response()->json($saleService->quickCalculate($data));
    }

    /**
     * Calculate installments for flexible payments
     */
    public function calculateInstallments(Request $request, SaleService $saleService)
    {
        $data = $request->validate([
            'total_amount' => 'required|integer|min:1',
            'installments_count' => 'required|integer|min:1|max:12',
            'first_due_date' => 'required|date',
            'days_between_installments' => 'nullable|integer|min:1',
        ]);

        $installments = $saleService->calculateInstallments(
            $data['total_amount'],
            $data['installments_count'],
            new \Carbon\Carbon($data['first_due_date']),
            $data['days_between_installments'] ?? 30
        );

        return response()->json(['installments' => $installments]);
    }

    /**
     * Get subscription contents (standard + selected optional)
     */
    public function getSubscriptionContents(Request $request, SaleService $saleService)
    {
        $data = $request->validate([
            'subscription_id' => 'required|exists:price_lists,id',
            'selected_optional_ids' => 'nullable|array',
            'selected_optional_ids.*' => 'exists:subscription_contents,id',
        ]);

        $subscription = \App\Models\PriceList\Subscription::findOrFail($data['subscription_id']);
        $contents = $saleService->getSubscriptionContents(
            $subscription,
            $data['selected_optional_ids'] ?? []
        );

        return response()->json(['contents' => $contents]);
    }
}
