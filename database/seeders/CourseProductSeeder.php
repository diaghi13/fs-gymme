<?php

namespace Database\Seeders;

use App\Models\Product\BaseProduct;
use App\Models\Product\CourseProduct;
use App\Models\Structure;
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
            'structure_id' => fake()->randomElement(Structure::all()->pluck('id')),
            'name' => 'Karate',
            'color' => Color::randomHex(),
            'visible' => true,
            'sale_in_subscription' => true,
            'selling_description' => 'Palestra open',
        ]);

        CourseProduct::create([
            'structure_id' => fake()->randomElement(Structure::all()->pluck('id')),
            'name' => 'Thai boxe',
            'color' => Color::randomHex(),
            'visible' => true,
            'sale_in_subscription' => true,
            'selling_description' => 'Nuoto libero',
        ]);

        CourseProduct::create([
            'structure_id' => fake()->randomElement(Structure::all()->pluck('id')),
            'name' => 'Boxe',
            'color' => Color::randomHex(),
            'visible' => true,
            'sale_in_subscription' => true,
            'selling_description' => 'Nuoto libero',
        ]);

        CourseProduct::create([
            'structure_id' => fake()->randomElement(Structure::all()->pluck('id')),
            'name' => 'Zumba',
            'color' => Color::randomHex(),
            'visible' => true,
            'sale_in_subscription' => true,
            'selling_description' => 'Nuoto libero',
        ]);
    }
}
