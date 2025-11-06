<?php

namespace App\Models\PriceList;

use App\Enums\PriceListItemTypeEnum;
use Parental\HasParent;

class Subscription extends PriceList
{
    use HasParent;

    protected $fillable = [
        "structure_id",
        "name",
        "color",
        "saleable",
        "parent_id",
        "saleable_from",
        "saleable_to",
        "guest_passes_total",
        "guest_passes_per_month",
        "multi_location_access",
    ];

    protected $casts = [
        'saleable' => 'boolean',
        'parent_id' => 'integer',
        'saleable_from' => 'date',
        'saleable_to' => 'date',
        'guest_passes_total' => 'integer',
        'guest_passes_per_month' => 'integer',
        'multi_location_access' => 'boolean',
    ];

    protected $attributes = [
        'type' => PriceListItemTypeEnum::SUBSCRIPTION->value,
    ];

    public function content()
    {
        return $this->hasMany(SubscriptionContent::class, 'subscription_id');
    }

    public function standard_content()
    {
        return $this->hasMany(SubscriptionContent::class, 'subscription_id')
            ->where('is_optional', false);
    }

    public function optional_content()
    {
        return $this->hasMany(SubscriptionContent::class, 'subscription_id')
            ->where('is_optional', true);
    }
}
