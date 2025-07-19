<?php

namespace Database\Seeders;

use App\Enums\FinancialResourceTypeEnum;
use App\Models\Support\FinancialResource;
use App\Models\Support\FinancialResourceType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FinancialResourceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        FinancialResourceType::query()->where('name', FinancialResourceTypeEnum::BANK->value)->firstOrCreate([
            'name' => FinancialResourceTypeEnum::BANK->value,
        ])->financial_resources()->create([
            'type' => FinancialResourceTypeEnum::BANK->value,
            'name' => 'Unipol',
            'iban' => 'IT60X0542811101000000123456',
            'is_active' => true,
            'default' => true,
        ]);

        FinancialResourceType::query()->where('name', FinancialResourceTypeEnum::CASH->value)->firstOrCreate([
            'name' => FinancialResourceTypeEnum::CASH->value,
        ])->financial_resources()->create([
            'type' => FinancialResourceTypeEnum::CASH->value,
            'name' => 'Cassa',
            'is_active' => true,
            'default' => true,
        ]);

        FinancialResourceType::query()->where('name', FinancialResourceTypeEnum::CASH->value)->firstOrCreate([
            'name' => FinancialResourceTypeEnum::CASH->value,
        ])->financial_resources()->create([
            'type' => FinancialResourceTypeEnum::CASH->value,
            'name' => 'Unipol',
            'is_active' => true,
            'default' => true,
        ]);
    }
}
