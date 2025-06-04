<?php

namespace App\Services\PriceList;

use App\Enums\PriceListItemTypeEnum;
use App\Models\PriceList\PriceList;
use App\Services\VatRateService;

class PriceListService
{
    public static function toTree()
    {
        return (new PriceList)->toTree();
    }

    public static function foldersToTreeOptions()
    {
        return PriceList::where('type', PriceListItemTypeEnum::FOLDER->value)->get(['id', 'name'])->map(function ($option) {
            return ['value' => $option->id, 'label' => $option->name];
        });
    }

    public static function getViewAttributes()
    {
        return [
            'priceLists' => PriceListService::toTree(),
            'priceListOptions' => PriceListService::foldersToTreeOptions(),
            'priceListOptionsTree' => (new PriceList())->folderTree(),
            'vatRateOptions' => VatRateService::toOptions(),
        ];
    }
}
