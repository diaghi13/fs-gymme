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
        Schema::create('subscription_compositions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscription_product_id')
                ->constrained('structures')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('included_product_id')
                ->constrained('products')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            // Quantità e prezzi
            $table->integer('quantity')->default(1); // Quantità del prodotto incluso nell'abbonamento
            $table->integer('max_uses')->nullable(); // Numero massimo di utilizzi del prodotto incluso nell'abbonamento (null = illimitato)
            $table->boolean('unlimited_uses')->default(false); // Indica se il prodotto incluso ha utilizzi illimitati

            // Validità temporale
            $table->integer('validity_from_day')->default(1); // Validità in giorni a partire dall'attivazione dell'abbonamento
            $table->integer('validity_to_day')->nullable(); // Validità in giorni a partire dall'attivazione dell'abbonamento (null = illimitato)
            $table->string('validity_type')->default(\App\Enums\SubscriptionValidityType::SUBSCRIPTION_PERIOD->value); // Tipo di validità (PERIOD, DATE, etc.)

            // Costi e prezzi
            $table->boolean('is_included_in_base_price')->default(true); // Indica se il prodotto è incluso nel prezzo base dell'abbonamento
            $table->integer('additional_cost')->default(0); // Costo aggiuntivo per il prodotto incluso nell'abbonamento (0 = incluso nel prezzo base)
            $table->integer('cost_per_use')->default(0); // Costo per utilizzo del prodotto incluso nell'abbonamento (0 = incluso nel prezzo base))

            // Configurazioni avanzate
            $table->boolean('requires_booking')->default(false); // Indica se il prodotto incluso richiede prenotazione
            $table->integer('booking_advance_days')->default(0); // Giorni di anticipo per prenotazione
            $table->integer('cancellation_hours')->default(24); // Ore di preavviso per cancellazione della prenotazione

            // Limiti temporali
            $table->integer('max_uses_per_day')->nullable(); // Numero massimo di utilizzi per giorno (null = illimitato)
            $table->integer('max_uses_per_week')->nullable(); // Numero massimo di utilizzi per settimana (null = illimitato)
            $table->integer('max_uses_per_month')->nullable(); // Numero massimo di utilizzi per mese (null = illimitato)

            // Fasce orarie e giorni
            $table->json('allowed_days')->nullable(); // Giorni della settimana in cui il prodotto può essere utilizzato (es. ["monday", "wednesday"])
            $table->json('allowed_time_slots')->nullable(); // Fasce orarie in cui il prodotto può essere utilizzato (es. ["09:00-12:00", "14:00-18:00"])
            $table->integer('allowed_time_slot_tolerance_in_minutes')->default(0); // Tolleranza in minuti per le fasce orarie (es. 15 minuti)
            $table->json('blackout_dates')->nullable(); // Date in cui il prodotto non può essere utilizzato (es. ["2025-12-25", "2026-01-01"])

            // Priorità e ordine
            $table->integer('priority')->default(0); // Priorità del prodotto incluso nell'abbonamento (0 = normale, >0 = priorità alta)
            $table->integer('sort_order')->default(0); // Ordine di visualizzazione del prodotto incluso nell'abbonamento

            $table->text('notes')->nullable(); // Note aggiuntive per il prodotto incluso nell'abbonamento)
            $table->boolean('is_active')->default(true); // Indica se il prodotto incluso è attivo
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['subscription_product_id', 'included_product_id'], 'unique_subscription_composition');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_compositions');
    }
};
