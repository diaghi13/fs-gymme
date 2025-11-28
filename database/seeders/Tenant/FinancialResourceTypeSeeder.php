<?php

namespace Database\Seeders\Tenant;

use Illuminate\Database\Seeder;

class FinancialResourceTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            'bank',
            'cash',
            'credit_card',
        ];

        foreach ($types as $type) {
            \App\Models\Support\FinancialResourceType::query()->create(['name' => $type]);
        }
    }
}
