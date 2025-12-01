<?php

namespace App\Http\Controllers\Central;

use App\Enums\FeatureType;
use App\Http\Controllers\Controller;
use App\Models\PlanFeature;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller for managing plan features in the central admin panel.
 *
 * Features are the building blocks of subscription plans:
 * - Boolean features (on/off)
 * - Quota features (with limits)
 * - Metered features (pay per use)
 */
class PlanFeatureController extends Controller
{
    /**
     * Display a listing of plan features.
     */
    public function index(): Response
    {
        $features = PlanFeature::orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn ($feature) => [
                'id' => $feature->id,
                'name' => $feature->name,
                'display_name' => $feature->display_name,
                'description' => $feature->description,
                'feature_type' => $feature->feature_type->value,
                'is_active' => $feature->is_active,
                'is_addon_purchasable' => $feature->is_addon_purchasable,
                'default_addon_price_cents' => $feature->default_addon_price_cents,
                'default_addon_quota' => $feature->default_addon_quota,
                'sort_order' => $feature->sort_order,
            ]);

        return Inertia::render('central/plan-features/index', [
            'features' => $features,
        ]);
    }

    /**
     * Show the form for creating a new feature.
     */
    public function create(): Response
    {
        return Inertia::render('central/plan-features/create', [
            'featureTypes' => array_map(
                fn ($type) => ['value' => $type->value, 'label' => $type->label()],
                FeatureType::cases()
            ),
        ]);
    }

    /**
     * Store a newly created feature.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:plan_features,name',
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'feature_type' => 'required|string|in:boolean,quota,metered',
            'is_active' => 'boolean',
            'is_addon_purchasable' => 'boolean',
            'default_addon_price_cents' => 'nullable|integer|min:0',
            'default_addon_quota' => 'nullable|integer|min:1',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        PlanFeature::create($validated);

        return redirect()->route('central.plan-features.index')
            ->with('status', 'success')
            ->with('message', 'Feature creata con successo.');
    }

    /**
     * Display the specified feature.
     */
    public function show(PlanFeature $planFeature): Response
    {
        // Get plans that include this feature
        $plansWithFeature = $planFeature->plans()
            ->withPivot(['is_included', 'quota_limit', 'price_cents'])
            ->get()
            ->map(fn ($plan) => [
                'id' => $plan->id,
                'name' => $plan->name,
                'tier' => $plan->tier?->value,
                'is_included' => $plan->pivot->is_included,
                'quota_limit' => $plan->pivot->quota_limit,
                'price_cents' => $plan->pivot->price_cents,
            ]);

        return Inertia::render('central/plan-features/show', [
            'feature' => [
                'id' => $planFeature->id,
                'name' => $planFeature->name,
                'display_name' => $planFeature->display_name,
                'description' => $planFeature->description,
                'feature_type' => $planFeature->feature_type->value,
                'is_active' => $planFeature->is_active,
                'is_addon_purchasable' => $planFeature->is_addon_purchasable,
                'default_addon_price_cents' => $planFeature->default_addon_price_cents,
                'default_addon_quota' => $planFeature->default_addon_quota,
                'sort_order' => $planFeature->sort_order,
            ],
            'plans' => $plansWithFeature,
        ]);
    }

    /**
     * Show the form for editing the specified feature.
     */
    public function edit(PlanFeature $planFeature): Response
    {
        return Inertia::render('central/plan-features/edit', [
            'feature' => [
                'id' => $planFeature->id,
                'name' => $planFeature->name,
                'display_name' => $planFeature->display_name,
                'description' => $planFeature->description,
                'feature_type' => $planFeature->feature_type->value,
                'is_active' => $planFeature->is_active,
                'is_addon_purchasable' => $planFeature->is_addon_purchasable,
                'default_addon_price_cents' => $planFeature->default_addon_price_cents ?? 0,
                'default_addon_quota' => $planFeature->default_addon_quota ?? 0,
                'sort_order' => $planFeature->sort_order ?? 0,
            ],
            'featureTypes' => array_map(
                fn ($type) => ['value' => $type->value, 'label' => $type->label()],
                FeatureType::cases()
            ),
        ]);
    }

    /**
     * Update the specified feature.
     */
    public function update(Request $request, PlanFeature $planFeature): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:plan_features,name,'.$planFeature->id,
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'feature_type' => 'required|string|in:boolean,quota,metered',
            'is_active' => 'boolean',
            'is_addon_purchasable' => 'boolean',
            'default_addon_price_cents' => 'nullable|integer|min:0',
            'default_addon_quota' => 'nullable|integer|min:1',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $planFeature->update($validated);

        return redirect()->route('central.plan-features.index')
            ->with('status', 'success')
            ->with('message', 'Feature aggiornata con successo.');
    }

    /**
     * Remove the specified feature.
     */
    public function destroy(PlanFeature $planFeature): RedirectResponse
    {
        // Check if feature is being used
        if ($planFeature->plans()->count() > 0) {
            return redirect()->back()
                ->with('status', 'error')
                ->with('message', 'Impossibile eliminare: la feature è associata a uno o più piani.');
        }

        $planFeature->delete();

        return redirect()->route('central.plan-features.index')
            ->with('status', 'success')
            ->with('message', 'Feature eliminata con successo.');
    }
}
