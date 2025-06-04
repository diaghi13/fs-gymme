<?php

namespace App\Http\Controllers\PriceLists;

use App\Http\Controllers\Controller;
use App\Models\PriceList\Subscription;
use App\Services\PriceList\SubscriptionPriceListService;
use Illuminate\Http\Request;

class OptionalContentSubscriptionUpdateController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, Subscription $subscription, SubscriptionPriceListService $service)
    {
        $data = $request->validate([
            'optional_content' => 'nullable|array',
            'optional_content.*.id' => 'nullable|integer',
            'optional_content.*.days_duration' => 'nullable|integer|min:0',
            'optional_content.*.months_duration' => 'nullable|integer|min:0',
            'optional_content.*.price' => 'required|numeric|min:0',
            'optional_content.*.vat_rate_id' => 'required|exists:vat_rates,id',
            'optional_content.*.entrances' => 'nullable|integer|min:0',
            'optional_content.*.daily_access' => 'nullable|integer|min:0',
            'optional_content.*.weekly_access' => 'nullable|integer|min:0',
            'optional_content.*.reservation_limit' => 'nullable|integer|min:0',
            'optional_content.*.daily_reservation_limit' => 'nullable|integer|min:0',
            'optional_content.*.is_optional' => 'nullable|boolean',
            'optional_content.*.price_listable_id' => 'required|integer',
            'optional_content.*.price_listable_type' => 'required|string|in:App\\Models\\Product\\Product,App\\Models\\PriceList\\PriceList',
        ]);

        $priceList = $service->updateOptionalContent($data, $subscription);

        return to_route('price-lists.subscriptions.show', ['subscription' => $priceList->id])
            ->with('status', 'success');
    }
}
