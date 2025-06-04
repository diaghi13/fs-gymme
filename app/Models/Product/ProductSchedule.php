<?php

namespace App\Models\Product;

use App\Enums\WeekDaysEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductSchedule extends Model
{
    /** @use HasFactory<\Database\Factories\Product\ProductScheduleFactory> */
    use HasFactory;

    protected $fillable = [
        'product_id',
        'day',
        'from_time',
        'to_time',
    ];

    protected $casts = [
        'day' => WeekDaysEnum::class,
    ];

    public function product()
    {
        return $this->belongsTo(BaseProduct::class);
    }
}
