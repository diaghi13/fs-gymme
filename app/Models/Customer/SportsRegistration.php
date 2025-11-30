<?php

namespace App\Models\Customer;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Tesseramento Enti Sportivi
 *
 * Rappresenta l'iscrizione di un cliente ad un ente sportivo (ASI, CONI, FIF, FIPE, etc.)
 * per partecipare a manifestazioni sportive e gare.
 *
 * DIVERSO dalla quota associativa (membership_fee):
 * - Quota associativa = pagamento annuale alla STRUTTURA per coperture assicurative/spese
 * - Tesseramento = iscrizione ad ENTE SPORTIVO per gare/manifestazioni (spesso gratuito)
 */
class SportsRegistration extends Model
{
    /** @use HasFactory<\Database\Factories\Customer\SportsRegistrationFactory> */
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'organization',
        'membership_number',
        'start_date',
        'end_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Check if the registration is currently active
     */
    public function isActive(): bool
    {
        $now = now()->startOfDay();

        return $this->status === 'active'
            && $this->start_date <= $now
            && $this->end_date >= $now;
    }

    /**
     * Check if the registration is expired
     */
    public function isExpired(): bool
    {
        return $this->end_date < now()->startOfDay() || $this->status === 'expired';
    }

    /**
     * Scope to get only active registrations
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now());
    }
}
