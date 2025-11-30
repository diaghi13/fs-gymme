<?php

namespace App\Dtos\Product;

use App\Dtos\BaseDto;
use App\Models\VatRate;
use App\Support\Color;

final class CourseProductDto extends BaseDto
{
    public ?int $id = null;

    public ?int $category_id = null;

    public string $name = '';

    public ?string $slug = null;

    public string $color = '#000000';

    public ?string $sku = null;

    public ?string $type = null;

    public ?string $unit_type = 'piece';

    public bool $is_active = true;

    public ?bool $requires_trainer = false;

    public ?bool $saleable_in_subscription = true;

    public ?int $vat_rate_id = null;

    public ?string $selling_description = null;

    public ?string $description = null;

    public ?string $short_description = null;

    public ?string $image_path = null;

    public ?bool $is_bookable = false;

    public ?string $prerequisites = null;

    public ?array $settings = null;

    public ?VatRate $vat_rate = null;

    protected static function validationRules(): array
    {
        return [
            // Generali
            'category_id' => ['nullable', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'color' => ['required', 'string', 'max:7', function ($attribute, $value, $fail) {
                if (! Color::isValidHex($value)) {
                    $fail('The '.$attribute.' must be a valid hex color code.');
                }
            }],
            'sku' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'max:255'],
            'unit_type' => ['nullable', 'string', 'max:255'],
            'is_active' => ['required', 'boolean'],

            // Vendita
            'requires_trainer' => ['nullable', 'boolean'],
            'saleable_in_subscription' => ['nullable', 'boolean'],
            'vat_rate_id' => ['nullable', 'exists:vat_rates,id'],
            'selling_description' => ['nullable', 'string', 'max:255'],

            // Online
            'description' => ['nullable', 'string', 'max:2000'],
            'short_description' => ['nullable', 'string', 'max:250'],
            'image_path' => ['nullable', 'string', 'max:255'],
            'is_bookable' => ['nullable', 'boolean'],

            // Avanzate
            'prerequisites' => ['nullable', 'string', 'max:2000'],
            'settings' => ['nullable', 'array'],

            // Course settings validation
            'settings.course.total_lessons' => ['nullable', 'integer', 'min:1', 'max:200'],
            'settings.course.lessons_per_week' => ['nullable', 'integer', 'min:1', 'max:7'],
            'settings.course.lesson_duration_minutes' => ['nullable', 'integer', 'min:15', 'max:480'],
            'settings.course.skill_level' => ['nullable', 'string', 'in:beginner,intermediate,advanced'],
            'settings.course.course_type' => ['nullable', 'string', 'in:group,semi_private'],
            'settings.course.curriculum' => ['nullable', 'url'],

            // Booking settings validation - Standard rules (for subscription integration)
            'settings.booking.advance_days' => ['nullable', 'integer', 'min:0', 'max:365'],
            'settings.booking.min_advance_hours' => ['nullable', 'integer', 'min:0', 'max:168'],
            'settings.booking.cancellation_hours' => ['nullable', 'integer', 'min:0', 'max:168'],
            'settings.booking.max_per_day' => ['nullable', 'integer', 'min:1', 'max:50'],
            'settings.booking.buffer_minutes' => ['nullable', 'integer', 'min:0', 'max:120'],

            // Booking settings validation - Course-specific rules
            'settings.booking.enrollment_deadline_days' => ['nullable', 'integer', 'min:0', 'max:90'],
            'settings.booking.min_students_to_start' => ['nullable', 'integer', 'min:1', 'max:100'],
            'settings.booking.max_absences_allowed' => ['nullable', 'integer', 'min:0'],
            'settings.booking.makeup_lessons_allowed' => ['nullable', 'boolean'],
            'settings.booking.transfer_to_next_course' => ['nullable', 'boolean'],

            // Materials settings validation
            'settings.materials.equipment_provided' => ['nullable', 'boolean'],
            'settings.materials.bring_own_equipment' => ['nullable', 'boolean'],
            'settings.materials.materials_fee' => ['nullable', 'numeric', 'min:0', 'max:10000'],
            'settings.materials.equipment_list' => ['nullable', 'array'],

            // Progression settings validation
            'settings.progression.has_certification' => ['nullable', 'boolean'],
            'settings.progression.next_level_course_id' => ['nullable', 'integer'],
            'settings.progression.prerequisites' => ['nullable', 'array'],
        ];
    }

    public static function casts(): array
    {
        return [
            'id' => 'integer',
            'category_id' => 'integer',
            'name' => 'string',
            'slug' => 'string',
            'color' => 'string',
            'sku' => 'string',
            'type' => 'string',
            'unit_type' => 'string',
            'is_active' => 'boolean',
            'requires_trainer' => 'boolean',
            'saleable_in_subscription' => 'boolean',
            'vat_rate_id' => 'integer',
            'selling_description' => 'string',
            'description' => 'string',
            'short_description' => 'string',
            'image_path' => 'string',
            'is_bookable' => 'boolean',
            'prerequisites' => 'string',
            'settings' => 'array',
        ];
    }
}
