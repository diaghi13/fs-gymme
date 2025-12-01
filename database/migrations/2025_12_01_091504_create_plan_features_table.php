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
        Schema::create('plan_features', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // e.g., 'electronic_invoicing', 'multi_location'
            $table->string('display_name'); // e.g., 'Fatturazione Elettronica'
            $table->text('description')->nullable();
            $table->string('feature_type')->default('boolean'); // boolean, quota, metered
            $table->boolean('is_addon_purchasable')->default(false); // Can be purchased as standalone addon
            $table->integer('default_addon_price_cents')->nullable(); // Default price if purchased as addon
            $table->integer('default_addon_quota')->nullable(); // Default quota if purchased as addon
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0); // For display ordering
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plan_features');
    }
};
