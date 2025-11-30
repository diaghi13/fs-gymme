<?php

namespace App\Enums;

enum PriceListListType: string
{
    case Standard = 'standard';
    case Promotional = 'promotional';
    case Member = 'member';
    case Corporate = 'corporate';
    case Seasonal = 'seasonal';
    case Group = 'group';
    case Facility = 'facility';
}
