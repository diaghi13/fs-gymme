<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('price_lists', function (Blueprint $table) {
            $table->id();

            $table->string('type')->nullable();
            $table->string('name');
            $table->string('color')->nullable();
            $table->boolean('visible')->default(true);
            $table->foreignId('parent_id')->nullable();
            $table->date('saleable_from')->nullable();
            $table->date('saleable_to')->nullable();
            $table->integer('price')->nullable();
            $table->foreignIdFor(\App\Models\VatRate::class)
                ->nullable()
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->integer('months_duration')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('price_lists');
    }
};
