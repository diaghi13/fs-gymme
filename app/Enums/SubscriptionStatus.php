<?php

namespace App\Enums;

/**
 * Subscription status values.
 */
enum SubscriptionStatus: string
{
    case Active = 'active';
    case Trial = 'trial';
    case PendingPayment = 'pending_payment';
    case Cancelled = 'cancelled';
    case Expired = 'expired';
    case Suspended = 'suspended';

    /**
     * Get human-readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::Active => 'Attivo',
            self::Trial => 'Periodo di Prova',
            self::PendingPayment => 'In Attesa di Pagamento',
            self::Cancelled => 'Cancellato',
            self::Expired => 'Scaduto',
            self::Suspended => 'Sospeso',
        };
    }

    /**
     * Get color for UI display.
     */
    public function color(): string
    {
        return match ($this) {
            self::Active => 'success',
            self::Trial => 'info',
            self::PendingPayment => 'warning',
            self::Cancelled => 'default',
            self::Expired => 'error',
            self::Suspended => 'warning',
        };
    }

    /**
     * Check if subscription is considered active.
     */
    public function isActive(): bool
    {
        return match ($this) {
            self::Active, self::Trial => true,
            default => false,
        };
    }
}
