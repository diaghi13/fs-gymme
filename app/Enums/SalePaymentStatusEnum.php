<?php

namespace App\Enums;

enum SalePaymentStatusEnum: string
{
    case PENDING = 'pending';
    case PARTIAL = 'partial';
    case PAID = 'paid';
    case NOT_PAIED = 'not_paid';
    case OVERPAID = 'overpaid';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => __('Pending'),
            self::PARTIAL => __('Partial'),
            self::PAID => __('Paid'),
            self::NOT_PAIED => __('Not paid'),
            self::OVERPAID => __('Overpaid'),
        };
    }
}
