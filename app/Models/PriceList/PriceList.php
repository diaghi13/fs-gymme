<?php

namespace App\Models\PriceList;

use App\Contracts\PriceListContract;
use App\Contracts\VatRateable;
use App\Enums\PriceListItemTypeEnum;
use App\Models\Scopes\StructureScope;
use App\Models\Traits\HasStructure;
use App\Models\VatRate;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Parental\HasChildren;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Staudenmeir\LaravelAdjacencyList\Eloquent\HasRecursiveRelationships;

class PriceList extends Model implements PriceListContract, VatRateable
{
    use HasRecursiveRelationships,
        HasChildren,
        SoftDeletes,
        HasStructure,
        LogsActivity;

    protected $childTypes = [
        PriceListItemTypeEnum::FOLDER->value => Folder::class,
        PriceListItemTypeEnum::ARTICLE->value => Article::class,
        PriceListItemTypeEnum::MEMBERSHIP->value => Membership::class,
        PriceListItemTypeEnum::SUBSCRIPTION->value => Subscription::class,
    ];

    protected $fillable = [
        'structure_id',
        'parent_id',
        'name',
        'slug',
        'description',
        'list_type',
        'list_scope',
        'facility_id',
        'customer_group_id',
        'level',
        'path',
        'priority',
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
        'is_active'
    ];

    protected $casts = [
        'inherit_from_parent' => 'boolean',
        'override_parent_prices' => 'boolean',
        'is_default' => 'boolean',
        'tax_included' => 'boolean',
        'volume_discount_enabled' => 'boolean',
        'loyalty_discount_enabled' => 'boolean',
        'auto_calculate_subscriptions' => 'boolean',
        'is_active' => 'boolean',
        'settings' => 'array',
        'valid_from' => 'date',
        'valid_to' => 'date',
        'default_tax_rate' => 'float',
        'base_discount_percentage' => 'float',
        'round_prices_to' => 'float'
    ];

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
            ->where('type', PriceListItemTypeEnum::FOLDER->value)
            ->orderBy('name')
            ->get([
                'id',
                'parent_id',
                'name',
                'type',
                'saleable',
                'depth',
                'path'
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
