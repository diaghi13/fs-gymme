<?php

namespace App\Enums;

enum SaleAccountingStatusEnum: string
{
    case PENDING = 'pending';
    case ACCOUNTED = 'accounted';
    case NOT_ACCOUNTED = 'not_accounted';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => __('Pending'),
            self::ACCOUNTED => __('Accounted'),
            self::NOT_ACCOUNTED => __('Not accounted'),
        };
    }
}
