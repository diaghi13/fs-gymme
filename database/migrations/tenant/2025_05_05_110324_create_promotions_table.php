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
        Schema::create('promotions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('structure_id')
                ->nullable()
                ->constrained('structures')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->string('name');
            $table->string('code')->nullable();
            $table->longText('description')->nullable();
            $table->string('type')->nullable(); // percentage, fixed amount, free shipping, etc.
            $table->integer('value')->nullable();
            $table->date('start_date')->nullable(); // nullable for ongoing promotions
            $table->date('end_date')->nullable(); // nullable for ongoing promotions
            $table->string('status')->nullable(); // active, inactive, expired

            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('price_list_promotion', function (Blueprint $table) {
            $table->foreignIdFor(\App\Models\PriceList\PriceList::class)
                ->constrained()
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->foreignIdFor(\App\Models\Sale\Promotion::class)
                ->constrained()
                ->cascadeOnUpdate()
                ->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('price_list_promotion', function (Blueprint $table) {
            $table->dropForeign(['price_list_id']);
            $table->dropForeign(['promotion_id']);
        });
        Schema::dropIfExists('price_list_promotion');
        Schema::dropIfExists('promotions');
    }
};
