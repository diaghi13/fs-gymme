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
        Schema::create('price_list_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('price_list_id')
                ->nullable()
                ->constrained('price_lists')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreignId('product_id')
                ->constrained('products')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            // PREZZI BASE
            $table->integer('base_price');
            $table->integer('discount_percentage')->default(0);
            $table->integer('discount_amount')->default(0);
            $table->integer('final_price');

            // FONTE DEL PREZZO
            $table->string('price_source')->default(\App\Enums\PriceSource::Manual->value); // Enum replaced with string
            $table->foreignId('inherited_from_list_id')
                ->nullable()
                ->constrained('price_lists')
                ->nullOnDelete();

            // CALCOLO AUTOMATICO ABBONAMENTI
            $table->string('price_calculation_method')->default(\App\Enums\PriceCalculationMethod::Manual->value); // Enum replaced with string
            $table->text('price_formula')->nullable();

            // MODIFICATORI PREZZO
            $table->integer('markup_percentage')->default(0);
            $table->integer('markup_amount')->default(0);

            // QUANTITÀ E SCONTI VOLUME
            $table->integer('min_quantity')->default(1);
            $table->integer('max_quantity')->nullable();
            $table->integer('volume_discount_percentage')->default(0);

            // CONFIGURAZIONI TEMPORALI
            $table->integer('seasonal_adjustment')->default(0);
            $table->integer('peak_hours_surcharge')->default(0);

            // ABBONAMENTI - OPZIONI DI PAGAMENTO
            $table->json('payment_options')->nullable();
            $table->boolean('installment_available')->default(false);
            $table->integer('installment_months')->default(12);
            $table->integer('installment_surcharge')->default(0);

            // OVERRIDE E BLOCCHI
            $table->boolean('is_locked')->default(false);
            $table->text('lock_reason')->nullable();

            // VALIDITÀ
            $table->date('valid_from')->nullable();
            $table->date('valid_to')->nullable();
            $table->boolean('is_active')->default(true);

            // AUDIT
            $table->foreignId('last_updated_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->text('last_update_reason')->nullable();

            $table->timestamps();

            $table->unique(['price_list_id', 'product_id']);
            $table->index('inherited_from_list_id');
            $table->index(['valid_from', 'valid_to']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('price_list_items');
    }
};
