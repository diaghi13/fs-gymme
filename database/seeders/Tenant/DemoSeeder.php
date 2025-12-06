<?php

namespace Database\Seeders\Tenant;

use Illuminate\Database\Seeder;

/**
 * Comprehensive demo seeder for demo tenants.
 *
 * This seeder creates a complete demo environment with:
 * - System configuration (VAT, payment methods, document types, etc.)
 * - Sample customers with subscriptions and medical certs
 * - Sample products (subscriptions, courses, services, etc.)
 * - Sample price lists
 * - Sample sales with payments
 * - Sample documents (invoices, receipts)
 *
 * Perfect for showcasing all app features to potential customers.
 */
class DemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🎭 Seeding DEMO tenant with complete sample data...');

        // 1. System Configuration (Required)
        $this->seedSystemConfiguration();

        // 2. Business Data (Products, Price Lists)
        $this->seedBusinessData();

        // 3. Demo Operational Data (Customers, Sales, Documents)
        $this->seedOperationalData();

        $this->command->info('✅ Demo tenant seeded successfully!');
    }

    /**
     * Seed system configuration (VAT, payment methods, etc).
     * These are required for the app to function properly.
     */
    protected function seedSystemConfiguration(): void
    {
        $this->command->info('   📋 Seeding system configuration...');

        $this->call([
            // Roles & Permissions (already created by InitializeTenantData job)
            // But we ensure they have proper configuration
            TenantRoleSeeder::class,
            TenantPermissionSeeder::class,
            TenantRolePermissionSeeder::class,

            // Settings
            TenantSettingsSeeder::class,

            // Fiscal configuration
            VatNatureSeeder::class,
            VatRateSeeder::class,

            // Document types
            DocumentTypeSeeder::class,
            DocumentTypeGroupSeeder::class,
            DocumentTypeElectronicInvoiceSeeder::class,

            // Payment configuration
            PaymentMethodSeeder::class,
            PaymentConditionSeeder::class,

            // Financial resources
            FinancialResourceTypeSeeder::class,
            FinancialResourceSeeder::class,
        ]);
    }

    /**
     * Seed business data (products, price lists, etc).
     */
    protected function seedBusinessData(): void
    {
        $this->command->info('   🏋️ Seeding business data (products, price lists)...');

        $this->call([
            // Structure is already created by InitializeTenantData job
            // But we can create additional structures if needed
            // StructureSeeder::class,

            // Product categories
            ProductCategorySeeder::class,

            // Products
            BaseProductSeeder::class,        // Memberships, day passes, etc.
            CourseProductSeeder::class,      // Courses with schedules
            BookableServiceSeeder::class,    // Personal training, etc.
            // Add schedules and planning
            ProductScheduleSeeder::class,
            CourseProductPlanningSeeder::class,

            // Price lists
            PriceListSeeder::class,
            PriceListItemSeeder::class,
            PriceListRuleSeeder::class,

            // Subscription plans (internal app subscriptions, not SaaS plans)
            SubscriptionPlanSeeder::class,
            SubscriptionContentSeeder::class,
            SubscriptionCompositionSeeder::class,

            // Promotions
            PromotionSeeder::class,
        ]);
    }

    /**
     * Seed operational demo data (customers, sales, documents).
     */
    protected function seedOperationalData(): void
    {
        $this->command->info('   👥 Seeding operational data (customers, sales, documents)...');

        $this->call([
            // Customers
            // CustomerSeeder::class,              // Creates ~50 demo customers
            CustomerSubscriptionSeeder::class,  // Active customer subscriptions
            MedicalCertificationSeeder::class,  // Medical certificates

            // Sales
            SaleSeeder::class,                  // Creates ~100 demo sales
            SaleRowSeeder::class,               // Sale items
            PaymentSeeder::class,               // Payments for sales

            // Documents
            DocumentSeeder::class,              // Invoices, receipts
            DocumentItemSeeder::class,          // Document line items
            DocumentInstallmentSeeder::class,   // Payment installments
        ]);
    }
}
