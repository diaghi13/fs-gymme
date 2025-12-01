<?php

namespace App\Models;

use App\Casts\MoneyCast;
use App\Enums\FeatureType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class PlanFeature extends Model
{
    protected $fillable = [
        'name',
        'display_name',
        'description',
        'feature_type',
        'is_addon_purchasable',
        'default_addon_price_cents',
        'default_addon_quota',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'feature_type' => FeatureType::class,
            'is_addon_purchasable' => 'boolean',
            'is_active' => 'boolean',
            'default_addon_price_cents' => MoneyCast::class,
        ];
    }

    /**
     * Subscription plans that include this feature.
     */
    public function subscriptionPlans(): BelongsToMany
    {
        return $this->belongsToMany(SubscriptionPlan::class, 'subscription_plan_features')
            ->withPivot(['is_included', 'quota_limit', 'price_cents'])
            ->withTimestamps();
    }

    /**
     * Alias for subscriptionPlans() relationship.
     */
    public function plans(): BelongsToMany
    {
        return $this->subscriptionPlans();
    }

    /**
     * Tenants that have purchased this feature as an addon.
     */
    public function tenantAddons(): BelongsToMany
    {
        return $this->belongsToMany(Tenant::class, 'tenant_addons')
            ->withPivot(['quota_limit', 'price_cents', 'starts_at', 'ends_at', 'is_active', 'stripe_subscription_item_id', 'payment_method', 'status'])
            ->withTimestamps();
    }

    /**
     * Scope: Only active features.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Only features purchasable as addons.
     */
    public function scopeAddonPurchasable($query)
    {
        return $query->where('is_addon_purchasable', true);
    }
}
