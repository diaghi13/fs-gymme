<?php

namespace App\Http\Controllers\Application\PriceLists;

use App\Http\Controllers\Controller;
use App\Models\PriceList\Subscription;
use App\Services\PriceList\SubscriptionPriceListService;
use App\Support\Color;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    /**
     * CustomerShow the form for creating a new resource.
     */
    public function create()
    {
        $subscription = new Subscription([
            'color' => Color::randomHex(),
            'saleable' => true,
        ]);

        $subscription->load(['standard_content', 'optional_content',]);

        return Inertia::render('price-lists/price-lists', [
            ...SubscriptionPriceListService::getViewAttributes(),
            'priceList' => $subscription,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, SubscriptionPriceListService $service)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:price_lists,id|integer',
            'color' => 'required|string|max:7',
            'saleable' => 'boolean',

            'standard_content' => 'nullable|array',
            'standard_content.*.id' => 'nullable|integer',
            'standard_content.*.days_duration' => 'nullable|integer|min:0',
            'standard_content.*.months_duration' => 'nullable|integer|min:0',
            'standard_content.*.price' => 'required|numeric|min:0',
            'standard_content.*.vat_rate_id' => 'required|exists:vat_rates,id',
            'standard_content.*.entrances' => 'nullable|integer|min:0',
            'standard_content.*.daily_access' => 'nullable|integer|min:0',
            'standard_content.*.weekly_access' => 'nullable|integer|min:0',
            'standard_content.*.reservation_limit' => 'nullable|integer|min:0',
            'standard_content.*.daily_reservation_limit' => 'nullable|integer|min:0',
            'standard_content.*.is_optional' => 'nullable|boolean',
            'standard_content.*.price_listable_id' => 'required|integer',
            'standard_content.*.price_listable_type' => 'required|string|in:App\\Models\\Product\\Product,App\\Models\\PriceList\\PriceList',
        ]);

        $priceList = $service->store($data);

        return to_route('app.price-lists.subscriptions.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'subscription' => $priceList->id
        ])
            ->with('status', 'success');
    }

    /**
     * Display the specified resource.
     */
    public function show(Subscription $subscription)
    {
        $subscription->load([
            'standard_content' => [
                'vat_rate',
                'price_listable' => function ($query) {
                    $query->with('vat_rate');
                },
            ],
            'optional_content' => [
                'vat_rate',
                'price_listable' => function ($query) {
                    $query->with('vat_rate');
                },
            ],
        ]);

        return Inertia::render('price-lists/price-lists', [
            ...SubscriptionPriceListService::getViewAttributes(),
            'priceList' => $subscription,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Subscription $subscription, SubscriptionPriceListService $service)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:price_lists,id|integer',
            'color' => 'required|string|max:7',
            'saleable' => 'boolean',

            'standard_content' => 'nullable|array',
            'standard_content.*.id' => 'nullable|integer',
            'standard_content.*.days_duration' => 'nullable|integer|min:0',
            'standard_content.*.months_duration' => 'nullable|integer|min:0',
            'standard_content.*.price' => 'required|numeric|min:0',
            'standard_content.*.vat_rate_id' => 'required|exists:vat_rates,id',
            'standard_content.*.entrances' => 'nullable|integer|min:0',
            'standard_content.*.daily_access' => 'nullable|integer|min:0',
            'standard_content.*.weekly_access' => 'nullable|integer|min:0',
            'standard_content.*.reservation_limit' => 'nullable|integer|min:0',
            'standard_content.*.daily_reservation_limit' => 'nullable|integer|min:0',
            'standard_content.*.is_optional' => 'nullable|boolean',
            'standard_content.*.price_listable_id' => 'required|integer',
            'standard_content.*.price_listable_type' => 'required|string|in:App\\Models\\Product\\Product,App\\Models\\PriceList\\PriceList',
        ]);

        $service->update($data, $subscription);

        return to_route('app.price-lists.subscriptions.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'subscription' => $subscription->id
        ])
            ->with('status', 'success');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Subscription $subscription)
    {
        $subscription->delete();

        return to_route('app.price-lists.subscriptions.index', [
            'tenant' => session()->get('current_tenant_id'),
        ])
            ->with('status', 'success');
    }
}
