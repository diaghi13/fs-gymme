<?php

namespace Database\Seeders;

use App\Enums\CentralRoleType;
use App\Enums\CentralPermissionType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CentralRolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = array_map(function ($role) {
            return $role->value;
        }, CentralRoleType::cases());

        $permissions = array_map(function ($permission) {
            return $permission->value;
        }, CentralPermissionType::cases());

        // Create Roles
        foreach ($roles as $roleName) {
            \Spatie\Permission\Models\Role::firstOrCreate(['name' => $roleName]);
        }

        // Create Permissions
        foreach ($permissions as $permissionName) {
            \Spatie\Permission\Models\Permission::firstOrCreate(['name' => $permissionName]);
        }

        // Assign all permissions to super-admin role
        $superAdminRole = \Spatie\Permission\Models\Role::where('name', CentralRoleType::SUPER_ADMIN->value)->first();
        if ($superAdminRole) {
            $superAdminRole->givePermissionTo(\Spatie\Permission\Models\Permission::all());
        }

        // Assign permissions to admin role
        $adminRole = \Spatie\Permission\Models\Role::where('name', CentralRoleType::ADMIN)->first();
        if ($adminRole) {
            $adminPermissions = [
                CentralPermissionType::MANAGE_USERS->value,
                CentralPermissionType::MANAGE_SETTINGS->value,
                CentralPermissionType::MANAGE_BILLING->value,
                CentralPermissionType::MANAGE_SUBSCRIPTIONS->value,
                CentralPermissionType::MANAGE_CUSTOMERS->value,

                CentralPermissionType::VIEW_DASHBOARD->value,
                CentralPermissionType::VIEW_ANALYTICS->value,
                CentralPermissionType::VIEW_REPORTS->value,
                CentralPermissionType::VIEW_LOGS->value,
                CentralPermissionType::VIEW_SETTINGS->value,
                CentralPermissionType::VIEW_USERS->value,
                CentralPermissionType::VIEW_TENANTS->value,
                CentralPermissionType::VIEW_BILLING->value,
                CentralPermissionType::VIEW_SUBSCRIPTIONS->value,
                CentralPermissionType::VIEW_CUSTOMERS->value,

                CentralPermissionType::ACCESS_API->value,
            ];
            $adminRole->givePermissionTo($adminPermissions);
        }

        // Assign permissions to tenant admin role
        $tenantAdminRole = \Spatie\Permission\Models\Role::where('name', CentralRoleType::TENANT_ADMIN)->first();
        if ($tenantAdminRole) {
            $tenantAdminPermissions = [
                CentralPermissionType::VIEW_DASHBOARD->value,
                CentralPermissionType::VIEW_ANALYTICS->value,
            ];
            $tenantAdminRole->givePermissionTo($tenantAdminPermissions);
        }

        // Assign permissions to customer role
        $customerRole = \Spatie\Permission\Models\Role::where('name', CentralRoleType::CUSTOMER)->first();
        if ($customerRole) {
            $customerPermissions = [
                CentralPermissionType::VIEW_DASHBOARD->value,
                CentralPermissionType::VIEW_ANALYTICS->value,
            ];
            $customerRole->givePermissionTo($customerPermissions);
        }

        // Assign permissions to user role
        $userRole = \Spatie\Permission\Models\Role::where('name', CentralRoleType::USER)->first();
        if ($userRole) {
            $userPermissions = [
                CentralPermissionType::VIEW_DASHBOARD->value,
            ];
            $userRole->givePermissionTo($userPermissions);
        }
    }
}
