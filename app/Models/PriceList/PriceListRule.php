<?php

namespace App\Models\PriceList;

use App\Casts\MoneyCast;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PriceListRule extends Model
{
    /** @use HasFactory<\Database\Factories\PriceList\PriceListRuleFactory> */
    use HasFactory;

    protected $fillable = [
        'price_list_id',
        'rule_type',
        'customer_group_ids',
        'facility_ids',
        'valid_from_date',
        'valid_to_date',
        'valid_days_of_week',
        'valid_time_slots',
        'min_quantity',
        'max_quantity',
        'min_total_amount',
        'max_total_amount',
        'min_membership_months',
        'customer_registration_after',
        'custom_conditions',
        'priority',
        'can_combine_with_other_rules',
        'is_active'
    ];

    protected $casts = [
        'customer_group_ids' => 'array',
        'facility_ids' => 'array',
        'valid_days_of_week' => 'array',
        'valid_time_slots' => 'array',
        'custom_conditions' => 'array',
        'min_total_amount' => MoneyCast::class,
        'max_total_amount' => MoneyCast::class,
        'can_combine_with_other_rules' => 'boolean',
        'is_active' => 'boolean',
        'valid_from_date' => 'date',
        'valid_to_date' => 'date'
    ];

    public function priceList()
    {
        return $this->belongsTo(PriceList::class);
    }
}
