<?php

namespace App\Models\PriceList;

use Parental\HasParent;

/**
 * GiftCard Model
 *
 * Represents gift cards that can be purchased and redeemed
 * for services or products at the gym.
 */
class GiftCard extends PriceList
{
    use HasParent;

    /**
     * Default settings for gift cards
     */
    protected function getTypeSpecificSettingsDefaults(): array
    {
        return [
            'redemption' => [
                'redeemable_for' => 'anything',  // 'anything', 'products', 'subscriptions', 'services'
                'partial_redemption' => true,    // Can use part of value
                'combine_with_other_payments' => true,
                'code_format' => 'GIFT-XXXX-XXXX', // Format for gift card codes
            ],
            'validity' => [
                'never_expires' => false,
                'expiry_months' => 12,
            ],
            'restrictions' => [
                'transferable' => true,
                'refundable' => false,
                'can_purchase_gift_cards' => false, // Can gift cards be used to buy gift cards
            ],
            'display' => [
                'physical_card_available' => false,
                'custom_message' => true,
                'email_delivery' => true,
            ],
        ];
    }
}