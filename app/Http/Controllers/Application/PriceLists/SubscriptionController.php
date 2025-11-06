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

        $subscription->load(['standard_content', 'optional_content']);

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

            // Subscription-level benefits
            'guest_passes_total' => 'nullable|integer|min:0',
            'guest_passes_per_month' => 'nullable|integer|min:0',
            'multi_location_access' => 'nullable|boolean',

            'standard_content' => 'nullable|array',
            'standard_content.*.id' => 'nullable|integer',
            'standard_content.*.price_listable_id' => 'required|integer',
            'standard_content.*.price_listable_type' => 'required|string|in:App\\Models\\Product\\Product,App\\Models\\PriceList\\PriceList',
            'standard_content.*.is_optional' => 'nullable|boolean',
            'standard_content.*.days_duration' => 'nullable|integer|min:0',
            'standard_content.*.months_duration' => 'nullable|integer|min:0',
            'standard_content.*.entrances' => 'nullable|integer|min:0',
            'standard_content.*.price' => 'required|numeric|min:0',
            'standard_content.*.vat_rate_id' => 'required|exists:vat_rates,id',

            // Access rules
            'standard_content.*.unlimited_entries' => 'nullable|boolean',
            'standard_content.*.total_entries' => 'nullable|integer|min:1',
            'standard_content.*.daily_entries' => 'nullable|integer|min:1',
            'standard_content.*.weekly_entries' => 'nullable|integer|min:1',
            'standard_content.*.monthly_entries' => 'nullable|integer|min:1',

            // Booking rules
            'standard_content.*.max_concurrent_bookings' => 'nullable|integer|min:1',
            'standard_content.*.daily_bookings' => 'nullable|integer|min:1',
            'standard_content.*.weekly_bookings' => 'nullable|integer|min:1',
            'standard_content.*.advance_booking_days' => 'nullable|integer|min:0',
            'standard_content.*.cancellation_hours' => 'nullable|integer|min:0',

            // Validity rules
            'standard_content.*.validity_type' => 'nullable|string|in:duration,fixed_date,first_use',
            'standard_content.*.validity_days' => 'nullable|integer|min:1',
            'standard_content.*.validity_months' => 'nullable|integer|min:1',
            'standard_content.*.valid_from' => 'nullable|date',
            'standard_content.*.valid_to' => 'nullable|date|after:valid_from',
            'standard_content.*.freeze_days_allowed' => 'nullable|integer|min:0',
            'standard_content.*.freeze_cost_cents' => 'nullable|integer|min:0',

            // Time restrictions
            'standard_content.*.has_time_restrictions' => 'nullable|boolean',

            // Service access
            'standard_content.*.service_access_type' => 'nullable|string|in:all,included,excluded',

            // Benefits & perks
            'standard_content.*.discount_percentage' => 'nullable|integer|min:0|max:100',

            // Metadata
            'standard_content.*.sort_order' => 'nullable|integer|min:0',
            'standard_content.*.settings' => 'nullable|array',

            // Services relationship
            'standard_content.*.services' => 'nullable|array',
            'standard_content.*.services.*.id' => 'required|exists:products,id',
            'standard_content.*.services.*.usage_limit' => 'nullable|integer|min:1',
            'standard_content.*.services.*.usage_period' => 'nullable|string|in:day,week,month',

            // Time restrictions relationship
            'standard_content.*.time_restrictions' => 'nullable|array',
            'standard_content.*.time_restrictions.*.days' => 'nullable|array',
            'standard_content.*.time_restrictions.*.days.*' => 'string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'standard_content.*.time_restrictions.*.start_time' => 'required_with:standard_content.*.time_restrictions.*.end_time|date_format:H:i',
            'standard_content.*.time_restrictions.*.end_time' => 'required_with:standard_content.*.time_restrictions.*.start_time|date_format:H:i|after:standard_content.*.time_restrictions.*.start_time',
            'standard_content.*.time_restrictions.*.restriction_type' => 'nullable|string|in:allowed,blocked',
            'standard_content.*.time_restrictions.*.description' => 'nullable|string|max:255',

            // Legacy fields (backward compatibility)
            'standard_content.*.daily_access' => 'nullable|integer|min:0',
            'standard_content.*.weekly_access' => 'nullable|integer|min:0',
            'standard_content.*.reservation_limit' => 'nullable|integer|min:0',
            'standard_content.*.daily_reservation_limit' => 'nullable|integer|min:0',
        ]);

        $priceList = $service->store($data);

        return to_route('app.price-lists.subscriptions.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'subscription' => $priceList->id,
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
                'services',
                'timeRestrictions',
            ],
            'optional_content' => [
                'vat_rate',
                'price_listable' => function ($query) {
                    $query->with('vat_rate');
                },
                'services',
                'timeRestrictions',
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

            // Subscription-level benefits
            'guest_passes_total' => 'nullable|integer|min:0',
            'guest_passes_per_month' => 'nullable|integer|min:0',
            'multi_location_access' => 'nullable|boolean',

            'standard_content' => 'nullable|array',
            'standard_content.*.id' => 'nullable|integer',
            'standard_content.*.price_listable_id' => 'required|integer',
            'standard_content.*.price_listable_type' => 'required|string|in:App\\Models\\Product\\Product,App\\Models\\PriceList\\PriceList',
            'standard_content.*.is_optional' => 'nullable|boolean',
            'standard_content.*.days_duration' => 'nullable|integer|min:0',
            'standard_content.*.months_duration' => 'nullable|integer|min:0',
            'standard_content.*.entrances' => 'nullable|integer|min:0',
            'standard_content.*.price' => 'required|numeric|min:0',
            'standard_content.*.vat_rate_id' => 'required|exists:vat_rates,id',

            // Access rules
            'standard_content.*.unlimited_entries' => 'nullable|boolean',
            'standard_content.*.total_entries' => 'nullable|integer|min:1',
            'standard_content.*.daily_entries' => 'nullable|integer|min:1',
            'standard_content.*.weekly_entries' => 'nullable|integer|min:1',
            'standard_content.*.monthly_entries' => 'nullable|integer|min:1',

            // Booking rules
            'standard_content.*.max_concurrent_bookings' => 'nullable|integer|min:1',
            'standard_content.*.daily_bookings' => 'nullable|integer|min:1',
            'standard_content.*.weekly_bookings' => 'nullable|integer|min:1',
            'standard_content.*.advance_booking_days' => 'nullable|integer|min:0',
            'standard_content.*.cancellation_hours' => 'nullable|integer|min:0',

            // Validity rules
            'standard_content.*.validity_type' => 'nullable|string|in:duration,fixed_date,first_use',
            'standard_content.*.validity_days' => 'nullable|integer|min:1',
            'standard_content.*.validity_months' => 'nullable|integer|min:1',
            'standard_content.*.valid_from' => 'nullable|date',
            'standard_content.*.valid_to' => 'nullable|date|after:valid_from',
            'standard_content.*.freeze_days_allowed' => 'nullable|integer|min:0',
            'standard_content.*.freeze_cost_cents' => 'nullable|integer|min:0',

            // Time restrictions
            'standard_content.*.has_time_restrictions' => 'nullable|boolean',

            // Service access
            'standard_content.*.service_access_type' => 'nullable|string|in:all,included,excluded',

            // Benefits & perks
            'standard_content.*.discount_percentage' => 'nullable|integer|min:0|max:100',

            // Metadata
            'standard_content.*.sort_order' => 'nullable|integer|min:0',
            'standard_content.*.settings' => 'nullable|array',

            // Services relationship
            'standard_content.*.services' => 'nullable|array',
            'standard_content.*.services.*.id' => 'required|exists:products,id',
            'standard_content.*.services.*.usage_limit' => 'nullable|integer|min:1',
            'standard_content.*.services.*.usage_period' => 'nullable|string|in:day,week,month',

            // Time restrictions relationship
            'standard_content.*.time_restrictions' => 'nullable|array',
            'standard_content.*.time_restrictions.*.days' => 'nullable|array',
            'standard_content.*.time_restrictions.*.days.*' => 'string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'standard_content.*.time_restrictions.*.start_time' => 'required_with:standard_content.*.time_restrictions.*.end_time|date_format:H:i',
            'standard_content.*.time_restrictions.*.end_time' => 'required_with:standard_content.*.time_restrictions.*.start_time|date_format:H:i|after:standard_content.*.time_restrictions.*.start_time',
            'standard_content.*.time_restrictions.*.restriction_type' => 'nullable|string|in:allowed,blocked',
            'standard_content.*.time_restrictions.*.description' => 'nullable|string|max:255',

            // Legacy fields (backward compatibility)
            'standard_content.*.daily_access' => 'nullable|integer|min:0',
            'standard_content.*.weekly_access' => 'nullable|integer|min:0',
            'standard_content.*.reservation_limit' => 'nullable|integer|min:0',
            'standard_content.*.daily_reservation_limit' => 'nullable|integer|min:0',
        ]);

        $service->update($data, $subscription);

        return to_route('app.price-lists.subscriptions.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'subscription' => $subscription->id,
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
