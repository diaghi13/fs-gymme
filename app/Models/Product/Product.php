<?php

namespace App\Models\Product;

use App\Enums\ProductType;
use App\Models\PriceList\Article;
use App\Models\PriceList\SubscriptionContent;
use App\Models\Traits\HasSettings;
// use App\Models\Traits\HasTenantScope;
use App\Models\VatRate;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class Product extends Model
{
    use \App\Models\Traits\HasStructure,
        HasSettings,
        // HasTenantScope, - disabled temporarily
        \Illuminate\Database\Eloquent\Factories\HasFactory,
        \Illuminate\Database\Eloquent\SoftDeletes,
        \Parental\HasChildren;

    protected $fillable = [
        'structure_id',
        'vat_rate_id',
        'name',
        'slug',
        'color',
        'description',
        'short_description',
        'sku',
        'type',
        'is_bookable',
        'requires_trainer',
        'duration_minutes',
        'max_participants',
        'min_participants',
        'min_age',
        'max_age',
        'gender_restriction',
        'prerequisites',
        'settings',
        'image_path',
        'is_active',
    ];

    protected $casts = [
        'structure_id' => 'integer',
        'vat_rate_id' => 'integer',
        'is_bookable' => 'boolean',
        'requires_trainer' => 'boolean',
        'duration_minutes' => 'integer',
        'max_participants' => 'integer',
        'min_participants' => 'integer',
        'min_age' => 'integer',
        'max_age' => 'integer',
        'settings' => 'array',
        'is_active' => 'boolean',
    ];

    protected $childTypes = [
        ProductType::BASE_PRODUCT->value => BaseProduct::class,
        ProductType::COURSE->value => CourseProduct::class,
        ProductType::BOOKABLE_SERVICE->value => BookableService::class,
    ];

    protected function getCommonSettingsDefaults(): array
    {
        return [
            'ui' => [
                'display_color' => '#2563eb',
                'icon' => 'dumbbell|yoga|massage|calendar',
                'category_badge' => false,
                'featured' => false,
                'sort_priority' => 0,
            ],
            'seo' => [
                'meta_title' => '',
                'meta_description' => '',
                'keywords' => [],
                'canonical_url' => '',
            ],
            'analytics' => [
                'track_conversions' => true,
                'track_abandonment' => true,
                'conversion_goals' => [],
                'custom_events' => [],
            ],
            'notifications' => [
                'booking_confirmation' => true,
                'reminder_hours_before' => 24,
                'cancellation_notification' => true,
                'waitlist_notifications' => true,
            ],
        ];
    }

    public function vat_rate()
    {
        return $this->belongsTo(VatRate::class);
    }

    public function subscription_content(): MorphOne
    {
        return $this->morphOne(SubscriptionContent::class, 'price_listable');
    }

    public function sale_row(): MorphOne
    {
        return $this->morphOne(\App\Models\Sale\SaleRow::class, 'entitable');
    }
}
