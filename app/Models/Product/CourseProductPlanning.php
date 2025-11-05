<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CourseProductPlanning extends Model
{
    /** @use HasFactory<\Database\Factories\Product\CourseProductPlanningFactory> */
    use HasFactory;

    protected $fillable = [
        'product_id',
        'name',
        'start_date',
        'end_date',
        'selected',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'selected' => 'boolean',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(CourseProduct::class, 'product_id');
    }

    public function details(): HasMany
    {
        return $this->hasMany(CourseProductPlanningDetail::class);
    }
}
