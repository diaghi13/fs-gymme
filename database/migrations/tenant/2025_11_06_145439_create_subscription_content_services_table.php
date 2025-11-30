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
        Schema::create('subscription_content_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscription_content_id')
                ->constrained('subscription_contents')
                ->cascadeOnDelete();
            $table->foreignId('product_id')
                ->constrained('products')
                ->cascadeOnDelete();
            $table->integer('usage_limit')->nullable();
            $table->string('usage_period')->nullable(); // 'day', 'week', 'month'
            $table->timestamps();

            $table->unique(['subscription_content_id', 'product_id'], 'sub_content_product_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_content_services');
    }
};
