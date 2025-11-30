<?php

namespace Database\Seeders\Tenant;

use App\Models\Product\BaseProduct;
use App\Support\Color;
use Illuminate\Database\Seeder;

class BaseProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $vatRateId = 1; // Standard 22%

        BaseProduct::create([
            'structure_id' => 1,
            'name' => 'Sala Pesi e Cardio',
            'color' => Color::randomHex(),
            'is_active' => true,
            'saleable_in_subscription' => true,
            'selling_description' => 'Sala Pesi e Cardio',
            'vat_rate_id' => $vatRateId,
        ]);

        BaseProduct::create([
            'structure_id' => 1,
            'name' => 'Piscina',
            'color' => Color::randomHex(),
            'is_active' => true,
            'saleable_in_subscription' => true,
            'selling_description' => 'Piscina',
            'vat_rate_id' => $vatRateId,
        ]);

        BaseProduct::create([
            'structure_id' => 1,
            'name' => 'Area Funzionale',
            'color' => Color::randomHex(),
            'is_active' => true,
            'saleable_in_subscription' => true,
            'selling_description' => 'Area Funzionale',
            'vat_rate_id' => $vatRateId,
        ]);

        BaseProduct::create([
            'structure_id' => 1,
            'name' => 'Sala Combat',
            'color' => Color::randomHex(),
            'is_active' => true,
            'saleable_in_subscription' => true,
            'selling_description' => 'Sala Combat',
            'vat_rate_id' => $vatRateId,
        ]);

        BaseProduct::create([
            'structure_id' => 1,
            'name' => 'Spa & Relax',
            'color' => Color::randomHex(),
            'is_active' => true,
            'saleable_in_subscription' => true,
            'selling_description' => 'Spa & Relax',
            'vat_rate_id' => $vatRateId,
        ]);
    }
}
