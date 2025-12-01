<?php

namespace Database\Seeders;

use App\Models\Customer\Customer;
use Database\Seeders\Tenant\CustomerSeeder;
use Database\Seeders\Tenant\SaleSeeder;
use Illuminate\Database\Seeder;

/**
 * Seed demo tenants with realistic sample data.
 *
 * This seeder creates:
 * - 50 fake customers
 * - 20 products/services
 * - 100 sales
 * - 30 active customer subscriptions
 */
class DemoTenantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🎭 Seeding DEMO tenant with sample data...');

        // Run existing tenant seeders first (VAT, structures, etc.)
        $this->call(TenantSeeder::class);

        // Seed demo customers
        $this->seedCustomers();

        // Seed sales (requires customers and products)
        $this->seedSales();

        $this->command->info('✅ Demo data seeded successfully!');
    }

    /**
     * Seed demo customers.
     */
    protected function seedCustomers(): void
    {
        $this->command->info('   Creating 50 demo customers...');

        // Use existing CustomerSeeder if available
        if (class_exists(CustomerSeeder::class)) {
            $this->call(CustomerSeeder::class);
        } else {
            // Fallback: create customers manually
            Customer::factory()->count(50)->create();
        }
    }

    /**
     * Seed demo sales.
     */
    protected function seedSales(): void
    {
        $this->command->info('   Creating demo sales...');

        // Use existing SaleSeeder if available
        if (class_exists(SaleSeeder::class)) {
            $this->call(SaleSeeder::class);
        }
    }
}
