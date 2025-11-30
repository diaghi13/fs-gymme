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
        Schema::create('data_retention_policies', function (Blueprint $table) {
            $table->id();

            $table->foreignId('structure_id')
                ->nullable()
                ->constrained('structures')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            // Fiscal data retention (legally required)
            $table->integer('fiscal_retention_years')->default(10);

            // Marketing data retention (user-defined)
            $table->integer('marketing_retention_months')->nullable();

            // Customer data retention after last activity
            $table->integer('customer_inactive_retention_months')->default(24);

            // Automatic cleanup settings
            $table->boolean('auto_delete_after_retention')->default(false);
            $table->boolean('auto_anonymize_after_retention')->default(true);

            // Last cleanup execution
            $table->timestamp('last_cleanup_at')->nullable();
            $table->integer('last_cleanup_records_count')->default(0);

            // Notification settings
            $table->boolean('notify_before_cleanup')->default(true);
            $table->integer('notify_days_before')->default(30);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_retention_policies');
    }
};
