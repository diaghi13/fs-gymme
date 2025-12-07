<?php

namespace App\Http\Controllers;

use App\Models\SubscriptionPlan;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller for displaying public pricing pages with dynamic subscription plans.
 *
 * Example usage in routes/web.php:
 * Route::get('/pricing', [PricingController::class, 'index'])->name('pricing');
 */
class PricingController extends Controller
{
    /**
     * Display the pricing page with active subscription plans and their features.
     */
    public function index(): Response
    {
        $plans = SubscriptionPlan::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('price')
            ->get()
            ->map(function ($plan) {
                // Load features with pivot data
                $features = $plan->features()
                    ->withPivot(['is_included', 'quota_limit'])
                    ->where('is_active', true)
                    ->orderBy('sort_order')
                    ->orderBy('display_name')
                    ->get()
                    ->map(fn ($feature) => [
                        'id' => $feature->id,
                        'name' => $feature->name,
                        'display_name' => $feature->display_name,
                        'is_included' => $feature->pivot->is_included,
                        'quota_limit' => $feature->pivot->quota_limit,
                    ]);

                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'slug' => $plan->slug,
                    'description' => $plan->description,
                    'price' => $plan->price, // Already converted to euros by MoneyCast
                    'currency' => $plan->currency,
                    'interval' => $plan->interval,
                    'trial_days' => $plan->trial_days,
                    'tier' => $plan->tier?->value,
                    'is_active' => $plan->is_active,
                    'features' => $features,
                ];
            });

        return Inertia::render('users/pricing-example', [
            'plans' => $plans,
        ]);
    }
}
