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
        Schema::table('vat_rates', function (Blueprint $table) {
            // Add new fields
            $table->boolean('is_active')->default(true)->after('nature');
            $table->boolean('is_system')->default(false)->after('is_active');

            // Remove unused fields
            $table->dropColumn([
                'withholding_tax_application',
                'social_security_withholding_application',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vat_rates', function (Blueprint $table) {
            // Restore removed fields
            $table->boolean('withholding_tax_application')->default(true);
            $table->boolean('social_security_withholding_application')->default(true);

            // Remove added fields
            $table->dropColumn(['is_active', 'is_system']);
        });
    }
};
