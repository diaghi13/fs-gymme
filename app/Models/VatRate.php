<?php

namespace App\Models;

use App\Casts\MoneyCast;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VatRate extends Model
{
    /** @use HasFactory<\Database\Factories\VatRateFactory> */
    use HasFactory;

    protected $fillable = [
        'code',
        'description',
        'percentage',
        'order',
        'nature',
        'is_active',
        'is_system',
        'visible_in_activity',
        'checkout_application',
        'vat_rate_type_id',
        'vat_rate_group_id',
    ];

    protected function casts(): array
    {
        return [
            'percentage' => MoneyCast::class,
            'visible_in_activity' => 'boolean',
            'checkout_application' => 'boolean',
            'is_active' => 'boolean',
            'is_system' => 'boolean',
        ];
    }

    public function vatRateType()
    {
        return $this->belongsTo(VatRateType::class);
    }

    public function vat_rate_type()
    {
        return $this->belongsTo(VatRateType::class);
    }

    public function vatRateGroup()
    {
        return $this->belongsTo(VatRateGroup::class);
    }

    public function vat_rate_group()
    {
        return $this->belongsTo(VatRateGroup::class);
    }
}
