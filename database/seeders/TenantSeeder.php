<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TenantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call([
            BaseProductSeeder::class,
            VatRateSeeder::class,
            CourseProductSeeder::class,
            PriceListSeeder::class,
            PaymentMethodSeeder::class,
            DocumentTypeSeeder::class,
            PaymentConditionSeeder::class,
            FinancialResourceTypeSeeder::class,
            CustomerSeeder::class,
        ]);
    }
}
