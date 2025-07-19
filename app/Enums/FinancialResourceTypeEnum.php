<?php

namespace App\Enums;

enum FinancialResourceTypeEnum: string
{
    case BANK = 'bank';
    case PAYMENT_GATEWAY = 'payment_gateway';
    case CASH = 'cash';
    case CREDIT_CARD = 'credit_card';
    case CRYPTOCURRENCY = 'cryptocurrency';
    case OTHER = 'other';

    public function label(): string
    {
        return match ($this) {
            self::BANK_ACCOUNT => 'Bank Account',
            self::PAYMENT_GATEWAY => 'Payment Gateway',
            self::CASH => 'Cash',
            self::CRYPTOCURRENCY => 'Cryptocurrency',
            self::OTHER => 'Other',
        };
    }
}
