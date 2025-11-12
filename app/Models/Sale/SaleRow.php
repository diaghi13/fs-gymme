<?php

namespace App\Models\Sale;

use App\Casts\MoneyCast;
use App\Models\PriceList\PriceList;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaleRow extends Model
{
    /** @use HasFactory<\Database\Factories\Support\SaleRowFactory> */
    use HasFactory, \Illuminate\Database\Eloquent\SoftDeletes;

    protected $fillable = [
        'sale_id',
        'price_list_id',
        'entitable_type',
        'entitable_id',
        'description',
        'quantity',
        'unit_price_net',
        'unit_price_gross',
        'percentage_discount',
        'absolute_discount',
        'vat_rate_id',
        'vat_amount',
        'total_net',
        'total_gross',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price_net' => MoneyCast::class,
        'unit_price_gross' => MoneyCast::class,
        'percentage_discount' => MoneyCast::class,
        'absolute_discount' => MoneyCast::class,
        'vat_rate_id' => 'integer',
        'vat_amount' => MoneyCast::class,
        'total_net' => MoneyCast::class,
        'total_gross' => MoneyCast::class,
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public static function boot()
    {
        parent::boot();

        parent::observe(\App\Observers\SaleRowObserver::class);
    }

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function price_list()
    {
        return $this->belongsTo(PriceList::class);
    }

    public function vat_rate()
    {
        return $this->belongsTo(\App\Models\VatRate::class, 'vat_rate_id');
    }

    public function entity()
    {
        return $this->morphTo('entitable', 'entitable_type', 'entitable_id');
    }

    public function customer_subscription()
    {
        return $this->hasOne(\App\Models\Customer\CustomerSubscription::class, 'sale_row_id');
    }
}
