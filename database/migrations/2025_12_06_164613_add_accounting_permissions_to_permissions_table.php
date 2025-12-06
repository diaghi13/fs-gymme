<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Accounting permissions
        $permissions = [
            'accounting.view_journal',
            'accounting.view_receivables',
            'accounting.manage_payments',
            'accounting.export',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $permissions = [
            'accounting.view_journal',
            'accounting.view_receivables',
            'accounting.manage_payments',
            'accounting.export',
        ];

        foreach ($permissions as $permission) {
            Permission::where('name', $permission)->delete();
        }
    }
};
