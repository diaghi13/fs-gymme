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
        Schema::create('customer_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('sale_row_id')->constrained('sale_rows')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->string('type'); // 'membership' or 'subscription'
            $table->foreignId('price_list_id')->constrained('price_lists')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            // $table->string('entity_type'); // e.g., 'App\Models\PriceList\Membership'
            // $table->unsignedBigInteger('entity_id'); // e.g., the ID of the membership or subscription content
            $table->morphs('entitable');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->text('notes')->nullable(); // Additional notes about the subscription
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_subscriptions');
    }
};
