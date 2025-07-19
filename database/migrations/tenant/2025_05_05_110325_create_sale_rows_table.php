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

            $table->string('entitable_type')
                ->nullable();
            $table->unsignedBigInteger('entitable_id')
                ->nullable();

            $table->longText('description');
            $table->integer('quantity')->default(1);
            $table->integer('unit_price')->default(0);
            $table->integer('percentage_discount')->default(0);
            $table->integer('absolute_discount')->default(0);
            $table->foreignIdFor(\App\Models\VatRate::class)
                ->nullable()
                ->constrained()
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->integer('total')->default(0);
            $table->date('start_date')
                ->nullable();

            $table->date('end_date')
                ->nullable();

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
