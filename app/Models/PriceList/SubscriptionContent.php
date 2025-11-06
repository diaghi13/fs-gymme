<?php

namespace App\Models\PriceList;

use App\Casts\MoneyCast;
use App\Models\Product\Product;
use App\Models\VatRate;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * SubscriptionContent Model
 *
 * Represents a product/service included in a subscription with its specific rules,
 * limitations, and benefits. Supports comprehensive access control, booking rules,
 * validity periods, and service-specific permissions.
 */
class SubscriptionContent extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'subscription_id',
        'price_listable_id',
        'price_listable_type',
        'is_optional',
        'days_duration',
        'months_duration',
        'entrances',
        'price',
        'vat_rate_id',

        // Access rules
        'unlimited_entries',
        'total_entries',
        'daily_entries',
        'weekly_entries',
        'monthly_entries',

        // Booking rules
        'max_concurrent_bookings',
        'daily_bookings',
        'weekly_bookings',
        'advance_booking_days',
        'cancellation_hours',

        // Validity rules
        'validity_type',
        'validity_days',
        'validity_months',
        'valid_from',
        'valid_to',
        'freeze_days_allowed',
        'freeze_cost_cents',

        // Time restrictions
        'has_time_restrictions',

        // Service access
        'service_access_type',

        // Benefits & perks
        'discount_percentage',

        // Metadata
        'sort_order',
        'settings',

        // Legacy fields (for backward compatibility)
        'daily_access',
        'weekly_access',
        'reservation_limit',
        'daily_reservation_limit',
    ];

    protected $casts = [
        'subscription_id' => 'integer',
        'price_listable_id' => 'integer',
        'is_optional' => 'boolean',
        'days_duration' => 'integer',
        'months_duration' => 'integer',
        'entrances' => 'integer',
        'price' => MoneyCast::class,
        'vat_rate_id' => 'integer',

        // Access rules
        'unlimited_entries' => 'boolean',
        'total_entries' => 'integer',
        'daily_entries' => 'integer',
        'weekly_entries' => 'integer',
        'monthly_entries' => 'integer',

        // Booking rules
        'max_concurrent_bookings' => 'integer',
        'daily_bookings' => 'integer',
        'weekly_bookings' => 'integer',
        'advance_booking_days' => 'integer',
        'cancellation_hours' => 'integer',

        // Validity rules
        'validity_days' => 'integer',
        'validity_months' => 'integer',
        'valid_from' => 'date',
        'valid_to' => 'date',
        'freeze_days_allowed' => 'integer',
        'freeze_cost_cents' => 'integer',

        // Time restrictions
        'has_time_restrictions' => 'boolean',

        // Benefits
        'discount_percentage' => 'integer',

        // Metadata
        'sort_order' => 'integer',
        'settings' => 'array',

        // Legacy
        'daily_access' => 'integer',
        'weekly_access' => 'integer',
        'reservation_limit' => 'integer',
        'daily_reservation_limit' => 'integer',
    ];

    /**
     * Get the subscription this content belongs to
     */
    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    /**
     * Get the polymorphic product/pricelist this content refers to
     */
    public function price_listable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the VAT rate for this content
     */
    public function vat_rate(): BelongsTo
    {
        return $this->belongsTo(VatRate::class);
    }

    /**
     * Get specific services included/excluded from this content
     */
    public function services(): BelongsToMany
    {
        return $this->belongsToMany(
            Product::class,
            'subscription_content_services',
            'subscription_content_id',
            'product_id'
        )
            ->withPivot(['usage_limit', 'usage_period'])
            ->withTimestamps();
    }

    /**
     * Get time restrictions for this content
     */
    public function timeRestrictions(): HasMany
    {
        return $this->hasMany(SubscriptionContentTimeRestriction::class);
    }

    /**
     * Scope to get only standard (non-optional) contents
     */
    public function scopeStandard($query)
    {
        return $query->where('is_optional', false);
    }

    /**
     * Scope to get only optional contents
     */
    public function scopeOptional($query)
    {
        return $query->where('is_optional', true);
    }

    /**
     * Check if this content has access limitations
     */
    public function hasAccessLimits(): bool
    {
        return ! $this->unlimited_entries && (
            $this->total_entries !== null ||
            $this->daily_entries !== null ||
            $this->weekly_entries !== null ||
            $this->monthly_entries !== null
        );
    }

    /**
     * Check if this content has booking limitations
     */
    public function hasBookingLimits(): bool
    {
        return $this->max_concurrent_bookings !== null ||
            $this->daily_bookings !== null ||
            $this->weekly_bookings !== null;
    }

    /**
     * Check if this content has time restrictions
     */
    public function hasTimeRestrictions(): bool
    {
        return $this->has_time_restrictions && $this->timeRestrictions()->exists();
    }

    /**
     * Check if this content includes service-specific access control
     */
    public function hasServiceRestrictions(): bool
    {
        return in_array($this->service_access_type, ['included', 'excluded']) &&
            $this->services()->exists();
    }

    /**
     * Get human-readable access summary
     */
    public function getAccessSummary(): string
    {
        if ($this->unlimited_entries) {
            return 'Accesso illimitato';
        }

        $parts = [];

        if ($this->total_entries) {
            $parts[] = "{$this->total_entries} ingressi totali";
        }
        if ($this->daily_entries) {
            $parts[] = "{$this->daily_entries}/giorno";
        }
        if ($this->weekly_entries) {
            $parts[] = "{$this->weekly_entries}/settimana";
        }
        if ($this->monthly_entries) {
            $parts[] = "{$this->monthly_entries}/mese";
        }

        return implode(', ', $parts) ?: 'Nessuna limitazione';
    }
}
