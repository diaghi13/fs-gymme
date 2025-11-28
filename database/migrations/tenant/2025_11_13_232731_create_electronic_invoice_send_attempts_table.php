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
        Schema::create('electronic_invoice_send_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('electronic_invoice_id')
                ->constrained('electronic_invoices')
                ->cascadeOnDelete();
            $table->unsignedInteger('attempt_number')->default(1);
            $table->string('status', 50); // sent, failed, accepted, rejected
            $table->json('request_payload')->nullable(); // Payload inviato
            $table->json('response_payload')->nullable(); // Risposta API
            $table->text('error_messages')->nullable(); // Errori SDI parsati
            $table->string('external_id')->nullable(); // ID provider (se inviato con successo)
            $table->timestamp('sent_at');
            $table->foreignId('user_id')->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamps();

            // Custom index names per evitare "Identifier name too long" (max 64 chars)
            $table->index(['electronic_invoice_id', 'sent_at'], 'ei_attempts_invoice_sent_idx');
            $table->index('status', 'ei_attempts_status_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('electronic_invoice_send_attempts');
    }
};
