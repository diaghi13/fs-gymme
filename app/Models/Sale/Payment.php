<?php

namespace App\Models\Sale;

use App\Casts\MoneyCast;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    /** @use HasFactory<\Database\Factories\Sale\PaymentFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'sale_id',
        'due_date',
        'amount',
        'payment_method_id',
        'payed_at',
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'payed_at' => 'datetime',
        'amount' => MoneyCast::class,
    ];

    public function payment_method()
    {
        return $this->belongsTo(\App\Models\Support\PaymentMethod::class);
    }
}
