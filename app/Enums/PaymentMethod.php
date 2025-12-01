<?php

namespace App\Enums;

/**
 * Payment methods available for subscriptions.
 */
enum PaymentMethod: string
{
    case Stripe = 'stripe';
    case BankTransfer = 'bank_transfer';
    case Manual = 'manual';

    /**
     * Get human-readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::Stripe => 'Carta di Credito (Stripe)',
            self::BankTransfer => 'Bonifico Bancario',
            self::Manual => 'Manuale',
        };
    }

    /**
     * Check if payment requires manual confirmation.
     */
    public function requiresManualConfirmation(): bool
    {
        return match ($this) {
            self::Stripe => false,
            self::BankTransfer, self::Manual => true,
        };
    }
}
