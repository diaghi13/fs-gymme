<?php

namespace App\Models\Product;

use App\Enums\SkuProductPrefix;
use App\Support\ProductUtil;
use Parental\HasParent;

/**
 * @property mixed $id
 */
class BaseProduct extends Product
{
    use HasParent;

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

    public function getExtraSettingsDefaults(): array
    {
        return [
            'booking' => [
                // Standard booking rules (for subscription integration)
                'advance_days' => 7,
                'min_advance_hours' => 24,
                'cancellation_hours' => 48,
                'max_per_day' => null,
                'buffer_minutes' => 0,
            ],
            'facility' => [
                'facility_type' => 'gym|pool|spa|court|studio|outdoor',
                'access_level' => 'full|limited|supervised',
                'capacity_management' => [
                    'max_concurrent_users' => null,
                    'reservation_required' => false,
                    'waitlist_enabled' => true,
                    'peak_hours_capacity_reduction' => 1,
                ],
                'operating_hours' => [],
            ],
            'access_control' => [
                'entry_method' => 'card|app|biometric|staff|all',
                'exit_tracking' => true,
                'max_session_hours' => null,
                'concurrent_facility_access' => true,
                'guest_access' => [
                    'allowed' => false,
                    'requires_member_accompaniment' => true,
                    'max_guests_per_member' => null,
                    'guest_fee' => null,
                ],
            ],
            'areas_included' => [
                'weight_room' => true,
                'cardio_area' => true,
                'free_weights' => true,
                'functional_area' => true,
                'stretching_zone' => true,
                'locker_rooms' => true,
                'showers' => true,
                'swimming_pool' => false,
                'spa_area' => false,
                'group_class_studios' => false,
            ],
            'equipment_access' => [
                'all_equipment_included' => true,
                'premium_equipment_surcharge' => false,
                'equipment_reservation' => [
                    'required_for' => [],
                    'max_reservation_minutes' => null,
                    'advance_booking_hours' => null,
                ],
                'equipment_limits' => [
                    'cardio_machine_time_limit' => null,
                    'peak_hours_time_limit' => null,
                ],
            ],
            'services_included' => [],
            'safety_hygiene' => [
                'cleaning_protocols' => [
                    'equipment_sanitization_required' => true,
                    'sanitization_supplies_provided' => true,
                    'deep_cleaning_schedule' => 'nightly',
                ],
                'safety_measures' => [
                    'staff_supervision' => 'peak_hours|always|none',
                    'emergency_procedures' => true,
                    'first_aid_available' => true,
                    'aed_available' => true,
                ],
                'health_requirements' => [
                    'health_declaration_required' => true,
                    'temperature_check' => false,
                    'medical_clearance' => false,
                ],
            ],
            'peak_hours' => [
                'definition' => [],
                'restrictions' => [
                    'capacity_reduction' => false,
                    'time_limits_enforced' => false,
                    'premium_access_priority' => false,
                ],
                'pricing' => [
                    'peak_hours_surcharge' => 0,
                    'off_peak_discount' => 0,
                    'flexible_timing_discount' => 0,
                ],
            ],
            'membership_integration' => [
                'included_in_basic_membership' => true,
                'upgrade_options' => [
                    'premium_areas_access' => true,
                    'extended_hours_access' => true,
                    'priority_equipment_booking' => true,
                ],
                'usage_tracking' => [
                    'track_visit_frequency' => true,
                    'track_duration' => true,
                    'track_areas_used' => true,
                    'generate_usage_reports' => true,
                ],
            ],
            'special_programs' => [],
            'environmental' => [
                'air_quality_monitoring' => true,
                'temperature_control' => [
                    'optimal_range' => ['min' => 18, 'max' => 22],
                    'humidity_control' => false,
                    'air_circulation' => 'continuous',
                ],
                'lighting' => [
                    'natural_light' => true,
                    'led_lighting' => true,
                    'adjustable_zones' => true,
                ],
                'sound_system' => [
                    'background_music' => true,
                    'volume_zones' => true,
                    'quiet_areas' => true,
                ],
            ],
            'digital_integration' => [
                'mobile_app_features' => [
                    'real_time_capacity' => false,
                    'equipment_availability' => false,
                    'workout_tracking' => false,
                    'social_features' => false,
                ],
                'smart_equipment' => [
                    'connected_cardio' => false,
                    'workout_data_sync' => false,
                    'progress_tracking' => false,
                ],
                'virtual_services' => [
                    'virtual_classes_access' => false,
                    'online_coaching' => false,
                    'nutrition_app' => false,
                ],
            ],
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            $product->selling_description = ! $product->selling_description
                ? $product->name
                : $product->selling_description;
        });

        static::created(function ($product) {
            if (! $product->slug) {
                $product->slug = ProductUtil::generateProductSlug(
                    $product->name,
                    $product->id,
                );
            }

            if (! $product->sku) {
                $product->sku = ProductUtil::generateSku(
                    $product->name,
                    $product->id,
                    SkuProductPrefix::BASE_PRODUCT->value
                );
            }

            $product->saveQuietly();
        });
    }

    public function getIsSchedulableAttribute()
    {
        return $this->product_schedules()->count() > 0;
    }

    public function product_schedules(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProductSchedule::class);
    }
}
