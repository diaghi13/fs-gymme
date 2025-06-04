<?php

namespace App\Models\Support;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    /** @use HasFactory<\Database\Factories\Support\PaymentMethodFactory> */
    use HasFactory;

    protected $fillable = [
        'id',
        'description',
        'code',
        'order',
    ];

    public function getLabelAttribute()
    {
        return $this->code . ' - ' . $this->description;
    }

    public function payment_conditions()
    {
        return $this->hasMany(PaymentCondition::class);
    }
}
