<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Remove fields that belong to PriceList domain, not Product domain.
     * Products = catalog of services (what we offer)
     * PriceLists = commercial offerings (how we sell them)
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Remove subscription-specific fields (belong to PriceList Subscription)
            $table->dropColumn([
                'subscription_duration_months',
                'subscription_duration_days',
                'subscription_type',
                'is_renewable',
                'auto_renew_default',
            ]);

            // Remove token/carnet fields (belong to PriceList Token/DayPass)
            $table->dropColumn([
                'validity_days',
                'max_uses_per_period',
                'max_uses_total',
            ]);

            // Remove sales fields (belong to PriceList)
            $table->dropColumn([
                'saleable_in_subscription',
                'selling_description',
            ]);

            // Remove category (we'll use folders in price_lists for organization)
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');

            // Remove unit_type (not needed, we know type from 'type' column)
            $table->dropColumn('unit_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Restore subscription fields
            $table->integer('subscription_duration_months')->nullable();
            $table->integer('subscription_duration_days')->nullable();
            $table->string('subscription_type')->default(\App\Enums\SubscriptionType::FLEXIBLE);
            $table->boolean('is_renewable')->default(false);
            $table->boolean('auto_renew_default')->default(false);

            // Restore token fields
            $table->integer('validity_days')->nullable();
            $table->integer('max_uses_per_period')->nullable();
            $table->integer('max_uses_total')->nullable();

            // Restore sales fields
            $table->boolean('saleable_in_subscription')->default(true);
            $table->longText('selling_description')->nullable();

            // Restore category
            $table->foreignId('category_id')
                ->nullable()
                ->constrained('product_categories')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            // Restore unit_type
            $table->string('unit_type')->default(\App\Enums\UnitType::PIECE->value);
        });
    }
};
