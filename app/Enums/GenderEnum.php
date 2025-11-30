<?php

namespace App\Enums;

enum GenderEnum: string
{
    case FEMALE = 'F';
    case MALE = 'M';
    case OTHER = 'other';
    case ALL = 'A';

    public static function rules(): array
    {
        return [
            'in:'.implode(',', array_map(fn (self $gender) => $gender->value, self::cases())),
        ];
    }
}
