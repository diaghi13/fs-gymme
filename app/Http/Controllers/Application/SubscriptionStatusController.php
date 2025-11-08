<?php

namespace App\Http\Controllers\Application;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionStatusController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $tenant = $user->company;

        // Get current active subscription
        $activeSubscription = $tenant->active_subscription_plan;

        // Get Cashier subscription details
        $cashierSubscription = $tenant->subscription('default');

        // Get all available plans for upgrade/downgrade
        $availablePlans = tenancy()->central(function () {
            return \App\Models\SubscriptionPlan::where('is_active', true)
                ->orderBy('price', 'asc')
                ->get();
        });

        $subscriptionData = null;

        if ($cashierSubscription) {
            $subscriptionData = [
                'id' => $cashierSubscription->stripe_id,
                'status' => $cashierSubscription->stripe_status,
                'on_trial' => $cashierSubscription->onTrial(),
                'trial_ends_at' => $cashierSubscription->trial_ends_at?->toIso8601String(),
                'on_grace_period' => $cashierSubscription->onGracePeriod(),
                'ends_at' => $cashierSubscription->ends_at?->toIso8601String(),
                'canceled' => $cashierSubscription->canceled(),
                'active' => $cashierSubscription->active(),
                'recurring' => $cashierSubscription->recurring(),
            ];
        }

        return Inertia::render('subscription/status', [
            'subscriptionTenant' => $tenant->only(['id', 'name', 'email']),
            'activeSubscription' => $activeSubscription?->load('pivot'),
            'cashierSubscription' => $subscriptionData,
            'availablePlans' => $availablePlans,
        ]);
    }
}
