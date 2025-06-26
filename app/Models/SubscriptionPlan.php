<?php

namespace App\Models;

use App\Casts\MoneyCast;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionPlan extends Model
{
    /** @use HasFactory<\Database\Factories\SubscriptionPlanFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'currency',
        'interval',
        'trial_days',
        'is_active',
    ];

    protected $casts = [
        'price' => MoneyCast::class,
        'is_active' => 'boolean',
    ];

    public function tenants()
    {
        return $this->belongsToMany(
            Tenant::class,
            'subscription_plan_tenant',
            'subscription_plan_id',
            'tenant_id'
        )->withPivot(['is_active', 'trial_ends_at', 'ends_at'])
            ->using(SubscriptionPlanTenant::class);
    }
}
