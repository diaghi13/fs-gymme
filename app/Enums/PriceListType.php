<?php

namespace App\Enums;

/**
 * Price List Type Enum
 *
 * Defines the types of commercial offerings in price lists.
 * This is the STI discriminator for PriceList model.
 */
enum PriceListType: string
{
    case FOLDER = 'folder';                     // Cartella organizzativa
    case ARTICLE = 'article';                   // Articolo vendibile (retail)
    case MEMBERSHIP = 'membership';             // Quota associativa
    case SUBSCRIPTION = 'subscription';         // Abbonamento (bundle di prodotti)
    case DAY_PASS = 'day_pass';                // Ingresso giornaliero
    case TOKEN = 'token';                       // Token/Carnet (crediti prepagati)
    case GIFT_CARD = 'gift_card';              // Carta regalo

    public function label(): string
    {
        return match ($this) {
            self::FOLDER => 'Cartella',
            self::ARTICLE => 'Articolo',
            self::MEMBERSHIP => 'Quota Associativa',
            self::SUBSCRIPTION => 'Abbonamento',
            self::DAY_PASS => 'Ingresso Giornaliero',
            self::TOKEN => 'Token/Carnet',
            self::GIFT_CARD => 'Carta Regalo',
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::FOLDER => 'i-heroicons-folder',
            self::ARTICLE => 'i-heroicons-shopping-bag',
            self::MEMBERSHIP => 'i-heroicons-user-group',
            self::SUBSCRIPTION => 'i-heroicons-credit-card',
            self::DAY_PASS => 'i-heroicons-calendar-days',
            self::TOKEN => 'i-heroicons-ticket',
            self::GIFT_CARD => 'i-heroicons-gift',
        };
    }

    /**
     * Check if this type is sellable (has a price)
     */
    public function isSellable(): bool
    {
        return match ($this) {
            self::FOLDER => false,
            default => true,
        };
    }

    /**
     * Check if this type can contain other products (composition)
     */
    public function canContainProducts(): bool
    {
        return $this === self::SUBSCRIPTION;
    }
}
