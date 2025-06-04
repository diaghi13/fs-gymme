<?php

namespace App\Enums;

enum WeekDaysEnum: string
{
    case MONDAY = 'monday';
    case TUESDAY = 'tuesday';
    case WEDNESDAY = 'wednesday';
    case THURSDAY = 'thursday';
    case FRIDAY = 'friday';
    case SATURDAY = 'saturday';
    case SUNDAY = 'sunday';

    public function toString(): string
    {
        return match ($this) {
            self::MONDAY => 'Lunedì',
            self::TUESDAY => 'Martedì',
            self::WEDNESDAY => 'Mercoledì',
            self::THURSDAY => 'Giovedì',
            self::FRIDAY => 'Venerdì',
            self::SATURDAY => 'Sabato',
            self::SUNDAY => 'Domenica',
        };
    }

    public static function toArray()
    {
        return array_column(self::cases(), 'value');
    }
}
