<?php

namespace App\Models\PriceList;

use App\Casts\MoneyCast;
use App\Models\Product\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PriceListItem extends Model
{
    /** @use HasFactory<\Database\Factories\PriceList\PriceListItemFactory> */
    use HasFactory;

    protected $fillable = [
        'price_list_id',
        'product_id',
        'base_price',
        'discount_percentage',
        'discount_amount',
        'final_price',
        'price_source',
        'inherited_from_list_id',
        'price_calculation_method',
        'price_formula',
        'markup_percentage',
        'markup_amount',
        'min_quantity',
        'max_quantity',
        'volume_discount_percentage',
        'seasonal_adjustment',
        'peak_hours_surcharge',
        'payment_options',
        'installment_available',
        'installment_months',
        'installment_surcharge',
        'is_locked',
        'lock_reason',
        'valid_from',
        'valid_to',
        'is_active',
        'last_updated_by',
        'last_update_reason'
    ];

    protected $casts = [
        'base_price' => MoneyCast::class,
        'discount_percentage' => MoneyCast::class,
        'discount_amount' => MoneyCast::class,
        'final_price' => MoneyCast::class,
        'markup_percentage' => MoneyCast::class,
        'markup_amount' => MoneyCast::class,
        'volume_discount_percentage' => MoneyCast::class,
        'seasonal_adjustment' => MoneyCast::class,
        'peak_hours_surcharge' => MoneyCast::class,
        'installment_surcharge' => MoneyCast::class,
        'payment_options' => 'array',
        'installment_available' => 'boolean',
        'is_locked' => 'boolean',
        'is_active' => 'boolean',
        'valid_from' => 'date',
        'valid_to' => 'date'
    ];

    public function priceList()
    {
        return $this->belongsTo(PriceList::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function inheritedFromList()
    {
        return $this->belongsTo(PriceList::class, 'inherited_from_list_id');
    }

    public function lastUpdatedBy()
    {
        return $this->belongsTo(User::class, 'last_updated_by');
    }
}
