<?php

namespace Database\Seeders\Tenant;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class TenantRolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Owner: Full access to everything
        $owner = Role::findByName('owner', 'web');
        $owner->givePermissionTo(Permission::all());

        // Manager: Almost full access (no fiscal settings)
        $manager = Role::findByName('manager', 'web');
        $manager->givePermissionTo([
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

            // Settings (no manage_fiscal)
            'settings.view',
            'settings.manage_general',
            'settings.manage_billing',

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

            // Accounting (full access)
            'accounting.view_journal',
            'accounting.view_receivables',
            'accounting.manage_payments',
            'accounting.export',
        ]);

        // Back Office: Financial & administrative focus
        $backOffice = Role::findByName('back_office', 'web');
        $backOffice->givePermissionTo([
            // Sales & Finance (full access)
            'sales.view',
            'sales.create',
            'sales.edit',
            'sales.delete',
            'sales.view_profits',

            // Customers (view & financial data)
            'customers.view_all',
            'customers.view_financial',
            'customers.edit', // Can edit for billing purposes

            // Reports (financial only)
            'reports.view_financial',
            'reports.export',

            // Settings (billing & fiscal)
            'settings.view',
            'settings.manage_billing',
            'settings.manage_fiscal',

            // Accounting (view and export only, no manage)
            'accounting.view_journal',
            'accounting.view_receivables',
            'accounting.export',
        ]);

        // Staff: No default permissions (manual assignment)
        // This role intentionally has no permissions assigned by default

        // Trainer: Assigned customers & training management
        $trainer = Role::findByName('trainer', 'web');
        $trainer->givePermissionTo([
            // Customers (only assigned)
            'customers.view_assigned',

            // Training Management
            'training.view_assigned',
            'training.manage',

            // Check-in
            'checkin.perform',
        ]);

        // Receptionist: Check-in and basic customer view
        $receptionist = Role::findByName('receptionist', 'web');
        $receptionist->givePermissionTo([
            // Customers (view only)
            'customers.view_all',

            // Check-in
            'checkin.perform',

            // Reports (operational only)
            'reports.view_operational',
        ]);

        // Customer: No backend permissions (will have mobile app permissions later)
        // This role intentionally has no permissions for the backend

        $this->command->info('✅ Assigned permissions to 7 tenant roles successfully.');
        $this->command->info('   - owner: '.Permission::count().' permissions (all)');
        $this->command->info('   - manager: 33 permissions (including accounting)');
        $this->command->info('   - back_office: 16 permissions (including accounting view)');
        $this->command->info('   - staff: 0 permissions (manual assignment)');
        $this->command->info('   - trainer: 4 permissions');
        $this->command->info('   - receptionist: 3 permissions');
        $this->command->info('   - customer: 0 permissions (mobile app only)');
    }
}
