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
        Schema::create('sale_rows', function (Blueprint $table) {
            $table->id();

            $table->foreignIdFor(\App\Models\Sale\Sale::class)
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignIdFor(\App\Models\PriceList\PriceList::class)
                ->constrained()
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->integer('quantity')->default(1);
            $table->integer('unit_price')->default(0);
            $table->integer('percentage_discount')->default(0);
            $table->integer('absolute_discount')->default(0);
            $table->integer('total')->default(0);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sale_rows');
    }
};
