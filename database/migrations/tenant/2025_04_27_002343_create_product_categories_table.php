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
        Schema::create('product_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('product_categories')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->string('name');
            $table->string('slug')->nullable()->unique();
            $table->text('description')->nullable();
            $table->string('image_path', 500)->nullable(); // Path dell'immagine della categoria, con lunghezza massima di 500 caratteri
            $table->integer('sort_order')->default(0); // Ordine di visualizzazione della categoria
            $table->boolean('is_active')->default(true); // Indica se la categoria è attiva
            $table->timestamps();
            $table->softDeletes(); // Aggiunge il campo deleted_at per la soft delete
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_categories');
    }
};
