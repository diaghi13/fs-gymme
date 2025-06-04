<?php

namespace App\Models\PriceList;

use App\Enums\PriceListItemTypeEnum;
use Parental\HasParent;

class Subscription extends PriceList
{
    use HasParent;

    protected $fillable = [
        "name",
        "color",
        "saleable",
        "parent_id",
        "saleable_from",
        "saleable_to",
    ];

    protected $casts = [
        'saleable' => 'boolean',
        'parent_id' => 'integer',
        'saleable_from' => 'date',
        'saleable_to' => 'date',
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
