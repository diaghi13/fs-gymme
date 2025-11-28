<?php

namespace Database\Seeders\Tenant;

use App\Models\Product\BookableService;
use App\Support\Color;
use Illuminate\Database\Seeder;

class BookableServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $vatRateId = 1; // Standard 22%

        BookableService::create([
            'structure_id' => 1,
            'name' => 'Personal Training',
            'color' => Color::randomHex(),
            'is_active' => true,
            'is_bookable' => true,
            'requires_trainer' => true,
            'saleable_in_subscription' => false,
            'selling_description' => 'Personal Training',
            'vat_rate_id' => $vatRateId,
            'duration_minutes' => 60,
        ]);

        BookableService::create([
            'structure_id' => 1,
            'name' => 'Massaggio Sportivo',
            'color' => Color::randomHex(),
            'is_active' => true,
            'is_bookable' => true,
            'requires_trainer' => true,
            'saleable_in_subscription' => false,
            'selling_description' => 'Massaggio Sportivo',
            'vat_rate_id' => $vatRateId,
            'duration_minutes' => 50,
        ]);

        BookableService::create([
            'structure_id' => 1,
            'name' => 'Consulenza Nutrizionale',
            'color' => Color::randomHex(),
            'is_active' => true,
            'is_bookable' => true,
            'requires_trainer' => true,
            'saleable_in_subscription' => false,
            'selling_description' => 'Consulenza Nutrizionale',
            'vat_rate_id' => $vatRateId,
            'duration_minutes' => 45,
        ]);

        BookableService::create([
            'structure_id' => 1,
            'name' => 'Valutazione Posturale',
            'color' => Color::randomHex(),
            'is_active' => true,
            'is_bookable' => true,
            'requires_trainer' => true,
            'saleable_in_subscription' => false,
            'selling_description' => 'Valutazione Posturale',
            'vat_rate_id' => $vatRateId,
            'duration_minutes' => 30,
        ]);

        BookableService::create([
            'structure_id' => 1,
            'name' => 'Massaggio Relax',
            'color' => Color::randomHex(),
            'is_active' => true,
            'is_bookable' => true,
            'requires_trainer' => true,
            'saleable_in_subscription' => false,
            'selling_description' => 'Massaggio Relax',
            'vat_rate_id' => $vatRateId,
            'duration_minutes' => 60,
        ]);
    }
}
