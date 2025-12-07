<?php

namespace App\Models\Sale;

use App\Casts\MoneyCast;
use Illuminate\Database\Eloquent\Builder;
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

    protected $appends = [
        'status',
        'is_payed',
    ];

    public function payment_method()
    {
        return $this->belongsTo(\App\Models\Support\PaymentMethod::class);
    }

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function getStatusAttribute()
    {
        if ($this->payed_at) {
            return 'payed';
        }
        if ($this->due_date && $this->due_date->isPast()) {
            return 'expired';
        }

        return 'pending';
    }

    public function getIsPayedAttribute()
    {
        return $this->payed_at !== null;
    }

    public function scopeDailySum(Builder $query)
    {
        return $query->whereDate('payed_at', now('Europe/Rome'))->sum('amount') / 100;
    }

    public function scopePending(Builder $query)
    {
        return $query->whereDate('due_date', '<=', now('Europe/Rome'))
            ->whereNull('payed_at');
    }
}
