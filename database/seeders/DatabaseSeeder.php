<?php

namespace Database\Seeders;

use App\Models\CentralUser;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command->error('This seeder should not be run in production!');
            return;
        }

        $user = CentralUser::create([
            'first_name' => 'Mario',
            'last_name' => 'Rossi',
            'email' => 'mario.rossi@example.com',
            'password' => bcrypt('password'),
            'phone' => '+1234567890',
            'birth_date' => '1990-01-01',
            'tax_code' => 'RSSMRA90A01H501Z',
            'is_active' => true,
            'gdpr_consent' => true,
            'gdpr_consent_at' => now(),
            'marketing_consent' => true,
            'marketing_consent_at' => now(),
            'data_retention_until' => now()->addYears(5),
            'fcm_token' => 'sample-fcm-token',
            'app_version' => '1.0.0',
        ]);

        $role = \Spatie\Permission\Models\Role::create(['name' => 'super-admin']);
        $permission = \Spatie\Permission\Models\Permission::create(['name' => 'manage-users']);
        $role->givePermissionTo($permission);

        $user->assignRole($role);
        $user->givePermissionTo($permission);

        DB::statement('DROP SCHEMA IF EXISTS `gymme-tenant_test`');

        if (!tenancy()->find('test')) {
            $tenant = $this->createTenant();

            // Associate the user with the tenant
            $user->tenants()->attach($tenant);
        }

        $roles = ['admin', 'manager', 'instructor', 'staff', 'customer'];
        foreach ($roles as $roleName) {
            \Spatie\Permission\Models\Role::create(['name' => $roleName]);
        }

        CentralUser::factory(1)
            ->create()
            ->each(function ($user) {
                $user->assignRole('admin');
                $user->assignRole('manager');
                $user->tenants()->attach(tenancy()->find('test'));
            });

        CentralUser::factory(2)
            ->create()
            ->each(function ($user) {
                $user->assignRole('manager');
                $user->tenants()->attach(tenancy()->find('test'));
            });

        CentralUser::factory(2)
            ->create()
            ->each(function ($user) {
                $user->assignRole('staff');
                $user->tenants()->attach(tenancy()->find('test'));
            });

        CentralUser::factory(5)
            ->create()
            ->each(function ($user) {
                $user->assignRole('instructor');
                $user->tenants()->attach(tenancy()->find('test'));
            });

        CentralUser::factory(90)
            ->create()
            ->each(function ($user) {
                $user->assignRole('customer');
                $user->tenants()->attach(tenancy()->find('test'));
            });

        $this->call([

        ]);
    }

    protected function createTenant(string $id = 'test', $name = 'Company One'): Tenant
    {
        // Create a tenant for the user
        return Tenant::create([
            'id' => $id,
            'name' => $name,
            'slug' => Str::slug($name),
            'vat_number' => 'IT12345678901',
            'tax_code' => 'IT12345678901',
            'address' => '123 Main St, City, Country',
            'city' => 'City',
            'postal_code' => '12345',
            'country' => 'IT',
            'phone' => '+1234567890',
            'email' => '',
            'pec_email' => '',
            'sdi_code' => '',
            'is_active' => true,
            'data' => json_encode(['additional_info' => 'Some extra data']),
        ]);
    }
}
