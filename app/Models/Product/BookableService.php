<?php

namespace App\Models\Product;

use Parental\HasParent;

/**
 * Bookable Service Model
 *
 * Represents services that require booking/scheduling:
 * - Personal Training
 * - Massages
 * - Nutritional Consultations
 * - Physical Therapy
 * - etc.
 *
 * Characteristics:
 * - Requires booking
 * - Has duration
 * - May require specific trainer/operator
 * - Has available time slots
 */
class BookableService extends Product
{
    use HasParent;

    /**
     * Default settings for bookable services
     */
    protected function getTypeSpecificSettingsDefaults(): array
    {
        return [
            'booking' => [
                'advance_days' => 7,              // Days in advance booking is allowed
                'min_advance_hours' => 2,          // Minimum hours before appointment
                'cancellation_hours' => 24,        // Hours before for free cancellation
                'max_per_day' => null,             // Max bookings per day (null = unlimited)
                'buffer_minutes' => 15,            // Buffer time between appointments
            ],
            'availability' => [
                'days' => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], // Available days
                'time_slots' => [],                // Available time slots (e.g., ["09:00-12:00", "14:00-18:00"])
                'blackout_dates' => [],            // Dates when service is unavailable
            ],
            'requirements' => [
                'requires_trainer' => true,
                'requires_equipment' => false,
                'requires_room' => false,
                'min_preparation_minutes' => 0,
            ],
        ];
    }
}
