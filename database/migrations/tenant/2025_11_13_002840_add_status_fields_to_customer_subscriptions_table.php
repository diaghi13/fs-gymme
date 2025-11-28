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
        Schema::table('customer_subscriptions', function (Blueprint $table) {
            $table->enum('status', ['active', 'suspended', 'expired', 'cancelled'])->default('active')->after('notes');
            $table->integer('suspended_days')->default(0)->after('status');
            $table->integer('extended_days')->default(0)->after('suspended_days');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customer_subscriptions', function (Blueprint $table) {
            $table->dropColumn(['status', 'suspended_days', 'extended_days']);
        });
    }
};
