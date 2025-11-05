<?php

namespace App\Models\PriceList;

use Parental\HasParent;

/**
 * DayPass Model
 *
 * Represents single-day access passes to the gym.
 * Typically provides full access to all facilities for one day.
 */
class DayPass extends PriceList
{
    use HasParent;

    /**
     * Default settings for day passes
     */
    protected function getTypeSpecificSettingsDefaults(): array
    {
        return [
            'access' => [
                'all_facilities' => true,
                'includes_classes' => true,
                'valid_hours' => ['06:00', '23:00'],
            ],
            'restrictions' => [
                'blackout_dates' => [],          // Dates when day pass cannot be used
                'requires_advance_purchase' => false,
                'max_per_person_per_month' => null,
            ],
        ];
    }
}