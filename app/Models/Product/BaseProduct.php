<?php

namespace App\Models\Product;

use App\Models\Scopes\StructureScope;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Parental\HasParent;

/**
 * @property mixed $id
 */
class BaseProduct extends Product
{
    use HasParent;

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            $product->selling_description = !$product->selling_description
                ? $product->name
                : $product->selling_description;

            $product->structure_id = 1;
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
