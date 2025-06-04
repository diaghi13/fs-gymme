<?php

namespace App\Models\PriceList;

use App\Casts\MoneyCast;
use App\Models\VatRate;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubscriptionContent extends Model
{
    /** @use HasFactory<\Database\Factories\PriceList\SubscriptionContentFactory> */
    use HasFactory,
        SoftDeletes;

    protected $fillable = [
        'subscription_id',
        'price_lists',
        'days_duration',
        'months_duration',
        'entrances',
        'price',
        'vat_rate_id',
        'is_optional',
        'daily_access',
        'weekly_access',
        'reservation_limit',
        'daily_reservation_limit',
        'price_listable',
        'price_listable_type',
        'price_listable_id',
    ];

    protected $casts = [
        'price' => MoneyCast::class,
        'days_duration' => 'integer',
        'month_duration' => 'integer',
        'entrances' => 'integer',
        'daily_access' => 'integer',
        'weekly_access' => 'integer',
        'reservation_limit' => 'integer',
        'daily_reservation_limit' => 'integer',
        'is_optional' => 'boolean',
    ];

    public function price_listable()
    {
        return $this->morphTo();
    }

    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }

    public function vat_rate()
    {
        return $this->belongsTo(VatRate::class);
    }
}
