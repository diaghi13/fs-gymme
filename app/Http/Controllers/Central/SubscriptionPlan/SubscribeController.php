<?php

namespace App\Http\Controllers\Central\SubscriptionPlan;

use App\Http\Controllers\Controller;
use App\Services\Subscription\SubscriptionManagementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscribeController extends Controller
{
    public function __construct(
        protected SubscriptionManagementService $subscriptionService,
    ) {}

    public function subscribe(Request $request): JsonResponse
    {
        $request->validate([
            'payment_method' => 'required|string',
            'plan_id' => 'required|string',
            'auto_renew' => 'boolean',
        ]);

        $plan = tenancy()->central(function () use ($request) {
            return \App\Models\SubscriptionPlan::query()
                ->where('stripe_price_id', $request->input('plan_id'))
                ->first();
        });

        if (! $plan || ! $plan->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'The selected subscription plan is not active or does not exist.',
            ], 400);
        }

        $tenant = tenancy()->find($request->input('tenant'));

        if (! $tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found.',
            ], 404);
        }

        $result = $this->subscriptionService->subscribe(
            $tenant,
            $plan,
            $request->payment_method,
            $request->input('auto_renew', true)
        );

        $status = $result['success'] ? 200 : ($result['requires_action'] ?? false ? 200 : 500);

        return response()->json($result, $status);
    }
}
