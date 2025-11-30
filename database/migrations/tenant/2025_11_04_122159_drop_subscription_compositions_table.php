<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Drop redundant subscription_compositions table.
     * We use subscription_contents instead (which links price_lists to products).
     */
    public function up(): void
    {
        Schema::dropIfExists('subscription_compositions');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate the table if needed for rollback
        Schema::create('subscription_compositions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscription_product_id')
                ->constrained('products') // Fixed: was 'structures', now 'products'
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('included_product_id')
                ->constrained('products')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->integer('quantity')->default(1);
            $table->integer('max_uses')->nullable();
            $table->boolean('unlimited_uses')->default(false);
            $table->integer('validity_from_day')->default(1);
            $table->integer('validity_to_day')->nullable();
            $table->string('validity_type')->default(\App\Enums\SubscriptionValidityType::SUBSCRIPTION_PERIOD->value);
            $table->boolean('is_included_in_base_price')->default(true);
            $table->integer('additional_cost')->default(0);
            $table->integer('cost_per_use')->default(0);
            $table->boolean('requires_booking')->default(false);
            $table->integer('booking_advance_days')->default(0);
            $table->integer('cancellation_hours')->default(24);
            $table->integer('max_uses_per_day')->nullable();
            $table->integer('max_uses_per_week')->nullable();
            $table->integer('max_uses_per_month')->nullable();
            $table->json('allowed_days')->nullable();
            $table->json('allowed_time_slots')->nullable();
            $table->integer('allowed_time_slot_tolerance_in_minutes')->default(0);
            $table->json('blackout_dates')->nullable();
            $table->integer('priority')->default(0);
            $table->integer('sort_order')->default(0);
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['subscription_product_id', 'included_product_id'], 'unique_subscription_composition');
        });
    }
};
