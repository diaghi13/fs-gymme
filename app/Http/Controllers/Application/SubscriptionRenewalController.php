<?php

namespace App\Http\Controllers\Application;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionRenewalController extends Controller
{
    /**
     * Disable auto-renewal (cancel at period end).
     */
    public function disable(Request $request): JsonResponse
    {
        $tenant = tenant();

        if (! $tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found.',
            ], 404);
        }

        $subscription = $tenant->subscription('default');

        if (! $subscription) {
            return response()->json([
                'success' => false,
                'message' => 'No active subscription found.',
            ], 404);
        }

        if ($subscription->canceled()) {
            return response()->json([
                'success' => false,
                'message' => 'Subscription is already scheduled for cancellation.',
            ], 400);
        }

        try {
            // Cancel at period end (Cashier sets ends_at to current_period_end)
            $subscription->cancel();

            return response()->json([
                'success' => true,
                'message' => 'Il rinnovo automatico è stato disabilitato. L\'abbonamento terminerà il '.$subscription->ends_at->format('d/m/Y').'.',
                'ends_at' => $subscription->ends_at->toIso8601String(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Unable to disable auto-renewal: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Enable auto-renewal (resume subscription).
     */
    public function enable(Request $request): JsonResponse
    {
        $tenant = tenant();

        if (! $tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found.',
            ], 404);
        }

        $subscription = $tenant->subscription('default');

        if (! $subscription) {
            return response()->json([
                'success' => false,
                'message' => 'No subscription found.',
            ], 404);
        }

        if (! $subscription->onGracePeriod()) {
            return response()->json([
                'success' => false,
                'message' => 'Subscription is not scheduled for cancellation.',
            ], 400);
        }

        try {
            // Resume subscription (Cashier sets ends_at to NULL)
            $subscription->resume();

            return response()->json([
                'success' => true,
                'message' => 'Il rinnovo automatico è stato riattivato. L\'abbonamento continuerà automaticamente.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Unable to enable auto-renewal: '.$e->getMessage(),
            ], 500);
        }
    }
}
