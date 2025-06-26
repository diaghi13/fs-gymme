<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Pivot;

class SubscriptionPlanTenant extends Pivot
{
    protected $table = 'subscription_plan_tenant';

    protected $fillable = [
        'tenant_id',
        'subscription_plan_id',
        'is_active',
        'trial_ends_at',
        'ends_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'trial_ends_at' => 'datetime',
        'ends_at' => 'datetime',
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
