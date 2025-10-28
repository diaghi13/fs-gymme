<?php

namespace App\Models\Product;

use App\Enums\ProductType;
use App\Models\PriceList\Article;
use App\Models\PriceList\SubscriptionContent;
use App\Models\Scopes\StructureScope;
use App\Models\Traits\HasSettings;
use App\Models\VatRate;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class Product extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory,
        \Parental\HasChildren,
        \Illuminate\Database\Eloquent\SoftDeletes,
        \App\Models\Traits\HasStructure,
        HasSettings;

    protected $fillable = [
        'structure_id',
        'vat_rate_id',
        'product_id',
        'name',
        'slug',
        'color',
        'description',
        'short_description',
        'sku',
        'type',
        'unit_type',
        'is_bookable',
        'requires_trainer',
        'duration_minutes',
        'max_participants',
        'min_participants',
        'min_age',
        'max_age',
        'gender_restriction',
        'prerequisites',
        'subscription_duration_months',
        'subscription_duration_days',
        'subscription_type',
        'is_renewable',
        'auto_renew_default',
        'validity_days',
        'max_uses_per_period',
        'max_uses_total',
        'settings',
        'image_path',
        'is_active',
        'saleable_in_subscription',
        'selling_description',
    ];

    protected $casts = [
        'structure_id' => 'integer',
        'vat_rate_id' => 'integer',
        'category_id' => 'integer',
        'is_bookable' => 'boolean',
        'requires_trainer' => 'boolean',
        'duration_minutes' => 'integer',
        'max_participants' => 'integer',
        'min_participants' => 'integer',
        'min_age' => 'integer',
        'max_age' => 'integer',
        'subscription_duration_months' => 'integer',
        'subscription_duration_days' => 'integer',
        'is_renewable' => 'boolean',
        'auto_renew_default' => 'boolean',
        'validity_days' => 'integer',
        'max_uses_per_period' => 'integer',
        'max_uses_total' => 'integer',
        'settings' => 'array',
        'is_active' => 'boolean',
        'saleable_in_subscription' => 'boolean',
    ];

    protected $childTypes = [
        ProductType::SERVICE->value => Service::class,                      // Listino
        ProductType::BASE_PRODUCT->value => BaseProduct::class,             // Pagina propria
        ProductType::COURSE->value => CourseProduct::class,                 // Pagina propria
        ProductType::PERSONAL_TRAINING->value => PersonalTraining::class,   // Listino
        ProductType::SUBSCRIPTION->value => Subscription::class,            // Listino
        ProductType::ARTICLE->value => Article::class,                      // Listino
        ProductType::MEMBERSHIP_FEE->value => MembershipFee::class,         // Listino
        ProductType::DAY_PASS->value => DayPass::class,                     // Listino
        ProductType::TOKEN->value => Token::class,                          // Listino
        ProductType::RENTAL->value => Rental::class,
        ProductType::GIFT_CARD->value => GiftCard::class,                   // Listino
        ProductType::OTHER->value => Other::class,                          // Listino
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
