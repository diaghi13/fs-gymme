<?php

namespace App\Enums;

/**
 * Subscription Content Type Enum
 *
 * Defines valid types that can be included in subscription contents.
 * Split between PRODUCTS (catalog) and PRICELISTS (commercial offerings).
 */
enum SubscriptionContentType: string
{
    // PRODUCTS (Catalog - what we offer)
    case BaseProduct = 'App\\Models\\Product\\BaseProduct';
    case CourseProduct = 'App\\Models\\Product\\CourseProduct';
    case BookableService = 'App\\Models\\Product\\BookableService';

    // PRICELISTS (Commercial offerings - how we sell)
    case Article = 'App\\Models\\PriceList\\Article';
    case Membership = 'App\\Models\\PriceList\\Membership';
    case Token = 'App\\Models\\PriceList\\Token';
    case DayPass = 'App\\Models\\PriceList\\DayPass';
    case GiftCard = 'App\\Models\\PriceList\\GiftCard';

    /**
     * Get all valid content types as an array of strings
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Get a human-readable label for the type
     */
    public function label(): string
    {
        return match ($this) {
            self::BaseProduct => 'Prodotto Base',
            self::CourseProduct => 'Corso',
            self::BookableService => 'Servizio Prenotabile',
            self::Article => 'Articolo',
            self::Membership => 'Quota Associativa',
            self::Token => 'Pacchetto Token',
            self::DayPass => 'Ingresso Giornaliero',
            self::GiftCard => 'Carta Regalo',
        };
    }

    /**
     * Check if this type requires duration configuration
     */
    public function requiresDuration(): bool
    {
        return match ($this) {
            self::BaseProduct, self::CourseProduct, self::BookableService, self::Membership => true,
            default => false,
        };
    }

    /**
     * Check if this type supports entrance limits
     */
    public function supportsEntrances(): bool
    {
        return match ($this) {
            self::BaseProduct, self::CourseProduct, self::BookableService, self::Token => true,
            default => false,
        };
    }

    /**
     * Check if this type requires membership fee (should be mandatory in subscriptions)
     */
    public function isMembership(): bool
    {
        return $this === self::Membership;
    }

    /**
     * Check if this is a Product (catalog) type
     */
    public function isProduct(): bool
    {
        return in_array($this, [
            self::BaseProduct,
            self::CourseProduct,
            self::BookableService,
        ]);
    }

    /**
     * Check if this is a PriceList (commercial offering) type
     */
    public function isPriceList(): bool
    {
        return in_array($this, [
            self::Article,
            self::Membership,
            self::Token,
            self::DayPass,
            self::GiftCard,
        ]);
    }
}
