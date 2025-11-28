<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tesseramenti enti sportivi (ASI, CONI, FIF, FIPE, etc.)
     * Diverso dalla quota associativa: questo è il tesseramento per gare/manifestazioni
     */
    public function up(): void
    {
        Schema::create('sports_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->string('organization', 100); // ASI, CONI, FIF, FIPE, etc.
            $table->string('membership_number', 50)->nullable(); // Numero tessera ente
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['active', 'expired'])->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Index per query performance
            $table->index(['customer_id', 'status']);
            $table->index('end_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sports_registrations');
    }
};
