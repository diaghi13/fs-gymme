<?php

namespace App\Models\Customer;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerSubscription extends Model
{
    /** @use HasFactory<\Database\Factories\Customer\CustomerSubscriptionFactory> */
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'sale_row_id',
        'type',
        'price_list_id',
        'entitable_type',
        'entitable_id',
        'start_date',
        'end_date',
        'card_number',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function customer()
    {
        return $this->belongsTo(\App\Models\Customer\Customer::class);
    }

    public function sale_row()
    {
        return $this->belongsTo(\App\Models\Sale\SaleRow::class);
    }

    public function price_list()
    {
        return $this->belongsTo(\App\Models\PriceList\PriceList::class);
    }

    public function entity()
    {
        return $this->morphTo('entity', 'entitable_type', 'entitable_id');
    }
}
