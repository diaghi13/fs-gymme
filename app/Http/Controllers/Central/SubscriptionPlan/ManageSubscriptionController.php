<?php

namespace App\Http\Controllers\Central\SubscriptionPlan;

use App\Http\Controllers\Controller;
use App\Services\Subscription\SubscriptionManagementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ManageSubscriptionController extends Controller
{
    public function __construct(
        protected SubscriptionManagementService $subscriptionService,
    ) {}

    /**
     * Change subscription plan (upgrade or downgrade).
     */
    public function changePlan(Request $request): JsonResponse
    {
        $request->validate([
            'tenant_id' => 'required|string',
            'plan_id' => 'required|exists:subscription_plans,id',
            'action' => 'required|in:upgrade,downgrade',
        ]);

        $tenant = tenancy()->central(function () use ($request) {
            return \App\Models\Tenant::find($request->tenant_id);
        });

        if (! $tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found.',
            ], 404);
        }

        $plan = tenancy()->central(function () use ($request) {
            return \App\Models\SubscriptionPlan::find($request->plan_id);
        });

        if (! $plan || ! $plan->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid subscription plan.',
            ], 400);
        }

        $result = $request->action === 'upgrade'
            ? $this->subscriptionService->upgrade($tenant, $plan)
            : $this->subscriptionService->downgrade($tenant, $plan);

        $status = $result['success'] ? 200 : 500;

        return response()->json($result, $status);
    }

    /**
     * Cancel subscription at period end.
     */
    public function cancel(Request $request): JsonResponse
    {
        $request->validate([
            'tenant_id' => 'required|string',
        ]);

        $tenant = tenancy()->central(function () use ($request) {
            return \App\Models\Tenant::find($request->tenant_id);
        });

        if (! $tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found.',
            ], 404);
        }

        $result = $this->subscriptionService->cancel($tenant);

        $status = $result['success'] ? 200 : 500;

        return response()->json($result, $status);
    }

    /**
     * Cancel subscription immediately.
     */
    public function cancelNow(Request $request): JsonResponse
    {
        $request->validate([
            'tenant_id' => 'required|string',
        ]);

        $tenant = tenancy()->central(function () use ($request) {
            return \App\Models\Tenant::find($request->tenant_id);
        });

        if (! $tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found.',
            ], 404);
        }

        $result = $this->subscriptionService->cancelNow($tenant);

        $status = $result['success'] ? 200 : 500;

        return response()->json($result, $status);
    }

    /**
     * Resume cancelled subscription.
     */
    public function resume(Request $request): JsonResponse
    {
        $request->validate([
            'tenant_id' => 'required|string',
        ]);

        $tenant = tenancy()->central(function () use ($request) {
            return \App\Models\Tenant::find($request->tenant_id);
        });

        if (! $tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found.',
            ], 404);
        }

        $result = $this->subscriptionService->resume($tenant);

        $status = $result['success'] ? 200 : 500;

        return response()->json($result, $status);
    }
}
