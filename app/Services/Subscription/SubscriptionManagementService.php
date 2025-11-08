<?php

namespace App\Services\Subscription;

use App\Models\SubscriptionPlan;
use App\Models\Tenant;
use Illuminate\Support\Carbon;
use Laravel\Cashier\Exceptions\IncompletePayment;

class SubscriptionManagementService
{
    /**
     * Subscribe tenant to a new plan.
     */
    public function subscribe(Tenant $tenant, SubscriptionPlan $plan, string $paymentMethod, ?int $trialDays = null): array
    {
        try {
            // Deactive any existing active subscriptions
            $this->deactivateCurrentSubscription($tenant);

            // Create the Stripe subscription
            $subscription = $tenant->newSubscription('default', $plan->stripe_price_id);

            if ($trialDays || $plan->trial_days) {
                $days = $trialDays ?? $plan->trial_days;
                $subscription->trialDays($days);
            }

            $stripeSubscription = $subscription->create($paymentMethod);

            // Sync with our pivot table
            $this->syncSubscriptionToPivot($tenant, $plan, $stripeSubscription);

            return [
                'success' => true,
                'message' => 'Subscription created successfully.',
                'subscription' => $stripeSubscription,
            ];

        } catch (IncompletePayment $exception) {
            return [
                'success' => false,
                'requires_action' => true,
                'payment_intent_client_secret' => $exception->payment->client_secret,
                'message' => 'Payment requires additional authentication.',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Unable to create subscription: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Upgrade tenant to a higher plan.
     */
    public function upgrade(Tenant $tenant, SubscriptionPlan $newPlan): array
    {
        try {
            $subscription = $tenant->subscription('default');

            if (! $subscription) {
                throw new \Exception('No active subscription found.');
            }

            // Swap the plan immediately with proration
            $subscription->swap($newPlan->stripe_price_id);

            // Update our pivot table
            $this->deactivateCurrentSubscription($tenant);
            $this->syncSubscriptionToPivot($tenant, $newPlan, $subscription->asStripeSubscription());

            return [
                'success' => true,
                'message' => 'Subscription upgraded successfully.',
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Unable to upgrade subscription: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Downgrade tenant to a lower plan.
     */
    public function downgrade(Tenant $tenant, SubscriptionPlan $newPlan): array
    {
        try {
            $subscription = $tenant->subscription('default');

            if (! $subscription) {
                throw new \Exception('No active subscription found.');
            }

            // Swap at the end of billing period (no immediate proration)
            $subscription->swapAndInvoice($newPlan->stripe_price_id);

            // Update our pivot table
            $this->deactivateCurrentSubscription($tenant);
            $this->syncSubscriptionToPivot($tenant, $newPlan, $subscription->asStripeSubscription());

            return [
                'success' => true,
                'message' => 'Subscription will be downgraded at the end of the current billing period.',
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Unable to downgrade subscription: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Cancel subscription at period end.
     */
    public function cancel(Tenant $tenant): array
    {
        try {
            $subscription = $tenant->subscription('default');

            if (! $subscription) {
                throw new \Exception('No active subscription found.');
            }

            $subscription->cancel();

            return [
                'success' => true,
                'message' => 'Subscription will be cancelled at the end of the current billing period.',
                'ends_at' => $subscription->ends_at,
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Unable to cancel subscription: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Cancel subscription immediately.
     */
    public function cancelNow(Tenant $tenant): array
    {
        try {
            $subscription = $tenant->subscription('default');

            if (! $subscription) {
                throw new \Exception('No active subscription found.');
            }

            $subscription->cancelNow();

            // Deactivate in our pivot table
            $this->deactivateCurrentSubscription($tenant);

            return [
                'success' => true,
                'message' => 'Subscription cancelled immediately.',
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Unable to cancel subscription: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Resume a cancelled subscription.
     */
    public function resume(Tenant $tenant): array
    {
        try {
            $subscription = $tenant->subscription('default');

            if (! $subscription) {
                throw new \Exception('No subscription found.');
            }

            if (! $subscription->onGracePeriod()) {
                throw new \Exception('Subscription is not in grace period and cannot be resumed.');
            }

            $subscription->resume();

            return [
                'success' => true,
                'message' => 'Subscription resumed successfully.',
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Unable to resume subscription: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Deactivate current active subscription in pivot table.
     */
    protected function deactivateCurrentSubscription(Tenant $tenant): void
    {
        \DB::table('subscription_plan_tenant')
            ->where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->update(['is_active' => false]);
    }

    /**
     * Sync Stripe subscription to our pivot table.
     */
    protected function syncSubscriptionToPivot(Tenant $tenant, SubscriptionPlan $plan, $stripeSubscription): void
    {
        \DB::table('subscription_plan_tenant')
            ->updateOrInsert(
                [
                    'tenant_id' => $tenant->id,
                    'subscription_plan_id' => $plan->id,
                ],
                [
                    'starts_at' => Carbon::createFromTimestamp($stripeSubscription->current_period_start),
                    'ends_at' => Carbon::createFromTimestamp($stripeSubscription->current_period_end),
                    'is_active' => $stripeSubscription->status === 'active' || $stripeSubscription->status === 'trialing',
                    'is_trial' => $stripeSubscription->status === 'trialing',
                    'trial_ends_at' => $stripeSubscription->trial_end ? Carbon::createFromTimestamp($stripeSubscription->trial_end) : null,
                    'status' => $stripeSubscription->status,
                ]
            );
    }
}
