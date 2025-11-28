<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class TenantRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $roles = [
            'owner',        // Proprietario del tenant con accesso completo
            'manager',      // Manager con gestione operativa completa
            'back_office',  // Responsabile amministrativo e contabile
            'staff',        // Ruolo generico flessibile (permissions manuali)
            'trainer',      // Istruttore con accesso clienti assegnati
            'receptionist', // Addetto reception con check-in
            'customer',     // Cliente con accesso app mobile
        ];

        foreach ($roles as $roleName) {
            Role::firstOrCreate([
                'name' => $roleName,
                'guard_name' => 'web',
            ]);
        }

        $this->command->info('✅ Seeded 7 tenant roles successfully.');
    }
}
