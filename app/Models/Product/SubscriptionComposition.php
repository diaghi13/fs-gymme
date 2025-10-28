<?php

namespace App\Models\Product;

use App\Casts\MoneyCast;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionComposition extends Model
{
    /** @use HasFactory<\Database\Factories\Product\SubscriptionCompositionFactory> */
    use HasFactory;

    protected $fillable = [
        'subscription_product_id',
        'included_product_id',
        'quantity',
        'max_uses',
        'unlimited_uses',
        'validity_from_day',
        'validity_to_day',
        'validity_type',
        'is_included_in_base_price',
        'additional_cost',
        'cost_per_use',
        'requires_booking',
        'booking_advance_days',
        'cancellation_hours',
        'max_uses_per_day',
        'max_uses_per_week',
        'max_uses_per_month',
        'allowed_days',
        'allowed_time_slots',
        'allowed_time_slot_tolerance_in_minutes',
        'blackout_dates',
        'priority',
        'sort_order',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'subscription_product_id' => 'integer',
        'included_product_id' => 'integer',
        'quantity' => 'integer',
        'max_uses' => 'integer',
        'unlimited_uses' => 'boolean',
        'validity_from_day' => 'integer',
        'validity_to_day' => 'integer',
        'is_included_in_base_price' => 'boolean',
        'additional_cost' => MoneyCast::class,
        'cost_per_use' => MoneyCast::class,
        'requires_booking' => 'boolean',
        'booking_advance_days' => 'integer',
        'cancellation_hours' => 'integer',
        'max_uses_per_day' => 'integer',
        'max_uses_per_week' => 'integer',
        'max_uses_per_month' => 'integer',
        'allowed_days' => 'array',
        'allowed_time_slots' => 'array',
        'allowed_time_slot_tolerance_in_minutes' => 'integer',
        'blackout_dates' => 'array',
        'priority' => 'integer',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];
}
