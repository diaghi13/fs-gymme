<?php

namespace App\Http\Controllers\Application\PriceLists;

use App\Http\Controllers\Controller;
use App\Http\Requests\PriceList\StoreSubscriptionRequest;
use App\Http\Requests\PriceList\UpdateSubscriptionRequest;
use App\Models\PriceList\Subscription;
use App\Services\PriceList\SubscriptionPriceListService;
use App\Support\Color;
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
    public function store(StoreSubscriptionRequest $request, SubscriptionPriceListService $service)
    {
        $data = $request->validated();

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
    public function update(UpdateSubscriptionRequest $request, Subscription $subscription, SubscriptionPriceListService $service)
    {
        $data = $request->validated();

        $service->update($data, $subscription);

        return to_route('app.price-lists.subscriptions.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'subscription' => $subscription->id,
        ])
            ->with('status', 'success');
    }

    /**
     * Duplicate the specified resource.
     */
    public function duplicate(Subscription $subscription)
    {
        $newSubscription = $subscription->replicate();
        $newSubscription->name = 'Copia di '.$subscription->name;
        $newSubscription->save();

        // Duplicate subscription contents
        foreach ($subscription->contents as $content) {
            $newContent = $content->replicate();
            $newContent->subscription_id = $newSubscription->id;
            $newContent->save();

            // Duplicate time restrictions if any
            if ($content->timeRestrictions) {
                foreach ($content->timeRestrictions as $restriction) {
                    $newRestriction = $restriction->replicate();
                    $newRestriction->subscription_content_id = $newContent->id;
                    $newRestriction->save();
                }
            }

            // Duplicate services if any
            if ($content->services) {
                foreach ($content->services as $service) {
                    $newService = $service->replicate();
                    $newService->subscription_content_id = $newContent->id;
                    $newService->save();
                }
            }
        }

        return to_route('app.price-lists.subscriptions.show', [
            'tenant' => session()->get('current_tenant_id'),
            'subscription' => $newSubscription->id,
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
