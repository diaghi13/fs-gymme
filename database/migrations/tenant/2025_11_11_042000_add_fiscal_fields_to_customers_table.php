<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            // Add missing fields for electronic invoice
            $table->string('company_name')->nullable()->after('last_name');
            $table->string('vat_number')->nullable()->after('tax_id_code');

            // Add alias for backward compatibility
            $table->string('tax_code')->nullable()->after('vat_number')
                ->comment('Alias for tax_id_code - for electronic invoice compatibility');
        });

        // Copy existing tax_id_code to tax_code for compatibility
        DB::statement('UPDATE customers SET tax_code = tax_id_code WHERE tax_id_code IS NOT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['company_name', 'vat_number', 'tax_code']);
        });
    }
};
