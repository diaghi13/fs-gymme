<?php

namespace Database\Seeders\Tenant;

use Illuminate\Database\Seeder;

class StructureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Structure::create([
            'name' => 'Struttura 1',
            'street' => 'Via Roma',
            'number' => '123',
            'city' => 'Milano',
            'zip_code' => '20100',
            'province' => 'MI',
            'country' => 'IT',
        ]);

        // You can add more structures if needed
        \App\Models\Structure::create([
            'name' => 'Struttura 2',
            'street' => 'Via Milano',
            'number' => '456',
            'city' => 'Roma',
            'zip_code' => '00100',
            'province' => 'RM',
            'country' => 'IT',
        ]);
    }
}
