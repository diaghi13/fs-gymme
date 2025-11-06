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
        // Add benefits fields to subscriptions table (if table exists)
        if (Schema::hasTable('subscriptions')) {
            Schema::table('subscriptions', function (Blueprint $table) {
                if (! Schema::hasColumn('subscriptions', 'guest_passes_total')) {
                    $table->integer('guest_passes_total')->nullable()->after('saleable');
                }
                if (! Schema::hasColumn('subscriptions', 'guest_passes_per_month')) {
                    $table->integer('guest_passes_per_month')->nullable()->after('guest_passes_total');
                }
                if (! Schema::hasColumn('subscriptions', 'multi_location_access')) {
                    $table->boolean('multi_location_access')->default(false)->after('guest_passes_per_month');
                }
            });
        }

        // Remove benefits fields from subscription_contents table (if columns exist)
        if (Schema::hasTable('subscription_contents')) {
            Schema::table('subscription_contents', function (Blueprint $table) {
                if (Schema::hasColumn('subscription_contents', 'guest_passes_total')) {
                    $table->dropColumn('guest_passes_total');
                }
                if (Schema::hasColumn('subscription_contents', 'guest_passes_per_month')) {
                    $table->dropColumn('guest_passes_per_month');
                }
                if (Schema::hasColumn('subscription_contents', 'multi_location_access')) {
                    $table->dropColumn('multi_location_access');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restore benefits fields to subscription_contents table
        Schema::table('subscription_contents', function (Blueprint $table) {
            $table->integer('guest_passes_total')->nullable();
            $table->integer('guest_passes_per_month')->nullable();
            $table->boolean('multi_location_access')->default(false);
        });

        // Remove benefits fields from subscriptions table
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropColumn([
                'guest_passes_total',
                'guest_passes_per_month',
                'multi_location_access',
            ]);
        });
    }
};
