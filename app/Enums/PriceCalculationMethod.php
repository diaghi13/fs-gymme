<?php
namespace App\Enums;

enum PriceCalculationMethod: string
{
    case Manual = 'manual';
    case AutoSum = 'auto_sum';
    case AutoWeighted = 'auto_weighted';
    case Formula = 'formula';
}
