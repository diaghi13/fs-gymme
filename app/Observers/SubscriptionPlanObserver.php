<?php

namespace App\Observers;

use App\Models\SubscriptionPlan;
use App\Services\StripeProductService;

/**
 * Observer for automatically syncing subscription plans to Stripe.
 *
 * Handles:
 * - Creating Stripe Products/Prices when a plan is created
 * - Updating Stripe Products and creating new Prices when a plan is updated
 * - Archiving Stripe Products/Prices when a plan is deleted
 */
class SubscriptionPlanObserver
{
    public function __construct(
        protected StripeProductService $stripeService
    ) {}

    /**
     * Handle the SubscriptionPlan "created" event.
     *
     * Automatically creates a Stripe Product and Price for the new plan.
     */
    public function created(SubscriptionPlan $subscriptionPlan): void
    {
        // Only sync if Stripe is configured
        if (! $this->isStripeConfigured()) {
            return;
        }

        try {
            $this->stripeService->syncPlan($subscriptionPlan);
            \Log::info('Stripe sync: Plan created', [
                'plan_id' => $subscriptionPlan->id,
                'stripe_product_id' => $subscriptionPlan->stripe_product_id,
                'stripe_price_id' => $subscriptionPlan->stripe_price_id,
            ]);
        } catch (\Exception $e) {
            \Log::error('Stripe sync failed on plan creation', [
                'plan_id' => $subscriptionPlan->id,
                'error' => $e->getMessage(),
            ]);

            // Don't throw - allow plan creation to succeed even if Stripe sync fails
            // Admin can manually sync later using the command
        }
    }

    /**
     * Handle the SubscriptionPlan "updated" event.
     *
     * Syncs changes to Stripe. If the price changed, archives the old price
     * and creates a new one (Stripe prices are immutable).
     */
    public function updated(SubscriptionPlan $subscriptionPlan): void
    {
        // Only sync if Stripe is configured
        if (! $this->isStripeConfigured()) {
            return;
        }

        // Skip if no Stripe IDs exist yet (manual sync needed first)
        if (! $subscriptionPlan->stripe_product_id) {
            return;
        }

        try {
            $this->stripeService->syncPlan($subscriptionPlan);

            $changedFields = array_keys($subscriptionPlan->getChanges());

            \Log::info('Stripe sync: Plan updated', [
                'plan_id' => $subscriptionPlan->id,
                'changed_fields' => $changedFields,
                'stripe_product_id' => $subscriptionPlan->stripe_product_id,
                'stripe_price_id' => $subscriptionPlan->stripe_price_id,
            ]);
        } catch (\Exception $e) {
            \Log::error('Stripe sync failed on plan update', [
                'plan_id' => $subscriptionPlan->id,
                'error' => $e->getMessage(),
            ]);

            // Don't throw - allow update to succeed
        }
    }

    /**
     * Handle the SubscriptionPlan "deleted" event.
     *
     * Archives (deactivates) the Stripe Product and Price.
     * Note: We don't actually delete them in Stripe to preserve transaction history.
     */
    public function deleted(SubscriptionPlan $subscriptionPlan): void
    {
        // Only sync if Stripe is configured
        if (! $this->isStripeConfigured()) {
            return;
        }

        // Skip if no Stripe IDs exist
        if (! $subscriptionPlan->stripe_product_id) {
            return;
        }

        try {
            $this->stripeService->archivePlan($subscriptionPlan);

            \Log::info('Stripe sync: Plan archived', [
                'plan_id' => $subscriptionPlan->id,
                'stripe_product_id' => $subscriptionPlan->stripe_product_id,
            ]);
        } catch (\Exception $e) {
            \Log::error('Stripe sync failed on plan deletion', [
                'plan_id' => $subscriptionPlan->id,
                'error' => $e->getMessage(),
            ]);

            // Don't throw - allow deletion to succeed
        }
    }

    /**
     * Handle the SubscriptionPlan "restored" event.
     *
     * Reactivates the Stripe Product and Price.
     */
    public function restored(SubscriptionPlan $subscriptionPlan): void
    {
        // Only sync if Stripe is configured
        if (! $this->isStripeConfigured()) {
            return;
        }

        // Skip if no Stripe IDs exist
        if (! $subscriptionPlan->stripe_product_id) {
            return;
        }

        try {
            // Re-sync the plan to reactivate it
            $subscriptionPlan->is_active = true;
            $this->stripeService->syncPlan($subscriptionPlan);

            \Log::info('Stripe sync: Plan restored', [
                'plan_id' => $subscriptionPlan->id,
                'stripe_product_id' => $subscriptionPlan->stripe_product_id,
            ]);
        } catch (\Exception $e) {
            \Log::error('Stripe sync failed on plan restoration', [
                'plan_id' => $subscriptionPlan->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Check if Stripe is properly configured.
     */
    protected function isStripeConfigured(): bool
    {
        return ! empty(config('cashier.key')) && ! empty(config('cashier.secret'));
    }
}
