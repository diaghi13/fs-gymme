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
        Schema::table('sales', function (Blueprint $table) {
            // Check if column doesn't exist before adding (for idempotency)
            if (! Schema::hasColumn('sales', 'stamp_duty_applied')) {
                $table->boolean('stamp_duty_applied')->default(false)->after('tax_included');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            if (Schema::hasColumn('sales', 'stamp_duty_applied')) {
                $table->dropColumn('stamp_duty_applied');
            }
        });
    }
};
