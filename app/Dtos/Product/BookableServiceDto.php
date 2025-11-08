<?php

namespace App\Dtos\Product;

class BookableServiceDto
{
    public ?int $id = null;

    public string $name = '';

    public ?string $description = null;

    public ?string $short_description = null;

    public string $color = '#000000';

    public int $duration_minutes = 60;

    public bool $requires_trainer = false;

    public bool $is_active = true;

    public ?array $settings = null;

    protected static function validationRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:255',
            'color' => 'required|string|max:7',
            'duration_minutes' => 'required|integer|min:1',
            'requires_trainer' => 'boolean',
            'is_active' => 'boolean',
            'settings' => 'nullable|array',
            // Booking settings validation
            'settings.booking.advance_days' => 'nullable|integer|min:1|max:365',
            'settings.booking.min_advance_hours' => 'nullable|integer|min:0|max:72',
            'settings.booking.cancellation_hours' => 'nullable|integer|min:0|max:168',
            'settings.booking.max_per_day' => 'nullable|integer|min:1|max:100',
            'settings.booking.buffer_minutes' => 'nullable|integer|min:0|max:120',
            // Requirements settings validation
            'settings.requirements.requires_trainer' => 'nullable|boolean',
            'settings.requirements.requires_equipment' => 'nullable|boolean',
            'settings.requirements.requires_room' => 'nullable|boolean',
            'settings.requirements.min_preparation_minutes' => 'nullable|integer|min:0|max:180',
            // Availability settings validation
            'settings.availability.available_days' => 'nullable|array|min:1',
            'settings.availability.available_days.*' => 'string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'settings.availability.default_start_time' => 'nullable|string',
            'settings.availability.default_end_time' => 'nullable|string',
            'settings.availability.slot_duration_minutes' => 'nullable|integer|min:15|max:480',
            'settings.availability.max_concurrent_bookings' => 'nullable|integer|min:1|max:50',
            'settings.availability.time_slots' => 'nullable|array',
            'settings.availability.time_slots.*.day' => 'required_with:settings.availability.time_slots|string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'settings.availability.time_slots.*.start_time' => 'required_with:settings.availability.time_slots|string',
            'settings.availability.time_slots.*.end_time' => 'required_with:settings.availability.time_slots|string',
            'settings.availability.time_slots.*.max_bookings' => 'required_with:settings.availability.time_slots|integer|min:1|max:50',
        ];
    }

    public static function casts(): array
    {
        return [
            'id' => 'integer',
            'name' => 'string',
            'description' => 'string',
            'short_description' => 'string',
            'color' => 'string',
            'duration_minutes' => 'integer',
            'requires_trainer' => 'boolean',
            'is_active' => 'boolean',
            'settings' => 'array',
        ];
    }
}
