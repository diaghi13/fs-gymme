<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VatRateType extends Model
{
    protected $fillable = [
        'code',
        'type',
        'description',
        'order',
    ];

    /**
     * VAT rates of this type
     */
    public function vatRates()
    {
        return $this->hasMany(VatRate::class)->orderBy('order');
    }
}
