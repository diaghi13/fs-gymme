<?php

namespace App\Models\PriceList;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * SubscriptionContentTimeRestriction Model
 *
 * Represents time-based access restrictions for subscription contents.
 * Examples: "Morning membership 06:00-13:00", "Weekend only", "Off-peak hours"
 */
class SubscriptionContentTimeRestriction extends Model
{
    protected $fillable = [
        'subscription_content_id',
        'days',
        'start_time',
        'end_time',
        'restriction_type',
        'description',
    ];

    protected $casts = [
        'subscription_content_id' => 'integer',
        'days' => 'array',
        'start_time' => 'string',
        'end_time' => 'string',
    ];

    /**
     * Get the subscription content this restriction belongs to
     */
    public function subscriptionContent(): BelongsTo
    {
        return $this->belongsTo(SubscriptionContent::class);
    }

    /**
     * Check if restriction applies to a specific day
     */
    public function appliesTo(string $day): bool
    {
        return $this->days === null || in_array($day, $this->days);
    }

    /**
     * Check if restriction applies to current day
     */
    public function appliesToToday(): bool
    {
        $today = strtolower(now()->format('l')); // 'monday', 'tuesday', etc.

        return $this->appliesTo($today);
    }

    /**
     * Check if a given time is within allowed/blocked range
     */
    public function isTimeAllowed(string $time): bool
    {
        if ($this->start_time === null || $this->end_time === null) {
            return $this->restriction_type === 'allowed';
        }

        $isInRange = $time >= $this->start_time && $time <= $this->end_time;

        // If restriction_type is 'allowed', time must be in range
        // If restriction_type is 'blocked', time must NOT be in range
        return $this->restriction_type === 'allowed' ? $isInRange : ! $isInRange;
    }

    /**
     * Get human-readable description of this restriction
     */
    public function getReadableDescription(): string
    {
        if ($this->description) {
            return $this->description;
        }

        $parts = [];

        if ($this->days) {
            $dayLabels = [
                'monday' => 'Lun',
                'tuesday' => 'Mar',
                'wednesday' => 'Mer',
                'thursday' => 'Gio',
                'friday' => 'Ven',
                'saturday' => 'Sab',
                'sunday' => 'Dom',
            ];
            $parts[] = implode(', ', array_map(fn ($d) => $dayLabels[$d] ?? $d, $this->days));
        }

        if ($this->start_time && $this->end_time) {
            $parts[] = "{$this->start_time} - {$this->end_time}";
        }

        $type = $this->restriction_type === 'allowed' ? 'Permesso' : 'Bloccato';
        $parts[] = $type;

        return implode(' | ', $parts);
    }
}
