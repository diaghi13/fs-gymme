<?php

namespace App\Enums;

/**
 * Product Type Enum
 *
 * Defines the types of SERVICES/PRODUCTS in the catalog.
 * Products = what we physically offer (catalog)
 * PriceList = how we sell them (commercial offerings)
 *
 * This is the STI discriminator for Product model.
 */
enum ProductType: string
{
    case BASE_PRODUCT = 'base_product';             // Prodotto base (es. sala pesi, piscina, sauna)
    case COURSE = 'course';                         // Corso di gruppo (es. yoga, pilates, spinning)
    case BOOKABLE_SERVICE = 'bookable_service';     // Servizio prenotabile (es. PT, massaggio, consulenza)

    public function label(): string
    {
        return match ($this) {
            self::BASE_PRODUCT => 'Prodotto Base',
            self::COURSE => 'Corso',
            self::BOOKABLE_SERVICE => 'Servizio Prenotabile',
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::BASE_PRODUCT => 'i-heroicons-building-office',
            self::COURSE => 'i-heroicons-academic-cap',
            self::BOOKABLE_SERVICE => 'i-heroicons-calendar-days',
        };
    }

    /**
     * Check if this product type requires booking
     */
    public function requiresBooking(): bool
    {
        return match ($this) {
            self::COURSE => true,
            self::BOOKABLE_SERVICE => true,
            self::BASE_PRODUCT => false,
        };
    }

    /**
     * Check if this product type supports scheduling
     */
    public function supportsScheduling(): bool
    {
        return match ($this) {
            self::BASE_PRODUCT => true,  // Operating hours
            self::COURSE => true,         // Weekly timetable
            self::BOOKABLE_SERVICE => true, // Available slots
        };
    }
}
