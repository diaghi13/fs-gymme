<?php

namespace App\Enums;

enum FeatureType: string
{
    case Boolean = 'boolean'; // Feature is either enabled or disabled
    case Quota = 'quota'; // Feature has a usage quota/limit
    case Metered = 'metered'; // Feature is billed based on usage

    public function label(): string
    {
        return match ($this) {
            self::Boolean => 'Sì/No',
            self::Quota => 'Con Quota',
            self::Metered => 'A Consumo',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::Boolean => 'Funzionalità attiva o disattiva',
            self::Quota => 'Funzionalità con limite di utilizzo',
            self::Metered => 'Funzionalità fatturata in base all\'uso',
        };
    }
}
