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
        Schema::create('document_type_electronic_invoices', function (Blueprint $table) {
            $table->id();

            $table->string('code')->nullable();
            $table->string('description')->nullable();
            $table->foreignIdFor(\App\Models\Support\DocumentType::class)
                ->nullable()
                ->constrained()
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->boolean('can_invoice_himself')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_type_electronic_invoices');
    }
};
