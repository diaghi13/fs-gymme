<?php

namespace App\Models\PriceList;

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
class Token extends PriceList
{
    use HasParent;

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