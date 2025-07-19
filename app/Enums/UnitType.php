<?php

namespace App\Enums;

enum UnitType: string
{
    case PIECE = 'piece';
    case HOUR = 'hour';
    case SESSION = 'session';
    case DAY = 'day';
    case MONTH = 'month';
    case ENTRY = 'entry';

    public function label(): string
    {
        return match ($this) {
            self::PIECE => 'Pezzo',
            self::HOUR => 'Ora',
            self::SESSION => 'Sessione',
            self::DAY => 'Giorno',
            self::MONTH => 'Mese',
            self::ENTRY => 'Ingresso',
        };
    }
}
