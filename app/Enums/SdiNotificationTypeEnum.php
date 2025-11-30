<?php

namespace App\Enums;

enum SdiNotificationTypeEnum: string
{
    case RC = 'RC';   // Ricevuta di Consegna - Invoice delivered successfully
    case NS = 'NS';   // Notifica di Scarto - Invoice rejected by SdI
    case MC = 'MC';   // Mancata Consegna - Delivery failed to recipient
    case NE = 'NE';   // Notifica Esito - Outcome notification (accepted/refused by recipient)
    case DT = 'DT';   // Decorrenza Termini - Deadline expired (recipient didn't refuse in time)
    case AT = 'AT';   // Attestazione di Trasmissione - Transmission attestation

    public function label(): string
    {
        return match ($this) {
            self::RC => 'Ricevuta di Consegna',
            self::NS => 'Notifica di Scarto',
            self::MC => 'Mancata Consegna',
            self::NE => 'Notifica Esito',
            self::DT => 'Decorrenza Termini',
            self::AT => 'Attestazione di Trasmissione',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::RC => 'La fattura è stata consegnata con successo al destinatario',
            self::NS => 'La fattura è stata scartata dal Sistema di Interscambio per errori formali',
            self::MC => 'La consegna della fattura al destinatario è fallita',
            self::NE => 'Il destinatario ha accettato o rifiutato la fattura',
            self::DT => 'Il destinatario non ha rifiutato la fattura entro i termini (accettazione implicita)',
            self::AT => 'Attestazione dell\'avvenuta trasmissione della fattura',
        };
    }

    public function isPositive(): bool
    {
        return in_array($this, [self::RC, self::DT, self::AT]);
    }

    public function isNegative(): bool
    {
        return in_array($this, [self::NS, self::MC]);
    }

    public function requiresAction(): bool
    {
        return in_array($this, [self::NS, self::MC]);
    }
}
