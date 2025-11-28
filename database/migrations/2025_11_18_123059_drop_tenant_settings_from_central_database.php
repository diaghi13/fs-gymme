<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Drop tenant_settings table from central database.
     * This table should only exist in tenant databases, not in the central database.
     */
    public function up(): void
    {
        // IMPORTANT: Only run this on central database, never on tenant databases
        if (tenancy()->initialized) {
            // Skip if running in tenant context
            return;
        }

        // Drop tenant_settings table from central database if it exists
        Schema::dropIfExists('tenant_settings');
    }

    /**
     * Reverse the migrations.
     *
     * This migration is not reversible as tenant_settings should never
     * exist in the central database. It's a tenant-specific table.
     */
    public function down(): void
    {
        // Do nothing - tenant_settings should not be recreated in central database
    }
};
