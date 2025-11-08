<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class TenantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Skip seeding during tests to have better control over test data
        if (app()->environment('testing')) {
            return;
        }

        $this->call([
            UserSeeder::class,
            StructureSeeder::class,
            // BaseProductSeeder::class,
            VatRateSeeder::class,
            // CourseProductSeeder::class,
            // PriceListSeeder::class,
            PaymentMethodSeeder::class,
            DocumentTypeSeeder::class,
            PaymentConditionSeeder::class,
            FinancialResourceTypeSeeder::class,
            // CustomerSeeder::class,
            // FinancialResourceSeeder::class,
        ]);
    }
}
