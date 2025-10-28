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
}
