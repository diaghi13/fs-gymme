<?php

namespace App\Enums;

enum PriceSource: string
{
    case Manual = 'manual';
    case Inherited = 'inherited';
    case Calculated = 'calculated';
    case Formula = 'formula';
}
