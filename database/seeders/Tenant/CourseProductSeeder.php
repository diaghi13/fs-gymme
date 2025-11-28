<?php

namespace Database\Seeders\Tenant;

use App\Models\Product\CourseProduct;
use App\Support\Color;
use Illuminate\Database\Seeder;

class CourseProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $vatRateId = 1; // Standard 22%

        CourseProduct::create([
            'structure_id' => 1,
            'name' => 'Spinning',
            'color' => Color::randomHex(),
            'is_active' => true,
            'saleable_in_subscription' => true,
            'selling_description' => 'Spinning',
            'vat_rate_id' => $vatRateId,
            'duration_minutes' => 50,
            'max_participants' => 20,
        ]);

        CourseProduct::create([
            'structure_id' => 1,
            'name' => 'Yoga',
            'color' => Color::randomHex(),
            'is_active' => true,
            'saleable_in_subscription' => true,
            'selling_description' => 'Yoga',
            'vat_rate_id' => $vatRateId,
            'duration_minutes' => 60,
            'max_participants' => 15,
        ]);

        CourseProduct::create([
            'structure_id' => 1,
            'name' => 'Pilates',
            'color' => Color::randomHex(),
            'is_active' => true,
            'saleable_in_subscription' => true,
            'selling_description' => 'Pilates',
            'vat_rate_id' => $vatRateId,
            'duration_minutes' => 55,
            'max_participants' => 12,
        ]);

        CourseProduct::create([
            'structure_id' => 1,
            'name' => 'Crossfit',
            'color' => Color::randomHex(),
            'is_active' => true,
            'saleable_in_subscription' => true,
            'selling_description' => 'Crossfit',
            'vat_rate_id' => $vatRateId,
            'duration_minutes' => 60,
            'max_participants' => 15,
        ]);

        CourseProduct::create([
            'structure_id' => 1,
            'name' => 'Acquagym',
            'color' => Color::randomHex(),
            'is_active' => true,
            'saleable_in_subscription' => true,
            'selling_description' => 'Acquagym',
            'vat_rate_id' => $vatRateId,
            'duration_minutes' => 45,
            'max_participants' => 18,
        ]);

        CourseProduct::create([
            'structure_id' => 1,
            'name' => 'Boxe',
            'color' => Color::randomHex(),
            'is_active' => true,
            'saleable_in_subscription' => true,
            'selling_description' => 'Boxe',
            'vat_rate_id' => $vatRateId,
            'duration_minutes' => 90,
            'max_participants' => 10,
        ]);
    }
}
