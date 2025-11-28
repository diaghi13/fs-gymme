<?php

namespace App\Http\Controllers\Application\Sales;

use App\Http\Controllers\Controller;
use App\Models\Customer\CustomerSubscription;
use App\Models\Customer\MembershipFee;
use App\Services\Sale\SaleService;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class RenewalController extends Controller
{
    /**
     * Prepare a membership fee renewal
     * Creates a new sale with the same product and suggested dates
     */
    public function renewMembershipFee(MembershipFee $membershipFee, SaleService $saleService): Response
    {
        // Get the sale row to retrieve the original product
        $saleRow = $membershipFee->saleRow()->with(['price_list', 'vat_rate'])->first();

        if (! $saleRow || ! $saleRow->price_list) {
            abort(404, 'Prodotto originale non trovato');
        }

        // Calculate suggested dates
        $today = Carbon::today();
        $currentEndDate = Carbon::parse($membershipFee->end_date);

        // If membership is still active, start from day after expiry
        // If expired, start from today
        $suggestedStartDate = $currentEndDate->isFuture()
            ? $currentEndDate->copy()->addDay()
            : $today;

        // Calculate end date based on product duration
        $priceList = $saleRow->price_list;
        $suggestedEndDate = $saleService->calculateExpirationDate(
            $suggestedStartDate->copy(),
            $priceList->months_duration ?? 0,
            $priceList->days_duration ?? 0
        );

        // Get initial data for sale creation
        $props = $saleService->create($membershipFee->customer_id);

        // Pre-fill the sale with renewal data
        $props['renewal_type'] = 'membership_fee';
        $props['renewal_source_id'] = $membershipFee->id;
        $props['sale']['sale_rows'] = [[
            'price_list' => $priceList, // Pass the full object
            'quantity' => 1,
            'unit_price' => $priceList->price,
            'percentage_discount' => 0,
            'absolute_discount' => 0,
            'total' => $priceList->price, // Total before discounts
            'start_date' => $suggestedStartDate->format('Y-m-d'),
            'end_date' => $suggestedEndDate->format('Y-m-d'),
        ]];

        return Inertia::render('sales/sale-create', $props);
    }

    /**
     * Prepare a subscription renewal
     * Creates a new sale with the same subscription and suggested dates
     */
    public function renewSubscription(CustomerSubscription $subscription, SaleService $saleService): Response
    {
        // Get the sale row to retrieve the original subscription
        $saleRow = $subscription->sale_row()->with(['price_list', 'vat_rate', 'sale'])->first();

        if (! $saleRow || ! $saleRow->price_list) {
            abort(404, 'Abbonamento originale non trovato');
        }

        $priceList = $saleRow->price_list;

        // Load the subscription with all its content
        $priceList->load(['standard_content.price_listable.vat_rate', 'optional_content.price_listable.vat_rate']);

        // Get all sale rows from the original sale with the same price_list_id
        // These represent the selected content (standard + optional)
        $originalSaleRows = \App\Models\Sale\SaleRow::where('sale_id', $saleRow->sale_id)
            ->where('price_list_id', $priceList->id)
            ->with(['entity', 'vat_rate'])
            ->get();

        // Extract the selected content IDs
        $selectedContentIds = $originalSaleRows
            ->filter(fn ($row) => $row->entitable_type === \App\Models\PriceList\SubscriptionContent::class)
            ->pluck('entitable_id')
            ->toArray();

        // Get the full SubscriptionContent objects for the selected IDs
        $selectedContent = \App\Models\PriceList\SubscriptionContent::whereIn('id', $selectedContentIds)
            ->with(['price_listable.vat_rate', 'vat_rate'])
            ->get();

        // Calculate total price from selected content
        $totalPrice = $selectedContent->sum('price');

        // Calculate suggested dates
        $today = Carbon::today();
        $currentEndDate = $subscription->effective_end_date
            ? Carbon::parse($subscription->effective_end_date)
            : ($subscription->end_date ? Carbon::parse($subscription->end_date) : null);

        // If subscription is still active, start from day after expiry
        // If expired or no end date, start from today
        $suggestedStartDate = $currentEndDate && $currentEndDate->isFuture()
            ? $currentEndDate->copy()->addDay()
            : $today;

        // Calculate end date based on subscription duration
        $suggestedEndDate = $saleService->calculateExpirationDate(
            $suggestedStartDate->copy(),
            $priceList->months_duration ?? 0,
            $priceList->days_duration ?? 0
        );

        // Get initial data for sale creation
        $props = $saleService->create($subscription->customer_id);

        // Pre-fill the sale with renewal data
        $props['renewal_type'] = 'subscription';
        $props['renewal_source_id'] = $subscription->id;
        $props['sale']['sale_rows'] = [[
            'price_list' => $priceList, // Pass the full object with loaded content
            'quantity' => 1,
            'unit_price' => $totalPrice,
            'percentage_discount' => 0,
            'absolute_discount' => 0,
            'total' => $totalPrice, // Total price of all selected content
            'start_date' => $suggestedStartDate->format('Y-m-d'),
            'end_date' => $suggestedEndDate->format('Y-m-d'),
            'subscription_selected_content' => $selectedContent->toArray(), // Pass the selected content
        ]];

        return Inertia::render('sales/sale-create', $props);
    }
}
