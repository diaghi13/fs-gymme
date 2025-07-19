<?php

namespace App\Models;

use Laravel\Cashier\Billable;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;
use Stancl\Tenancy\Database\Models\TenantPivot;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains, Billable;

    protected $guarded = [];

    protected $casts = [
        'id' => 'string',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

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
