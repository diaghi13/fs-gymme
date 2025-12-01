<?php

namespace App\Enums;

enum SubscriptionPlanTier: string
{
    case Base = 'base';
    case Gold = 'gold';
    case Platinum = 'platinum';

    public function label(): string
    {
        return match ($this) {
            self::Base => 'Base',
            self::Gold => 'Gold',
            self::Platinum => 'Platinum',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::Base => 'Piano base per iniziare',
            self::Gold => 'Piano avanzato con più funzionalità',
            self::Platinum => 'Piano completo senza limiti',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Base => 'gray',
            self::Gold => 'yellow',
            self::Platinum => 'purple',
        };
    }

    public function order(): int
    {
        return match ($this) {
            self::Base => 1,
            self::Gold => 2,
            self::Platinum => 3,
        };
    }
}
