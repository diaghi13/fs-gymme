<?php

namespace Database\Seeders;

use Database\Seeders\Tenant\BaseProductSeeder;
use Database\Seeders\Tenant\BookableServiceSeeder;
use Database\Seeders\Tenant\CourseProductSeeder;
use Database\Seeders\Tenant\DocumentTypeSeeder;
use Database\Seeders\Tenant\FinancialResourceSeeder;
use Database\Seeders\Tenant\FinancialResourceTypeSeeder;
use Database\Seeders\Tenant\PaymentConditionSeeder;
use Database\Seeders\Tenant\PaymentMethodSeeder;
use Database\Seeders\Tenant\PriceListSeeder;
use Database\Seeders\Tenant\StructureSeeder;
use Database\Seeders\Tenant\VatNatureSeeder;
use Database\Seeders\Tenant\VatRateSeeder;
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
            // Roles & Permissions (must be first)
            TenantRoleSeeder::class,
            TenantPermissionSeeder::class,
            TenantRolePermissionSeeder::class,

            // Application settings & users
            TenantSettingsSeeder::class,
            // UserSeeder::class,

            // Business data
            StructureSeeder::class,  // REQUIRED by BaseProduct, CourseProduct, BookableService
            VatNatureSeeder::class,
            VatRateSeeder::class,
            DocumentTypeSeeder::class,
            PaymentMethodSeeder::class,
            PaymentConditionSeeder::class,
            FinancialResourceTypeSeeder::class,
            FinancialResourceSeeder::class,
            BaseProductSeeder::class,
            CourseProductSeeder::class,
            BookableServiceSeeder::class,
            PriceListSeeder::class,
            // CustomerSeeder::class,
        ]);
    }
}
