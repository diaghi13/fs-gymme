<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseProductPlanningDetail extends Model
{
    /** @use HasFactory<\Database\Factories\Product\CourseProductDetailFactory> */
    use HasFactory;

    protected $fillable = [
        'course_product_planning_id',
        'day',
        'time',
        'duration_in_minutes',
        'instructor_id',
        'room_id',
    ];

    protected $casts = [
        'time' => 'datetime:H:i:s',
        'duration_in_minutes' => 'integer',
    ];

    public function planning(): BelongsTo
    {
        return $this->belongsTo(CourseProductPlanning::class, 'course_product_planning_id');
    }
}
