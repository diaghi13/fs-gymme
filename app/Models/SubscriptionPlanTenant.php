<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class SubscriptionPlanTenant extends Pivot
{
    protected $table = 'subscription_plan_tenant';

    protected $fillable = [
        'tenant_id',
        'subscription_plan_id',
        'starts_at',
        'ends_at',
        'is_active',
        'is_trial',
        'status',
        'trial_ends_at',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'trial_ends_at' => 'datetime',
        'is_active' => 'boolean',
        'is_trial' => 'boolean',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function subscriptionPlan()
    {
        return $this->belongsTo(SubscriptionPlan::class);
    }
}
