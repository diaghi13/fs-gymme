<?php

namespace App\Models\PriceList;

use App\Casts\MoneyCast;
use App\Contracts\VatRateable;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Parental\HasParent;

/**
 * Token Model
 *
 * Represents prepaid credits/tokens (carnets) that can be used
 * for multiple entries or services.
 *
 * Examples:
 * - 10-entry carnet
 * - 20-class package
 * - Credit package for various services
 */
class Token extends PriceList implements VatRateable
{
    use HasParent;

    protected $fillable = [
        'structure_id',
        'name',
        'color',
        'saleable',
        'parent_id',
        'saleable_from',
        'saleable_to',
        'price',
        'vat_rate_id',
        'token_quantity',
        'validity_days',
        'validity_months',
        'settings',
    ];

    protected $casts = [
        'price' => MoneyCast::class,
        'saleable' => 'boolean',
        'saleable_from' => 'date',
        'saleable_to' => 'date',
        'vat_rate_id' => 'integer',
        'parent_id' => 'integer',
        'token_quantity' => 'integer',
        'validity_days' => 'integer',
        'validity_months' => 'integer',
        'settings' => 'array',
    ];

    public function subscription_content(): MorphOne
    {
        return $this->morphOne(SubscriptionContent::class, 'price_listable');
    }

    /**
     * Default settings for tokens/carnets
     */
    protected function getTypeSpecificSettingsDefaults(): array
    {
        return [
            'usage' => [
                'applicable_to' => [],           // Product IDs this token can be used for
                'all_products' => false,         // Can be used for any product
                'requires_booking' => true,
                'auto_deduct' => true,          // Automatically deduct on usage
            ],
            'validity' => [
                'starts_on_purchase' => true,   // Validity starts on purchase date
                'starts_on_first_use' => false, // Validity starts on first use
                'expires_if_unused' => true,
            ],
            'restrictions' => [
                'max_per_day' => null,
                'blackout_dates' => [],
                'transferable' => false,         // Can be transferred to another person
            ],
        ];
    }
}
