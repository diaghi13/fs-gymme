<?php

namespace App\Models\PriceList;

use App\Contracts\PriceListContract;
use App\Contracts\VatRateable;
use App\Enums\PriceListItemTypeEnum;
use App\Models\VatRate;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Parental\HasChildren;
use Staudenmeir\LaravelAdjacencyList\Eloquent\HasRecursiveRelationships;

class PriceList extends Model implements PriceListContract, VatRateable
{
    use HasRecursiveRelationships,
        HasChildren,
        SoftDeletes;

    protected $childTypes = [
        PriceListItemTypeEnum::FOLDER->value => Folder::class,
        PriceListItemTypeEnum::ARTICLE->value => Article::class,
        PriceListItemTypeEnum::MEMBERSHIP->value => Membership::class,
        PriceListItemTypeEnum::SUBSCRIPTION->value => Subscription::class,
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
}
