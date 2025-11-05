<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Parental\HasParent;

class CourseProduct extends Product
{
    /** @use HasFactory<\Database\Factories\Product\CourseProductFactory> */
    use HasFactory, HasParent;

    protected $fillable = [
        'structure_id',

        // Generali
        'name',
        'slug',
        'color',
        'sku',
        'type',
        'is_active',

        // Vendita
        'requires_trainer',
        'saleable_in_subscription',
        'vat_rate_id',
        'selling_description',

        // Online
        'description',
        'short_description',
        'image_path',
        'is_bookable',

        // Avanzate
        'prerequisites',
        'settings',
    ];

    protected $hidden = [
        'duration_minutes',
        'max_participants',
        'min_participants',
        'min_age',
        'max_age',
        'gender_restriction',
        'subscription_duration_months',
        'subscription_duration_days',
        'subscription_type',
        'is_renewable',
        'auto_renew_default',
        'validity_days',
        'max_uses_per_period',
        'max_uses_total',
    ];

    protected $casts = [
        'structure_id' => 'integer',
        'vat_rate_id' => 'integer',
        'is_bookable' => 'boolean',
        'requires_trainer' => 'boolean',
        'is_active' => 'boolean',
        'settings' => 'array',
    ];

    protected function getExtraSettingsDefaults(): array
    {
        return [
            'course' => [
                'total_lessons' => 12,
                'lessons_per_week' => 2,
                'lesson_duration_minutes' => 60,
                'skill_level' => 'beginner|intermediate|advanced',
                'course_type' => 'group|semi_private',
                'curriculum' => 'url_to_curriculum.pdf',
            ],
            'booking' => [
                'enrollment_deadline_days' => 0,
                'min_students_to_start' => 1,
                'max_absences_allowed' => 0,
                'makeup_lessons_allowed' => true,
                'transfer_to_next_course' => true,
            ],
            'materials' => [
                'equipment_provided' => false,
                'equipment_list' => [],
                'bring_own_equipment' => true,
                'materials_fee' => 0,
            ],
            'progression' => [
                'has_certification' => false,
                'next_level_course_id' => null,
                'prerequisites' => [],
            ],
        ];
    }

    public function plannings()
    {
        return $this->hasMany(CourseProductPlanning::class);
    }

    public function planning()
    {
        return $this->plannings()->latest();
    }
}
