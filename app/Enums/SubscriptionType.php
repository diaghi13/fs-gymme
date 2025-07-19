<?php

namespace App\Enums;

enum SubscriptionType: string
{
    case UNLIMITED = 'unlimited';
    case LIMITED = 'limited';
    case FLEXIBLE = 'flexible';

    public function label(): string
    {
        return match ($this) {
            self::UNLIMITED => 'Illimitato',
            self::LIMITED => 'Limitato',
            self::FLEXIBLE => 'Flessibile',
        };
    }
}
