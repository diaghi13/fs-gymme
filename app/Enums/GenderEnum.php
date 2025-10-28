<?php

namespace App\Enums;

enum GenderEnum: string
{
    case FEMALE = 'F';
    case MALE = 'M';
    case OTHER = 'other';
    case ALL = 'A';
}
