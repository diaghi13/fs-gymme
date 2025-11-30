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
        Schema::table('subscription_contents', function (Blueprint $table) {
            // Access rules
            $table->boolean('unlimited_entries')->default(false)->after('is_optional');
            $table->integer('total_entries')->nullable()->after('unlimited_entries');
            $table->integer('daily_entries')->nullable()->after('total_entries');
            $table->integer('weekly_entries')->nullable()->after('daily_entries');
            $table->integer('monthly_entries')->nullable()->after('weekly_entries');

            // Booking rules
            $table->integer('max_concurrent_bookings')->nullable()->after('monthly_entries');
            $table->integer('daily_bookings')->nullable()->after('max_concurrent_bookings');
            $table->integer('weekly_bookings')->nullable()->after('daily_bookings');
            $table->integer('advance_booking_days')->nullable()->after('weekly_bookings');
            $table->integer('cancellation_hours')->nullable()->after('advance_booking_days');

            // Validity rules
            $table->string('validity_type')->default('duration')->after('cancellation_hours');
            $table->integer('validity_days')->nullable()->after('validity_type');
            $table->integer('validity_months')->nullable()->after('validity_days');
            $table->date('valid_from')->nullable()->after('validity_months');
            $table->date('valid_to')->nullable()->after('valid_from');
            $table->integer('freeze_days_allowed')->nullable()->after('valid_to');
            $table->integer('freeze_cost_cents')->nullable()->after('freeze_days_allowed');

            // Time restrictions
            $table->boolean('has_time_restrictions')->default(false)->after('freeze_cost_cents');

            // Service access
            $table->string('service_access_type')->default('all')->after('has_time_restrictions');

            // Benefits & perks
            $table->integer('discount_percentage')->nullable()->after('service_access_type');

            // Metadata
            $table->integer('sort_order')->default(0)->after('discount_percentage');
            $table->json('settings')->nullable()->after('sort_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscription_contents', function (Blueprint $table) {
            $table->dropColumn([
                // Access rules
                'unlimited_entries',
                'total_entries',
                'daily_entries',
                'weekly_entries',
                'monthly_entries',

                // Booking rules
                'max_concurrent_bookings',
                'daily_bookings',
                'weekly_bookings',
                'advance_booking_days',
                'cancellation_hours',

                // Validity rules
                'validity_type',
                'validity_days',
                'validity_months',
                'valid_from',
                'valid_to',
                'freeze_days_allowed',
                'freeze_cost_cents',

                // Time restrictions
                'has_time_restrictions',

                // Service access
                'service_access_type',

                // Benefits & perks
                'discount_percentage',

                // Metadata
                'sort_order',
                'settings',
            ]);
        });
    }
};
