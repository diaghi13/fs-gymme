<?php

namespace App\Models\PriceList;

use App\Contracts\PriceListContract;
use App\Contracts\VatRateable;
use App\Enums\PriceListType;
use App\Models\Traits\HasStructure;
use App\Models\VatRate;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Parental\HasChildren;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Staudenmeir\LaravelAdjacencyList\Eloquent\HasRecursiveRelationships;

/**
 * PriceList Model
 *
 * Represents commercial offerings (how we sell products).
 * Uses STI (Single Table Inheritance) via Parental package.
 *
 * Child Types:
 * - Folder: Organizational folder
 * - Article: Retail products (supplements, equipment, etc.)
 * - Membership: Membership fees
 * - Subscription: Bundled product offerings
 * - DayPass: Single day access
 * - Token: Prepaid credits/carnets
 * - GiftCard: Gift cards
 */
class PriceList extends Model implements PriceListContract, VatRateable
{
    use HasChildren,
        HasRecursiveRelationships,
        HasStructure,
        LogsActivity,
        SoftDeletes;

    protected $childTypes = [
        PriceListType::FOLDER->value => Folder::class,
        PriceListType::ARTICLE->value => Article::class,
        PriceListType::MEMBERSHIP->value => Membership::class,
        PriceListType::SUBSCRIPTION->value => Subscription::class,
        PriceListType::DAY_PASS->value => DayPass::class,
        PriceListType::TOKEN->value => Token::class,
        PriceListType::GIFT_CARD->value => GiftCard::class,
    ];

    protected $fillable = [
        'type',
        'structure_id',
        'vat_rate_id',
        'parent_id',
        'name',
        'slug',
        'description',
        'selling_description',
        'price',
        'duration_months',
        'duration_days',
        'is_renewable',
        'auto_renew_default',
        'validity_days',
        'max_uses',
        'list_type',
        'list_scope',
        'inherit_from_parent',
        'override_parent_prices',
        'is_default',
        'valid_from',
        'valid_to',
        'currency',
        'tax_included',
        'default_tax_rate',
        'base_discount_percentage',
        'volume_discount_enabled',
        'loyalty_discount_enabled',
        'auto_calculate_subscriptions',
        'round_prices_to',
        'settings',
        'color',
        'icon',
        'is_active',
        'visible_online',
        'saleable',
        'saleable_from',
        'saleable_to',
        'guest_passes_total',
        'guest_passes_per_month',
        'multi_location_access',
    ];

    protected $casts = [
        'type' => PriceListType::class,
        'structure_id' => 'integer',
        'vat_rate_id' => 'integer',
        'parent_id' => 'integer',
        'price' => 'integer',
        'duration_months' => 'integer',
        'duration_days' => 'integer',
        'is_renewable' => 'boolean',
        'auto_renew_default' => 'boolean',
        'validity_days' => 'integer',
        'max_uses' => 'integer',
        'inherit_from_parent' => 'boolean',
        'override_parent_prices' => 'boolean',
        'is_default' => 'boolean',
        'tax_included' => 'boolean',
        'volume_discount_enabled' => 'boolean',
        'loyalty_discount_enabled' => 'boolean',
        'auto_calculate_subscriptions' => 'boolean',
        'is_active' => 'boolean',
        'visible_online' => 'boolean',
        'saleable' => 'boolean',
        'settings' => 'array',
        'valid_from' => 'date',
        'valid_to' => 'date',
        'saleable_from' => 'date',
        'saleable_to' => 'date',
        'default_tax_rate' => 'float',
        'base_discount_percentage' => 'float',
        'round_prices_to' => 'float',
        'guest_passes_total' => 'integer',
        'guest_passes_per_month' => 'integer',
        'multi_location_access' => 'boolean',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($priceList) {
            if (empty($priceList->slug) && ! empty($priceList->name)) {
                $priceList->slug = Str::slug($priceList->name);
            }
        });

        static::updating(function ($priceList) {
            if ($priceList->isDirty('name') && ! $priceList->isDirty('slug')) {
                $priceList->slug = Str::slug($priceList->name);
            }
        });
    }

    public function toTree(): \Staudenmeir\LaravelAdjacencyList\Eloquent\Collection
    {
        return $this->tree()
            ->orderByRaw('color IS NULL DESC')
            ->orderBy('name')
            ->get()
            ->toTree();
    }

    public function folderTree()
    {
        return $this->tree()
            ->where('type', PriceListType::FOLDER->value)
            ->orderBy('name')
            ->get([
                'id',
                'parent_id',
                'name',
                'type',
                'depth',
                'path',
            ])
            ->toTree();
    }

    public function vat_rate(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(VatRate::class);
    }

    public function sale_row()
    {
        return $this->morphOne(\App\Models\Sale\SaleRow::class, 'enitable');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('price_list')
            ->logOnly(['name'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn (string $eventName) => "Price list {$this->name} has been {$eventName}");
    }
}
