<?php

namespace Database\Seeders;

use App\Models\Product\BaseProduct;
use App\Models\Structure;
use App\Support\Color;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BaseProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        BaseProduct::create([
            'structure_id' => fake()->randomElement(Structure::all()->pluck('id')),
            'name' => 'Palestra open',
            'color' => Color::randomHex(),
            'visible' => true,
            'sale_in_subscription' => true,
            'selling_description' => 'Palestra open',
        ]);

        BaseProduct::create([
            'structure_id' => fake()->randomElement(Structure::all()->pluck('id')),
            'name' => 'Nuoto libero',
            'color' => Color::randomHex(),
            'visible' => true,
            'sale_in_subscription' => true,
            'selling_description' => 'Nuoto libero',
        ]);

        BaseProduct::create([
            'structure_id' => fake()->randomElement(Structure::all()->pluck('id')),
            'name' => 'Paddle',
            'color' => Color::randomHex(),
            'visible' => true,
            'sale_in_subscription' => true,
            'selling_description' => 'Paddle',
        ]);

        BaseProduct::create([
            'structure_id' => fake()->randomElement(Structure::all()->pluck('id')),
            'name' => 'Sala ring',
            'color' => Color::randomHex(),
            'visible' => true,
            'sale_in_subscription' => true,
            'selling_description' => 'Sala ring',
        ]);
    }
}
