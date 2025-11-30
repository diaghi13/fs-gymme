<?php

namespace App\Models\Customer;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerMeasurement extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'measured_at',
        'weight',
        'height',
        'bmi',
        'chest_circumference',
        'waist_circumference',
        'hips_circumference',
        'arm_circumference',
        'thigh_circumference',
        'body_fat_percentage',
        'lean_mass_percentage',
        'notes',
        'measured_by',
    ];

    protected $casts = [
        'measured_at' => 'date',
        'weight' => 'decimal:2',
        'height' => 'decimal:2',
        'bmi' => 'decimal:2',
        'chest_circumference' => 'decimal:2',
        'waist_circumference' => 'decimal:2',
        'hips_circumference' => 'decimal:2',
        'arm_circumference' => 'decimal:2',
        'thigh_circumference' => 'decimal:2',
        'body_fat_percentage' => 'decimal:2',
        'lean_mass_percentage' => 'decimal:2',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function measuredBy(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'measured_by');
    }

    /**
     * Auto-calculate BMI if weight and height are present
     */
    protected static function booted(): void
    {
        static::saving(function (CustomerMeasurement $measurement) {
            if ($measurement->weight && $measurement->height) {
                // BMI = weight (kg) / (height (m))^2
                $heightInMeters = $measurement->height / 100;
                $measurement->bmi = round($measurement->weight / ($heightInMeters * $heightInMeters), 2);
            }
        });
    }
}
