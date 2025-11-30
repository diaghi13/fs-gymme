<?php

namespace App\Models\PriceList;

use App\Casts\MoneyCast;
use App\Contracts\VatRateable;
use App\Enums\PriceListItemTypeEnum;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Parental\HasParent;

/**
 * GiftCard Model
 *
 * Represents gift cards that can be purchased and redeemed
 * for services or products at the gym.
 */
class GiftCard extends PriceList implements VatRateable
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
        'validity_months',
    ];

    protected $casts = [
        'price' => MoneyCast::class,
        'saleable' => 'boolean',
        'saleable_from' => 'date',
        'saleable_to' => 'date',
        'vat_rate_id' => 'integer',
        'parent_id' => 'integer',
        'validity_months' => 'integer',
    ];

    protected $attributes = [
        'type' => PriceListItemTypeEnum::GIFT_CARD->value,
    ];

    public function subscription_content(): MorphOne
    {
        return $this->morphOne(SubscriptionContent::class, 'price_listable');
    }

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
