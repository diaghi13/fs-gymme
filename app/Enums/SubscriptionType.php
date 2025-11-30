<?php

namespace App\Enums;

enum SubscriptionType: string
{
    case UNLIMITED = 'unlimited';   // accesso illimitato ai servizi inclusi
    case LIMITED = 'limited';       // numero fisso di utilizzi
    case FLEXIBLE = 'flexible';     // mix di servizi con limiti diversi

    public function label(): string
    {
        return match ($this) {
            self::UNLIMITED => 'Illimitato',
            self::LIMITED => 'Limitato',
            self::FLEXIBLE => 'Flessibile',
        };
    }
}
