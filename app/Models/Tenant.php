<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Cashier\Billable;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Database\Models\TenantPivot;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use Billable, HasDatabase, HasDomains, HasFactory;

    protected $guarded = [];

    protected $casts = [
        'id' => 'string',
        'is_active' => 'boolean',
        'is_demo' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'trial_ends_at' => 'datetime',
        'demo_expires_at' => 'datetime',
        'onboarding_completed_at' => 'datetime',
    ];

    /**
     * Check if onboarding has been completed.
     */
    public function hasCompletedOnboarding(): bool
    {
        return $this->onboarding_completed_at !== null;
    }

    /**
     * Mark onboarding as completed.
     */
    public function completeOnboarding(): void
    {
        $this->update(['onboarding_completed_at' => now()]);
    }

    public static function getCustomColumns(): array
    {
        return [
            'id',
            'name',
            'slug',
            'vat_number',
            'tax_code',
            'address',
            'city',
            'postal_code',
            'country',
            'phone',
            'email',
            'pec_email',
            'sdi_code',
            'is_active',
            'stripe_id',
            'pm_type',
            'pm_last_four',
            'trial_ends_at',
        ];
    }

    public function users()
    {
        return $this->belongsToMany(
            CentralUser::class,
            'tenant_users',
            'tenant_id',
            'global_user_id',
            'id',
            'global_id'
        )
            ->using(TenantPivot::class);
    }

    public function subscription_planes()
    {
        return $this->belongsToMany(
            SubscriptionPlan::class,
            'subscription_plan_tenant',
            'tenant_id',
            'subscription_plan_id'
        )
            ->withPivot(['is_active', 'trial_ends_at', 'ends_at'])
            ->using(SubscriptionPlanTenant::class);
    }

    public function active_subscription_plan()
    {
        return $this->belongsToMany(
            SubscriptionPlan::class,
            'subscription_plan_tenant',
            'tenant_id',
            'subscription_plan_id'
        )
            ->wherePivot('is_active', true)
            ->withPivot(['starts_at', 'ends_at', 'is_active', 'is_trial', 'trial_ends_at', 'status'])
            ->using(SubscriptionPlanTenant::class);
    }

    public function getActiveSubscriptionPlanAttribute()
    {
        return $this->active_subscription_plan()->first();
    }

    public function hasActiveSubscriptionPlan()
    {
        return $this->active_subscription_plan()->exists();
    }

    /**
     * Get the first user (owner) of the tenant.
     * Useful for testing and initial setup.
     */
    public function getOwnerAttribute(): ?CentralUser
    {
        return $this->users()->first();
    }

    /**
     * Addons purchased by this tenant.
     */
    public function addons()
    {
        return $this->hasMany(TenantAddon::class);
    }

    /**
     * Active addons only.
     */
    public function activeAddons()
    {
        return $this->addons()->active();
    }

    /**
     * Get addon for a specific feature.
     */
    public function getAddonForFeature(int $featureId): ?TenantAddon
    {
        return $this->activeAddons()
            ->where('plan_feature_id', $featureId)
            ->first();
    }

    /**
     * Check if this is a demo tenant.
     */
    public function isDemo(): bool
    {
        return $this->is_demo;
    }

    /**
     * Check if demo has expired.
     */
    public function demoHasExpired(): bool
    {
        if (! $this->is_demo) {
            return false;
        }

        return $this->demo_expires_at && $this->demo_expires_at->isPast();
    }

    /**
     * Get days remaining for demo.
     */
    public function demoRemainingDays(): ?int
    {
        if (! $this->is_demo || ! $this->demo_expires_at) {
            return null;
        }

        if ($this->demoHasExpired()) {
            return 0;
        }

        return (int) now()->diffInDays($this->demo_expires_at, false);
    }

    /**
     * Check if demo is expiring soon.
     */
    public function demoExpiringSoon(int $days = 3): bool
    {
        if (! $this->is_demo || ! $this->demo_expires_at) {
            return false;
        }

        $remaining = $this->demoRemainingDays();

        return $remaining !== null && $remaining > 0 && $remaining <= $days;
    }

    /**
     * Scope: Only demo tenants.
     */
    public function scopeDemo($query)
    {
        return $query->where('is_demo', true);
    }

    /**
     * Scope: Only expired demos.
     */
    public function scopeDemoExpired($query)
    {
        return $query->where('is_demo', true)
            ->where('demo_expires_at', '<=', now());
    }

    /**
     * Scope: Demos expiring soon.
     */
    public function scopeDemoExpiringSoon($query, int $days = 3)
    {
        return $query->where('is_demo', true)
            ->whereNotNull('demo_expires_at')
            ->whereBetween('demo_expires_at', [now(), now()->addDays($days)]);
    }

    //    protected $fillable = [
    //        'id',
    //        'name',
    //        'email',
    //        'database',
    //        'domain',
    //        'created_at',
    //        'updated_at',
    //    ];
    //
    //    protected $casts = [
    //        'id' => 'string',
    //        'created_at' => 'datetime',
    //        'updated_at' => 'datetime',
    //    ];
}
