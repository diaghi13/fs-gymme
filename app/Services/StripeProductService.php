<?php

namespace App\Services;

use App\Models\SubscriptionPlan;
use Laravel\Cashier\Cashier;
use Stripe\Exception\ApiErrorException;

/**
 * Service for syncing subscription plans with Stripe.
 *
 * Handles creation, updating, and archiving of Stripe Products and Prices.
 *
 * Important Stripe Concepts:
 * - Products: represent the service you're offering (e.g., "Gold Plan")
 * - Prices: immutable pricing configuration for a product (e.g., €69/month)
 * - Prices cannot be modified, only archived and recreated
 * - Products and Prices should be archived (active: false) not deleted
 */
class StripeProductService
{
    /**
     * Sync a subscription plan to Stripe.
     *
     * Creates or updates the Stripe Product and Price.
     */
    public function syncPlan(SubscriptionPlan $plan): void
    {
        $stripe = Cashier::stripe();

        try {
            // Step 1: Create or update the Stripe Product
            if ($plan->stripe_product_id) {
                // Update existing product
                $product = $stripe->products->update($plan->stripe_product_id, [
                    'name' => $plan->name,
                    'description' => $plan->description,
                    'active' => $plan->is_active,
                    'metadata' => $this->buildProductMetadata($plan),
                ]);
            } else {
                // Create new product
                $product = $stripe->products->create([
                    'name' => $plan->name,
                    'description' => $plan->description,
                    'active' => $plan->is_active,
                    'metadata' => $this->buildProductMetadata($plan),
                ]);

                // Save product ID
                $plan->update(['stripe_product_id' => $product->id]);
            }

            // Step 2: Handle Price
            $this->syncPrice($plan, $product->id);
        } catch (ApiErrorException $e) {
            \Log::error('Stripe sync error for plan '.$plan->id, [
                'error' => $e->getMessage(),
                'plan' => $plan->toArray(),
            ]);

            throw $e;
        }
    }

    /**
     * Sync the price for a subscription plan.
     *
     * Prices are immutable in Stripe. If the price changes:
     * 1. Archive the old price (set active: false)
     * 2. Create a new price with the new amount
     */
    protected function syncPrice(SubscriptionPlan $plan, string $productId): void
    {
        $stripe = Cashier::stripe();

        // Check if price needs to be created or recreated
        $needsNewPrice = $this->needsNewPrice($plan);

        if ($needsNewPrice) {
            // Archive old price if exists
            if ($plan->stripe_price_id) {
                try {
                    $stripe->prices->update($plan->stripe_price_id, [
                        'active' => false,
                    ]);
                } catch (ApiErrorException $e) {
                    // Price might not exist, continue
                    \Log::warning('Could not archive old price', [
                        'price_id' => $plan->stripe_price_id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            // Create new price
            $price = $stripe->prices->create([
                'product' => $productId,
                'currency' => strtolower($plan->currency),
                'unit_amount' => $plan->getRawOriginal('price'), // Get cents from DB
                'recurring' => [
                    'interval' => $plan->interval,
                ],
                'active' => $plan->is_active,
                'metadata' => [
                    'plan_id' => $plan->id,
                    'tier' => $plan->tier?->value,
                    'trial_days' => $plan->trial_days,
                ],
            ]);

            // Update plan with new price ID
            $plan->update(['stripe_price_id' => $price->id]);
        } elseif ($plan->stripe_price_id) {
            // Just update the active status if price hasn't changed
            try {
                $stripe->prices->update($plan->stripe_price_id, [
                    'active' => $plan->is_active,
                ]);
            } catch (ApiErrorException $e) {
                \Log::warning('Could not update price active status', [
                    'price_id' => $plan->stripe_price_id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Check if a new price needs to be created.
     *
     * A new price is needed if:
     * - No stripe_price_id exists yet
     * - The price amount has changed
     * - The currency has changed
     * - The interval has changed
     */
    protected function needsNewPrice(SubscriptionPlan $plan): bool
    {
        // No price exists yet
        if (! $plan->stripe_price_id) {
            return true;
        }

        // Check if price-related fields have changed
        if ($plan->isDirty(['price', 'currency', 'interval'])) {
            return true;
        }

        return false;
    }

    /**
     * Build metadata for the Stripe Product.
     *
     * Includes plan information and features.
     */
    protected function buildProductMetadata(SubscriptionPlan $plan): array
    {
        $metadata = [
            'plan_id' => $plan->id,
            'slug' => $plan->slug,
            'tier' => $plan->tier?->value ?? '',
            'trial_days' => $plan->trial_days,
            'sort_order' => $plan->sort_order ?? 0,
        ];

        // Add features count
        $featuresCount = $plan->features()->count();
        $metadata['features_count'] = $featuresCount;

        return $metadata;
    }

    /**
     * Archive a subscription plan in Stripe.
     *
     * Sets both Product and Price to inactive.
     */
    public function archivePlan(SubscriptionPlan $plan): void
    {
        $stripe = Cashier::stripe();

        try {
            // Archive product
            if ($plan->stripe_product_id) {
                $stripe->products->update($plan->stripe_product_id, [
                    'active' => false,
                ]);
            }

            // Archive price
            if ($plan->stripe_price_id) {
                $stripe->prices->update($plan->stripe_price_id, [
                    'active' => false,
                ]);
            }
        } catch (ApiErrorException $e) {
            \Log::error('Stripe archive error for plan '.$plan->id, [
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Sync all active subscription plans to Stripe.
     *
     * Useful for initial setup or bulk sync.
     */
    public function syncAllPlans(): array
    {
        $results = [
            'synced' => [],
            'failed' => [],
        ];

        $plans = SubscriptionPlan::all();

        foreach ($plans as $plan) {
            try {
                $this->syncPlan($plan);
                $results['synced'][] = $plan->id;
            } catch (\Exception $e) {
                $results['failed'][] = [
                    'plan_id' => $plan->id,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }
}
