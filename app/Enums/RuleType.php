<?php

namespace App\Enums;

enum RuleType: string
{
    case CustomerGroup = 'customer_group';
    case Facility = 'facility';
    case DateRange = 'date_range';
    case Quantity = 'quantity';
    case TotalAmount = 'total_amount';
    case MembershipDuration = 'membership_duration';
    case Custom = 'custom';
}
