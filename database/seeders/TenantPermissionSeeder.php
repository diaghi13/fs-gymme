<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class TenantPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // Sales & Finance
            'sales.view',
            'sales.create',
            'sales.edit',
            'sales.delete',
            'sales.view_profits',

            // Customers
            'customers.view_all',
            'customers.view_assigned',
            'customers.create',
            'customers.edit',
            'customers.delete',
            'customers.view_financial',

            // Products
            'products.view',
            'products.manage',

            // Price Lists
            'pricelists.view',
            'pricelists.manage',

            // Reports
            'reports.view_financial',
            'reports.view_operational',
            'reports.export',

            // Settings
            'settings.view',
            'settings.manage_general',
            'settings.manage_billing',
            'settings.manage_fiscal',

            // Users Management
            'users.view',
            'users.invite',
            'users.manage',
            'users.delete',

            // Training Management
            'training.view_all',
            'training.view_assigned',
            'training.manage',

            // Check-in
            'checkin.perform',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        $this->command->info('✅ Seeded 30 tenant permissions successfully.');
    }
}
