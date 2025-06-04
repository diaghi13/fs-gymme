<?php

namespace Database\Seeders;

use App\Models\Product\BaseProduct;
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
            'name' => 'Palestra open',
            'color' => Color::randomHex(),
            'visible' => true,
            'sale_in_subscription' => true,
            'selling_description' => 'Palestra open',
        ]);

        BaseProduct::create([
            'name' => 'Nuoto libero',
            'color' => Color::randomHex(),
            'visible' => true,
            'sale_in_subscription' => true,
            'selling_description' => 'Nuoto libero',
        ]);
    }
}
