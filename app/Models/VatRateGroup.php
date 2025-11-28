<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VatRateGroup extends Model
{
    protected $fillable = [
        'code',
        'group',
        'description',
        'order',
    ];

    /**
     * VAT rates in this group
     */
    public function vatRates()
    {
        return $this->hasMany(VatRate::class)->orderBy('order');
    }
}
