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
        Schema::create('vat_natures', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique(); // "N1", "N2.1", "N3.5", "N6.2"
            $table->string('parent_code', 10)->nullable(); // "N3" for "N3.5"
            $table->text('description'); // Full description
            $table->text('usage_notes')->nullable(); // When to use it
            $table->boolean('requires_document_reference')->default(false); // e.g., N6.9
            $table->integer('order')->default(0);
            $table->timestamps();

            // Index for parent-child relationship
            $table->index('parent_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vat_natures');
    }
};
