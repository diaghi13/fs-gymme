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
        // Add benefits fields to price_lists table for subscription type (using STI)
        if (Schema::hasTable('price_lists')) {
            Schema::table('price_lists', function (Blueprint $table) {
                if (! Schema::hasColumn('price_lists', 'guest_passes_total')) {
                    $table->integer('guest_passes_total')->nullable();
                }
                if (! Schema::hasColumn('price_lists', 'guest_passes_per_month')) {
                    $table->integer('guest_passes_per_month')->nullable();
                }
                if (! Schema::hasColumn('price_lists', 'multi_location_access')) {
                    $table->boolean('multi_location_access')->default(false);
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
        if (Schema::hasTable('subscription_contents')) {
            Schema::table('subscription_contents', function (Blueprint $table) {
                if (! Schema::hasColumn('subscription_contents', 'guest_passes_total')) {
                    $table->integer('guest_passes_total')->nullable();
                }
                if (! Schema::hasColumn('subscription_contents', 'guest_passes_per_month')) {
                    $table->integer('guest_passes_per_month')->nullable();
                }
                if (! Schema::hasColumn('subscription_contents', 'multi_location_access')) {
                    $table->boolean('multi_location_access')->default(false);
                }
            });
        }

        // Remove benefits fields from price_lists table
        if (Schema::hasTable('price_lists')) {
            Schema::table('price_lists', function (Blueprint $table) {
                if (Schema::hasColumn('price_lists', 'guest_passes_total')) {
                    $table->dropColumn('guest_passes_total');
                }
                if (Schema::hasColumn('price_lists', 'guest_passes_per_month')) {
                    $table->dropColumn('guest_passes_per_month');
                }
                if (Schema::hasColumn('price_lists', 'multi_location_access')) {
                    $table->dropColumn('multi_location_access');
                }
            });
        }
    }
};
