<?php

namespace App\Models\PriceList;

use App\Casts\MoneyCast;
use App\Contracts\PriceListContract;
use App\Contracts\VatRateable;
use App\Enums\PriceListItemTypeEnum;
use App\Models\VatRate;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Parental\HasParent;
use Spatie\Activitylog\Traits\LogsActivity;

class Article extends PriceList implements VatRateable
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
        'price',
        'vat_rate_id'
    ];

    protected $casts = [
        'price' => MoneyCast::class,
        'saleable' => 'boolean',
        'saleable_from' => 'date',
        'saleable_to' => 'date',
        'vat_rate_id' => 'integer',
        'parent_id' => 'integer',
    ];

    protected $attributes = [
        'type' => PriceListItemTypeEnum::ARTICLE->value,
    ];

    public function subscription_content(): MorphOne
    {
        return $this->morphOne(SubscriptionContent::class, 'price_listable');
    }
}
