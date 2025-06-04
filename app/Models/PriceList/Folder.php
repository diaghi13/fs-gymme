<?php

namespace App\Models\PriceList;

use App\Enums\PriceListItemTypeEnum;
use Illuminate\Database\Eloquent\Model;
use Parental\HasParent;

class Folder extends PriceList
{
    use HasParent;

    protected $fillable = [
        "name",
        "saleable",
        "parent_id",
        "saleable_from",
        "saleable_to",
    ];

    protected $casts = [
        'saleable' => 'boolean',
        'saleable_from' => 'date',
        'saleable_to' => 'date',
        'parent_id' => 'integer',
    ];

    protected $attributes = [
        'type' => PriceListItemTypeEnum::FOLDER->value,
    ];
}
