<?php

namespace Database\Seeders;

use App\Enums\CentralRoleType;
use App\Models\CentralUser;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CentralUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $superAdminUser = CentralUser::create([
            'first_name' => 'Davide',
            'last_name' => 'Donghi',
            'email' => 'davide.d.donghi@gmail.com',
            'password' => bcrypt('Imbues0868$'),
            'phone' => '+393929579862',
            'birth_date' => '1991-28-03',
            'tax_code' => 'DNGDVD91C28F205S',
            'is_active' => true,
            'gdpr_consent' => true,
            'gdpr_consent_at' => now(),
            'marketing_consent' => true,
            'marketing_consent_at' => now(),
            'data_retention_until' => now()->addYears(50),
            'fcm_token' => 'sample-fcm-token',
            'app_version' => '1.0.0',
        ]);

        $superAdminUser->assignRole(CentralRoleType::SUPER_ADMIN->value);

        $superAdminRolePermissions = \Spatie\Permission\Models\Role::query()
            ->where('name', CentralRoleType::SUPER_ADMIN->value)
            ->first()
            ->permissions;

        $superAdminUser->givePermissionTo($superAdminRolePermissions);
    }
}
