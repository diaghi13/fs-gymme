<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Parental\HasParent;

/**
 * @property mixed $id
 */
class BaseProduct extends Product
{
    use HasParent;

    public function getIsSchedulableAttribute()
    {
        return $this->product_schedules()->count() > 0;
    }

    public function product_schedules(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProductSchedule::class);
    }
}
