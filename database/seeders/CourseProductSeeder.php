<?php

namespace Database\Seeders;

use App\Models\Product\BaseProduct;
use App\Models\Product\CourseProduct;
use App\Support\Color;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CourseProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        CourseProduct::create([
            'name' => 'Karate',
            'color' => Color::randomHex(),
            'visible' => true,
            'sale_in_subscription' => true,
            'selling_description' => 'Palestra open',
        ]);

        CourseProduct::create([
            'name' => 'Thai boxe',
            'color' => Color::randomHex(),
            'visible' => true,
            'sale_in_subscription' => true,
            'selling_description' => 'Nuoto libero',
        ]);

        CourseProduct::create([
            'name' => 'Boxe',
            'color' => Color::randomHex(),
            'visible' => true,
            'sale_in_subscription' => true,
            'selling_description' => 'Nuoto libero',
        ]);

        CourseProduct::create([
            'name' => 'Zumba',
            'color' => Color::randomHex(),
            'visible' => true,
            'sale_in_subscription' => true,
            'selling_description' => 'Nuoto libero',
        ]);
    }
}
