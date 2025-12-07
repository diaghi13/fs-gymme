<?php

namespace App\Models;

use App\Casts\MoneyCast;
use Illuminate\Database\Eloquent\Relations\Pivot;

class SubscriptionPlanFeature extends Pivot
{
    protected $table = 'subscription_plan_features';

    protected $casts = [
        'is_included' => 'boolean',
        'quota_limit' => 'integer',
        'price' => MoneyCast::class,
    ];
}
