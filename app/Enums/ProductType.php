<?php

namespace App\Enums;

enum ProductType: string
{
    case SERVICE = 'service';                       // Servizio singolo (es. massaggio, consulenza)
    case BASE_PRODUCT = 'base_product';             // Prodotto base (es. sala pesi, piscina)
    case COURSE = 'course';                         // Corso (es. yoga, pilates)
    case PERSONAL_TRAINING = 'personal_training';   // Allenamento personale
    case SUBSCRIPTION = 'subscription';             // Abbonamento (contiene altri prodotti)
    case ARTICLE = 'article';                       // Articolo (es. attrezzatura, abbigliamento)
    case MEMBERSHIP_FEE = 'membership_fee';         // Quota associativa
    case DAY_PASS = 'day_pass';                     // Ingresso giornaliero
    case TOKEN = 'token';                           // Token (es. buono, credito)
    case RENTAL = 'rental';                         // Noleggio (es. attrezzatura, spazio)
    case GIFT_CARD = 'gift_card';                   // Carta regalo
    case OTHER = 'other';                           // Altro tipo di prodotto non specificato

    public function label(): string
    {
        return match ($this) {
            self::SERVICE => 'Servizio singolo',
            self::BASE_PRODUCT => 'Prodotto base',
            self::COURSE => 'Corso',
            self::PERSONAL_TRAINING => 'Allenamento personale',
            self::SUBSCRIPTION => 'Abbonamento',
            self::ARTICLE => 'Articolo',
            self::MEMBERSHIP_FEE => 'Quota associativa',
            self::DAY_PASS => 'Ingresso giornaliero',
            self::TOKEN => 'Token',
            self::RENTAL => 'Noleggio',
            self::GIFT_CARD => 'Carta regalo',
            self::OTHER => 'Altro tipo di prodotto',
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::SERVICE => 'i-heroicons-cube',
            self::BASE_PRODUCT => 'i-heroicons-cube',
            self::COURSE => 'i-heroicons-book-open',
            self::PERSONAL_TRAINING => 'i-heroicons-user-group',
            self::SUBSCRIPTION => 'i-heroicons-credit-card',
            self::ARTICLE => 'i-heroicons-shopping-bag',
            self::MEMBERSHIP_FEE => 'i-heroicons-users',
            self::DAY_PASS => 'i-heroicons-calendar',
            self::TOKEN => 'i-heroicons-ticket',
            self::RENTAL => 'i-heroicons-key',
            self::GIFT_CARD => 'i-heroicons-gift',
            self::OTHER => 'i-heroicons-question-mark-circle',
        };
    }

    public function isSubscription(): bool
    {
        return $this === self::SUBSCRIPTION;
    }

    public function isService(): bool
    {
        return $this === self::SERVICE;
    }

    public function isBaseProduct(): bool
    {
        return $this === self::BASE_PRODUCT;
    }

    public function isCourse(): bool
    {
        return $this === self::COURSE;
    }

    public function isPersonalTraining(): bool
    {
        return $this === self::PERSONAL_TRAINING;
    }

    public function isArticle(): bool
    {
        return $this === self::ARTICLE;
    }

    public function isMembershipFee(): bool
    {
        return $this === self::MEMBERSHIP_FEE;
    }

    public function isDayPass(): bool
    {
        return $this === self::DAY_PASS;
    }

    public function isToken(): bool
    {
        return $this === self::TOKEN;
    }

    public function isRental(): bool
    {
        return $this === self::RENTAL;
    }

    public function isGiftCard(): bool
    {
        return $this === self::GIFT_CARD;
    }

    public function isOther(): bool
    {
        return $this === self::OTHER;
    }

    public function isProduct(): bool
    {
        return in_array($this, [
            self::BASE_PRODUCT,
            self::COURSE,
            self::PERSONAL_TRAINING,
            self::ARTICLE,
            self::MEMBERSHIP_FEE,
            self::DAY_PASS,
            self::TOKEN,
            self::RENTAL,
            self::GIFT_CARD,
        ]);
    }
}
