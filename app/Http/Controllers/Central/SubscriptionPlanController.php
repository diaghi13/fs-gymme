<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Http\Requests\Central\SubscriptionPlanRequest;
use App\Models\PlanFeature;
use App\Models\SubscriptionPlan;
use Inertia\Inertia;

class SubscriptionPlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('central/subscription-plans/index', [
            'subscriptionPlans' => SubscriptionPlan::all(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('central/subscription-plans/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SubscriptionPlanRequest $request)
    {
        $data = $request->validated();

        // Auto-generate slug if not provided or empty
        if (empty($data['slug'])) {
            $data['slug'] = \Str::slug($data['name']);
        }

        SubscriptionPlan::create($data);

        return redirect()->route('central.subscription-plans.index')
            ->with('status', 'success')
            ->with('message', 'Piano di abbonamento creato con successo.');
    }

    /**
     * Display the specified resource.
     */
    public function show(SubscriptionPlan $subscriptionPlan)
    {
        // Load features with pivot data
        $planFeatures = $subscriptionPlan->features()
            ->withPivot(['is_included', 'quota_limit', 'price'])
            ->orderBy('sort_order')
            ->orderBy('display_name')
            ->get()
            ->map(fn ($feature) => [
                'id' => $feature->id,
                'name' => $feature->name,
                'display_name' => $feature->display_name,
                'description' => $feature->description,
                'feature_type' => $feature->feature_type->value,
                'is_included' => $feature->pivot->is_included,
                'quota_limit' => $feature->pivot->quota_limit,
                'price' => $feature->pivot->price,
            ]);

        return Inertia::render('central/subscription-plans/show', [
            'subscriptionPlan' => array_merge($subscriptionPlan->toArray(), [
                'tier' => $subscriptionPlan->tier?->value,
            ]),
            'planFeatures' => $planFeatures,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(SubscriptionPlan $subscriptionPlan)
    {
        // Load features with pivot data
        $planFeatures = $subscriptionPlan->features()
            ->withPivot(['is_included', 'quota_limit', 'price'])
            ->get()
            ->map(fn ($feature) => [
                'id' => $feature->id,
                'name' => $feature->name,
                'display_name' => $feature->display_name,
                'feature_type' => $feature->feature_type->value,
                'is_included' => $feature->pivot->is_included,
                'quota_limit' => $feature->pivot->quota_limit,
                'price' => $feature->pivot->price,
            ]);

        // Get all available features
        $allFeatures = PlanFeature::active()
            ->orderBy('sort_order')
            ->orderBy('display_name')
            ->get()
            ->map(fn ($feature) => [
                'id' => $feature->id,
                'name' => $feature->name,
                'display_name' => $feature->display_name,
                'feature_type' => $feature->feature_type->value,
                'is_addon_purchasable' => $feature->is_addon_purchasable,
                'default_addon_price' => $feature->default_addon_price,
                'default_addon_quota' => $feature->default_addon_quota,
            ]);

        return Inertia::render('central/subscription-plans/edit', [
            'subscriptionPlan' => $subscriptionPlan,
            'planFeatures' => $planFeatures,
            'availableFeatures' => $allFeatures,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SubscriptionPlanRequest $request, SubscriptionPlan $subscriptionPlan)
    {
        $data = $request->validated();

        // Auto-generate slug if not provided or empty
        if (empty($data['slug'])) {
            $data['slug'] = \Str::slug($data['name']);
        }

        // Extract features data before updating plan
        $features = $data['features'] ?? [];
        unset($data['features']);

        $subscriptionPlan->update($data);

        // Sync features with pivot data
        if (! empty($features)) {
            $syncData = [];
            foreach ($features as $feature) {
                $syncData[$feature['feature_id']] = [
                    'is_included' => $feature['is_included'],
                    'quota_limit' => $feature['quota_limit'] ?? null,
                    'price' => $feature['price'] ?? null,
                ];
            }
            $subscriptionPlan->features()->sync($syncData);
        } else {
            // If no features provided, detach all
            $subscriptionPlan->features()->sync([]);
        }

        return redirect()->route('central.subscription-plans.index')
            ->with('status', 'success')
            ->with('message', 'Piano di abbonamento aggiornato con successo.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SubscriptionPlan $subscriptionPlan)
    {
        $subscriptionPlan->delete();

        return redirect()->route('central.subscription-plans.index')
            ->with('status', 'success')
            ->with('message', 'Piano di abbonamento eliminato con successo.');
    }
}
