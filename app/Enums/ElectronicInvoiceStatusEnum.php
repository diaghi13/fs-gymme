<?php

namespace App\Enums;

enum ElectronicInvoiceStatusEnum: string
{
    case DRAFT = 'draft';                    // Bozza, non ancora generata
    case GENERATED = 'generated';            // XML generato, pronto per invio
    case TO_SEND = 'to_send';               // In coda per invio
    case SENDING = 'sending';               // In fase di invio
    case SENT = 'sent';                     // Inviata al SdI
    case ACCEPTED = 'accepted';             // Accettata dal SdI (ricevuta RC)
    case DELIVERED = 'delivered';           // Consegnata al destinatario (ricevuta MC)
    case REJECTED = 'rejected';             // Rifiutata dal SdI (notifica NS)
    case DELIVERY_FAILED = 'delivery_failed'; // Mancata consegna (notifica MC con esito negativo)
    case CANCELLED = 'cancelled';           // Annullata

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Bozza',
            self::GENERATED => 'XML Generato',
            self::TO_SEND => 'Da Inviare',
            self::SENDING => 'In Invio',
            self::SENT => 'Inviata al SdI',
            self::ACCEPTED => 'Accettata',
            self::DELIVERED => 'Consegnata',
            self::REJECTED => 'Rifiutata',
            self::DELIVERY_FAILED => 'Mancata Consegna',
            self::CANCELLED => 'Annullata',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::DRAFT => 'gray',
            self::GENERATED => 'blue',
            self::TO_SEND => 'indigo',
            self::SENDING => 'purple',
            self::SENT => 'yellow',
            self::ACCEPTED => 'green',
            self::DELIVERED => 'emerald',
            self::REJECTED => 'red',
            self::DELIVERY_FAILED => 'orange',
            self::CANCELLED => 'slate',
        };
    }

    public function isFinal(): bool
    {
        return in_array($this, [
            self::DELIVERED,
            self::REJECTED,
            self::DELIVERY_FAILED,
            self::CANCELLED,
        ]);
    }

    public function canResend(): bool
    {
        return in_array($this, [
            self::REJECTED,
            self::DELIVERY_FAILED,
        ]);
    }
}
