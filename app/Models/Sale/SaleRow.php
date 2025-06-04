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
        'unit_price',
        'percentage_discount',
        'absolute_discount',
        'vat_rate_id',
        'total',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => MoneyCast::class,
        'percentage_discount' => MoneyCast::class,
        'absolute_discount' => MoneyCast::class,
        'total' => MoneyCast::class,
        'start_date' => 'date',
        'end_date' => 'date',
    ];

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
}
