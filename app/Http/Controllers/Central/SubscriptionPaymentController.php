<?php

namespace App\Http\Controllers\Central;

use App\Enums\SubscriptionStatus;
use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller for managing manual subscription payment confirmations.
 *
 * Used by admins to confirm bank transfer payments and activate subscriptions.
 */
class SubscriptionPaymentController extends Controller
{
    /**
     * Display pending payments requiring confirmation.
     */
    public function index(Request $request): Response
    {
        $pendingPayments = DB::table('subscription_plan_tenant')
            ->join('tenants', 'subscription_plan_tenant.tenant_id', '=', 'tenants.id')
            ->join('subscription_plans', 'subscription_plan_tenant.subscription_plan_id', '=', 'subscription_plans.id')
            ->where('subscription_plan_tenant.status', SubscriptionStatus::PendingPayment->value)
            ->whereIn('subscription_plan_tenant.payment_method', ['bank_transfer', 'manual'])
            ->select([
                'subscription_plan_tenant.id',
                'tenants.id as tenant_id',
                'tenants.name as tenant_name',
                'tenants.email as tenant_email',
                'subscription_plans.name as plan_name',
                'subscription_plans.price',
                'subscription_plan_tenant.payment_method',
                'subscription_plan_tenant.bank_transfer_notes',
                'subscription_plan_tenant.starts_at',
                'subscription_plan_tenant.created_at',
            ])
            ->orderBy('subscription_plan_tenant.created_at', 'desc')
            ->get();

        return Inertia::render('central/subscription-payments/index', [
            'pendingPayments' => $pendingPayments,
        ]);
    }

    /**
     * Confirm a pending payment and activate subscription.
     */
    public function confirm(Request $request, int $subscriptionId): RedirectResponse
    {
        $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        DB::beginTransaction();

        try {
            $subscription = DB::table('subscription_plan_tenant')
                ->where('id', $subscriptionId)
                ->where('status', SubscriptionStatus::PendingPayment->value)
                ->first();

            if (! $subscription) {
                return redirect()->back()->with('error', 'Abbonamento non trovato o già confermato.');
            }

            // Update subscription to active
            DB::table('subscription_plan_tenant')
                ->where('id', $subscriptionId)
                ->update([
                    'status' => SubscriptionStatus::Active->value,
                    'is_active' => true,
                    'payment_confirmed_at' => now(),
                    'payment_confirmed_by' => auth()->id(),
                    'bank_transfer_notes' => $request->input('notes') ?? $subscription->bank_transfer_notes,
                    'updated_at' => now(),
                ]);

            // Activate tenant if it was inactive
            $tenant = Tenant::find($subscription->tenant_id);
            if ($tenant && ! $tenant->is_active) {
                $tenant->update(['is_active' => true]);
            }

            DB::commit();

            Log::info('Subscription payment confirmed', [
                'subscription_id' => $subscriptionId,
                'tenant_id' => $subscription->tenant_id,
                'confirmed_by' => auth()->id(),
            ]);

            // TODO: Send email notification to tenant

            return redirect()->back()->with('success', 'Pagamento confermato e abbonamento attivato con successo.');
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to confirm subscription payment', [
                'subscription_id' => $subscriptionId,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()->with('error', 'Errore durante la conferma del pagamento.');
        }
    }

    /**
     * Reject a pending payment.
     */
    public function reject(Request $request, int $subscriptionId): RedirectResponse
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        DB::beginTransaction();

        try {
            $subscription = DB::table('subscription_plan_tenant')
                ->where('id', $subscriptionId)
                ->where('status', SubscriptionStatus::PendingPayment->value)
                ->first();

            if (! $subscription) {
                return redirect()->back()->with('error', 'Abbonamento non trovato.');
            }

            // Update subscription to cancelled
            DB::table('subscription_plan_tenant')
                ->where('id', $subscriptionId)
                ->update([
                    'status' => SubscriptionStatus::Cancelled->value,
                    'is_active' => false,
                    'bank_transfer_notes' => 'RIFIUTATO: '.$request->input('reason'),
                    'updated_at' => now(),
                ]);

            DB::commit();

            Log::info('Subscription payment rejected', [
                'subscription_id' => $subscriptionId,
                'tenant_id' => $subscription->tenant_id,
                'rejected_by' => auth()->id(),
                'reason' => $request->input('reason'),
            ]);

            // TODO: Send email notification to tenant

            return redirect()->back()->with('success', 'Pagamento rifiutato.');
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to reject subscription payment', [
                'subscription_id' => $subscriptionId,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()->with('error', 'Errore durante il rifiuto del pagamento.');
        }
    }
}
