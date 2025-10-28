<?php

namespace App\Enums;

enum PriceListScope: string
{
    case Global = 'global';
    case Facility = 'facility';
    case CustomerGroup = 'customer_group';
    case Individual = 'individual';
}
