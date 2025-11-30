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
            $table->foreignId('vat_rate_id') // Nullable solo per prodotti che non hanno un'aliquota IVA specifica (Abbonamenti)
                ->nullable()
                ->constrained('vat_rates')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('category_id')
                ->nullable()
                ->constrained('product_categories')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->string("name");
            $table->string('slug')->nullable()->unique();
            $table->string("color");
            $table->longText('description')->nullable();
            $table->string('short_description')->nullable();
            $table->string('sku')->nullable()->unique();

            // Tipi di prodotto
            $table->string("type")->nullable();

            // Configurazioni base
            $table->string('unit_type')->default(\App\Enums\UnitType::PIECE->value);
            $table->boolean('is_bookable')->default(false);
            $table->boolean('requires_trainer')->default(true);

            // Durate e limiti
            $table->integer('duration_minutes')->nullable(); // Durata in minuti
            $table->integer('max_participants')->nullable(); // Numero massimo di partecipanti
            $table->integer('min_participants')->nullable(); // Numero minimo di partecipanti
            $table->integer('min_age')->nullable(); // Età minima per partecipare
            $table->integer('max_age')->nullable(); // Età massima per partecipare
            $table->string('gender_restriction')->default(\App\Enums\GenderEnum::ALL); // Restrizione di genere (A = all, M = male, F = female)
            $table->text('prerequisites')->nullable(); // Requisiti per partecipare

            // Configurazioni specifiche per abbonamenti
            $table->integer('subscription_duration_months')->nullable(); // Durata dell'abbonamento in mesi)
            $table->integer('subscription_duration_days')->nullable(); // Durata dell'abbonamento in mesi)
            $table->string('subscription_type')->default(\App\Enums\SubscriptionType::FLEXIBLE);
            $table->boolean('is_renewable')->default(false); // Indica se l'abbonamento è rinnovabile
            $table->boolean('auto_renew_default')->default(false); // Indica se l'abbonamento si rinnova automaticamente per impostazione predefinita

            // Validità e utilizzi
            $table->integer('validity_days')->nullable(); // Validità in giorni
            $table->integer('max_uses_per_period')->nullable(); // Numero massimo di utilizzi per periodo
            $table->integer('max_uses_total')->nullable(); // Numero massimo di utilizzi totali

            // Configurazioni aggiuntive
            $table->json('settings')->nullable(); // Configurazioni aggiuntive in formato JSON per tipo
            $table->string('image_path', 500)->nullable(); // Percorso dell'immagine del prodotto
            $table->boolean('is_active')->default(true); // Indica se il prodotto è attivo
            $table->boolean('saleable_in_subscription')->default(true); // Indica se il prodotto è vendibile in abbonamento
            $table->longText("selling_description")->nullable();

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
