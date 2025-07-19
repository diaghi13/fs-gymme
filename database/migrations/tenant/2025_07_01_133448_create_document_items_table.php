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
        Schema::create('document_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('document_id');
            $table->unsignedBigInteger('product_id')->nullable();
            $table->string('description', 500);
            $table->integer('quantity'); // in millesimi (es: 1000 = 1,000)
            $table->integer('unit_price'); // centesimi
            $table->integer('discount_percentage')->default(0); // centesimi
            $table->integer('vat_rate'); // centesimi (es: 2200 = 22,00%)
            $table->integer('subtotal'); // centesimi
            $table->string('nature', 2)->nullable(); // esenzione IVA (N1, N2, ...)
            $table->timestamps();

            $table->foreign('document_id')->references('id')->on('documents')->cascadeOnDelete();
            $table->foreign('product_id')->references('id')->on('products')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_items');
    }
};
