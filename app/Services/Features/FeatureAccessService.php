<?php

namespace App\Services\Features;

use App\Models\PlanFeature;
use App\Models\Tenant;
use Illuminate\Support\Facades\Cache;

/**
 * Service for managing feature access and quota limits for tenants.
 *
 * This service determines:
 * - Whether a tenant can use a specific feature
 * - What quota limit applies (from plan or addon)
 * - How much of the quota has been used
 * - How much quota remains
 */
class FeatureAccessService
{
    /**
     * Check if tenant can use a feature.
     *
     * Returns true if:
     * - Feature is included in tenant's active plan, OR
     * - Tenant has an active addon for the feature
     */
    public function canUse(Tenant $tenant, string $featureName): bool
    {
        // Check if feature exists
        $feature = $this->getFeature($featureName);
        if (! $feature) {
            return false;
        }

        // Check if included in plan
        if ($this->isIncludedInPlan($tenant, $feature->id)) {
            return true;
        }

        // Check if has active addon
        if ($this->hasActiveAddon($tenant, $feature->id)) {
            return true;
        }

        return false;
    }

    /**
     * Get the quota limit for a feature.
     *
     * Returns:
     * - null = unlimited
     * - integer = quota limit
     * - 0 = not available
     */
    public function getQuota(Tenant $tenant, string $featureName): ?int
    {
        $feature = $this->getFeature($featureName);
        if (! $feature) {
            return 0;
        }

        // Check plan feature first
        $planQuota = $this->getPlanQuota($tenant, $feature->id);
        if ($planQuota !== null) {
            return $planQuota;
        }

        // Check addon quota
        $addonQuota = $this->getAddonQuota($tenant, $feature->id);
        if ($addonQuota !== null) {
            return $addonQuota;
        }

        return 0; // Not available
    }

    /**
     * Get current usage of a feature quota.
     *
     * Tracks actual usage based on feature type:
     * - electronic_invoicing: count invoices this month
     * - multi_location: count active structures
     * - unlimited_users: count active users
     * - unlimited_customers: count active customers
     */
    public function getUsage(Tenant $tenant, string $featureName): int
    {
        // Initialize tenant context to access tenant data
        tenancy()->initialize($tenant);

        try {
            return match ($featureName) {
                'electronic_invoicing' => $this->getElectronicInvoicingUsage(),
                'multi_location' => $this->getMultiLocationUsage(),
                'unlimited_users' => $this->getUnlimitedUsersUsage(),
                'unlimited_customers' => $this->getUnlimitedCustomersUsage(),
                default => 0,
            };
        } finally {
            tenancy()->end();
        }
    }

    /**
     * Get electronic invoicing usage (invoices this month).
     */
    protected function getElectronicInvoicingUsage(): int
    {
        if (! class_exists(\App\Models\Sale\ElectronicInvoice::class)) {
            return 0;
        }

        return \App\Models\Sale\ElectronicInvoice::query()
            ->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->count();
    }

    /**
     * Get multi-location usage (active structures).
     */
    protected function getMultiLocationUsage(): int
    {
        if (! class_exists(\App\Models\Structure::class)) {
            return 0;
        }

        return \App\Models\Structure::query()->count();
    }

    /**
     * Get unlimited users usage (active staff users).
     */
    protected function getUnlimitedUsersUsage(): int
    {
        if (! class_exists(\App\Models\User::class)) {
            return 0;
        }

        // Count users excluding customers (assuming customers have 'customer' role)
        return \App\Models\User::query()
            ->whereDoesntHave('roles', function ($query) {
                $query->where('name', 'customer');
            })
            ->count();
    }

    /**
     * Get unlimited customers usage (active customers).
     */
    protected function getUnlimitedCustomersUsage(): int
    {
        if (! class_exists(\App\Models\Customer\Customer::class)) {
            return 0;
        }

        return \App\Models\Customer\Customer::query()->count();
    }

    /**
     * Get remaining quota for a feature.
     */
    public function getRemainingQuota(Tenant $tenant, string $featureName): ?int
    {
        $quota = $this->getQuota($tenant, $featureName);

        // Unlimited
        if ($quota === null) {
            return null;
        }

        // Not available
        if ($quota === 0) {
            return 0;
        }

        $usage = $this->getUsage($tenant, $featureName);

        return max(0, $quota - $usage);
    }

    /**
     * Check if tenant has access to feature (has it AND has remaining quota).
     */
    public function hasAccess(Tenant $tenant, string $featureName): bool
    {
        if (! $this->canUse($tenant, $featureName)) {
            return false;
        }

        $remaining = $this->getRemainingQuota($tenant, $featureName);

        // Unlimited
        if ($remaining === null) {
            return true;
        }

        // Has remaining quota
        return $remaining > 0;
    }

    /**
     * Check if tenant is approaching quota limit.
     *
     * @param  int  $threshold  Percentage threshold (default 80%)
     */
    public function isApproachingLimit(Tenant $tenant, string $featureName, int $threshold = 80): bool
    {
        $quota = $this->getQuota($tenant, $featureName);

        // Unlimited or not available
        if ($quota === null || $quota === 0) {
            return false;
        }

        $usage = $this->getUsage($tenant, $featureName);
        $percentage = ($usage / $quota) * 100;

        return $percentage >= $threshold;
    }

    /**
     * Check if tenant has exceeded quota.
     */
    public function hasExceededQuota(Tenant $tenant, string $featureName): bool
    {
        $remaining = $this->getRemainingQuota($tenant, $featureName);

        // Unlimited
        if ($remaining === null) {
            return false;
        }

        return $remaining <= 0;
    }

    /**
     * Get all features available to tenant.
     *
     * Returns array of features with their status and limits.
     */
    public function getAvailableFeatures(Tenant $tenant): array
    {
        $features = [];
        $allFeatures = PlanFeature::active()->get();

        foreach ($allFeatures as $feature) {
            $canUse = $this->canUse($tenant, $feature->name);
            $quota = $canUse ? $this->getQuota($tenant, $feature->name) : 0;
            $usage = $canUse ? $this->getUsage($tenant, $feature->name) : 0;

            $features[] = [
                'feature' => $feature,
                'can_use' => $canUse,
                'quota' => $quota,
                'usage' => $usage,
                'remaining' => $quota !== null ? max(0, $quota - $usage) : null,
                'is_unlimited' => $quota === null,
                'source' => $this->getFeatureSource($tenant, $feature->id),
            ];
        }

        return $features;
    }

    /**
     * Get feature source (plan or addon).
     */
    protected function getFeatureSource(Tenant $tenant, int $featureId): ?string
    {
        if ($this->isIncludedInPlan($tenant, $featureId)) {
            return 'plan';
        }

        if ($this->hasActiveAddon($tenant, $featureId)) {
            return 'addon';
        }

        return null;
    }

    /**
     * Get feature by name (cached).
     */
    protected function getFeature(string $name): ?PlanFeature
    {
        return Cache::remember(
            "feature:{$name}",
            now()->addHours(24),
            fn () => PlanFeature::where('name', $name)->first()
        );
    }

    /**
     * Check if feature is included in tenant's plan.
     */
    protected function isIncludedInPlan(Tenant $tenant, int $featureId): bool
    {
        if (! $tenant->hasActiveSubscriptionPlan()) {
            return false;
        }

        $planFeature = $tenant->active_subscription_plan
            ->features()
            ->where('plan_feature_id', $featureId)
            ->wherePivot('is_included', true)
            ->first();

        return $planFeature !== null;
    }

    /**
     * Get quota from plan.
     */
    protected function getPlanQuota(Tenant $tenant, int $featureId): ?int
    {
        if (! $tenant->hasActiveSubscriptionPlan()) {
            return null;
        }

        $planFeature = $tenant->active_subscription_plan
            ->features()
            ->where('plan_feature_id', $featureId)
            ->wherePivot('is_included', true)
            ->first();

        if (! $planFeature) {
            return null;
        }

        return $planFeature->pivot->quota_limit;
    }

    /**
     * Check if tenant has active addon for feature.
     */
    protected function hasActiveAddon(Tenant $tenant, int $featureId): bool
    {
        return $tenant->activeAddons()
            ->where('plan_feature_id', $featureId)
            ->exists();
    }

    /**
     * Get quota from addon.
     */
    protected function getAddonQuota(Tenant $tenant, int $featureId): ?int
    {
        $addon = $tenant->activeAddons()
            ->where('plan_feature_id', $featureId)
            ->first();

        return $addon?->quota_limit;
    }
}
