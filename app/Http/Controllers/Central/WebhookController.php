<?php

namespace App\Http\Controllers\Central;

use App\Models\SubscriptionPlan;
use App\Models\Tenant;
use Illuminate\Support\Carbon;
use Laravel\Cashier\Http\Controllers\WebhookController as CashierController;

class WebhookController extends CashierController
{
    /**
     * Handle subscription created.
     */
    public function handleCustomerSubscriptionCreated(array $payload): void
    {
        $data = $payload['data']['object'];
        $tenant = $this->getTenantByStripeId($data['customer']);

        if (! $tenant) {
            return;
        }

        // Trova il piano basato sul price_id
        $priceId = $data['items']['data'][0]['price']['id'];
        $plan = SubscriptionPlan::where('stripe_price_id', $priceId)->first();

        if (! $plan) {
            return;
        }

        // Disattiva eventuali subscription attive precedenti
        $tenant->subscription_planes()
            ->wherePivot('is_active', true)
            ->update(['is_active' => false]);

        // Crea o aggiorna la relazione nella pivot table
        $tenant->subscription_planes()->syncWithoutDetaching([
            $plan->id => [
                'starts_at' => Carbon::createFromTimestamp($data['current_period_start']),
                'ends_at' => Carbon::createFromTimestamp($data['current_period_end']),
                'is_active' => $data['status'] === 'active' || $data['status'] === 'trialing',
                'is_trial' => $data['status'] === 'trialing',
                'trial_ends_at' => $data['trial_end'] ? Carbon::createFromTimestamp($data['trial_end']) : null,
                'status' => $data['status'],
            ],
        ]);
    }

    /**
     * Handle subscription updated.
     */
    public function handleCustomerSubscriptionUpdated(array $payload): void
    {
        $data = $payload['data']['object'];
        $tenant = $this->getTenantByStripeId($data['customer']);

        if (! $tenant) {
            return;
        }

        $priceId = $data['items']['data'][0]['price']['id'];
        $plan = SubscriptionPlan::where('stripe_price_id', $priceId)->first();

        if (! $plan) {
            return;
        }

        // Aggiorna lo stato della subscription
        \DB::table('subscription_plan_tenant')
            ->where('tenant_id', $tenant->id)
            ->where('subscription_plan_id', $plan->id)
            ->update([
                'starts_at' => Carbon::createFromTimestamp($data['current_period_start']),
                'ends_at' => Carbon::createFromTimestamp($data['current_period_end']),
                'is_active' => $data['status'] === 'active' || $data['status'] === 'trialing',
                'is_trial' => $data['status'] === 'trialing',
                'trial_ends_at' => $data['trial_end'] ? Carbon::createFromTimestamp($data['trial_end']) : null,
                'status' => $data['status'],
            ]);
    }

    /**
     * Handle subscription deleted/cancelled.
     */
    public function handleCustomerSubscriptionDeleted(array $payload): void
    {
        $data = $payload['data']['object'];
        $tenant = $this->getTenantByStripeId($data['customer']);

        if (! $tenant) {
            return;
        }

        $priceId = $data['items']['data'][0]['price']['id'];
        $plan = SubscriptionPlan::where('stripe_price_id', $priceId)->first();

        if (! $plan) {
            return;
        }

        // Disattiva la subscription
        \DB::table('subscription_plan_tenant')
            ->where('tenant_id', $tenant->id)
            ->where('subscription_plan_id', $plan->id)
            ->update([
                'is_active' => false,
                'status' => 'cancelled',
                'ends_at' => now(),
            ]);
    }

    /**
     * Handle payment failed.
     */
    public function handleInvoicePaymentFailed(array $payload): void
    {
        $data = $payload['data']['object'];
        $tenant = $this->getTenantByStripeId($data['customer']);

        if (! $tenant) {
            return;
        }

        // Qui potresti inviare una notifica al tenant
        // o marcare la subscription come "past_due"
        $subscriptionId = $data['subscription'];

        if ($subscriptionId) {
            $subscription = $tenant->subscriptions()
                ->where('stripe_id', $subscriptionId)
                ->first();

            if ($subscription) {
                // Aggiorna lo stato nella pivot table
                $plan = SubscriptionPlan::where('stripe_price_id', $data['lines']['data'][0]['price']['id'])->first();

                if ($plan) {
                    \DB::table('subscription_plan_tenant')
                        ->where('tenant_id', $tenant->id)
                        ->where('subscription_plan_id', $plan->id)
                        ->update(['status' => 'past_due']);
                }
            }
        }

        // TODO: Invia notifica al tenant
    }

    /**
     * Handle payment succeeded.
     */
    public function handleInvoicePaymentSucceeded(array $payload): void
    {
        $data = $payload['data']['object'];
        $tenant = $this->getTenantByStripeId($data['customer']);

        if (! $tenant) {
            return;
        }

        $subscriptionId = $data['subscription'];

        if ($subscriptionId) {
            $subscription = $tenant->subscriptions()
                ->where('stripe_id', $subscriptionId)
                ->first();

            if ($subscription) {
                $plan = SubscriptionPlan::where('stripe_price_id', $data['lines']['data'][0]['price']['id'])->first();

                if ($plan) {
                    \DB::table('subscription_plan_tenant')
                        ->where('tenant_id', $tenant->id)
                        ->where('subscription_plan_id', $plan->id)
                        ->update([
                            'status' => 'active',
                            'is_active' => true,
                        ]);
                }
            }
        }

        // TODO: Invia conferma pagamento al tenant
    }

    /**
     * Handle customer updated.
     */
    public function handleCustomerUpdated(array $payload): void
    {
        $data = $payload['data']['object'];
        $tenant = $this->getTenantByStripeId($data['id']);

        if (! $tenant) {
            return;
        }

        // Aggiorna i dati del payment method se necessario
        $tenant->updateDefaultPaymentMethodFromStripe();
    }

    /**
     * Get tenant by Stripe customer ID.
     */
    protected function getTenantByStripeId(string $stripeId): ?Tenant
    {
        return Tenant::where('stripe_id', $stripeId)->first();
    }
}
