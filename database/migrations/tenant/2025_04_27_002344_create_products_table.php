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
        Schema::create('products', function (Blueprint $table) {
            $table->id();

            $table->foreignId('structure_id')
                ->nullable()
                ->constrained('structures')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->string("name");
            $table->string("color");
            $table->string("type")->nullable();
            $table->boolean("visible")->default(true);
            $table->boolean("sale_in_subscription")->default(true);
            $table->longText("selling_description");

            $table->timestamps();

            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
