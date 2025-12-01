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
        Schema::table('tenants', function (Blueprint $table) {
            $table->boolean('is_demo')->default(false)->after('is_active');
            $table->dateTime('demo_expires_at')->nullable()->after('is_demo');
            $table->string('payment_method')->default('stripe')->after('demo_expires_at'); // stripe, bank_transfer
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['is_demo', 'demo_expires_at', 'payment_method']);
        });
    }
};
