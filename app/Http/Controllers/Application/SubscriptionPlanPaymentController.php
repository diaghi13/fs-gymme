<?php

namespace App\Http\Controllers\Application;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubscriptionPlanPaymentController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, string $id)
    {
        // Find the subscription plan by ID
        $subscriptionPlan = tenancy()->central(function () use ($id) {
            return SubscriptionPlan::findOrFail($id);
        });

        // Check if the subscription plan is active
        if (!$subscriptionPlan->is_active) {
            return redirect()->route('app.subscription-plan.index', ['tenant' => $request->user()->company->id])
                ->with('error', 'The selected subscription plan is not active.');
        }

        // Render the payment view with the subscription plan details

        return Inertia::render('subscription-plan-payment', [
            'tenant' => $request->user()->company,
            'subscriptionPlan' => $subscriptionPlan,
        ]);
    }
}
