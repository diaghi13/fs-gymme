<?php

namespace App\Models\PriceList;

use App\Enums\PriceListItemTypeEnum;
use Parental\HasParent;

class Subscription extends PriceList
{
    use HasParent;

    // All fields are inherited from parent PriceList model via STI
    // No need to redefine $fillable and $casts

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
