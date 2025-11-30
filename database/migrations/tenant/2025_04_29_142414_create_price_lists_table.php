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

            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('price_lists')
                ->nullOnDelete();

            // DATI BASE
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();

            // TIPOLOGIE E CLASSIFICAZIONE
            $table->string('list_type')->default(\App\Enums\PriceListListType::Standard->value); // Enum replaced with string
            $table->string('list_scope')->default(\App\Enums\PriceListScope::Global->value);

            // APPLICABILITÀ
            $table->foreignId('structure_id')
                ->nullable()
                ->constrained('structures')
                ->nullOnDelete();

//            $table->foreignId('customer_group_id')
//                ->nullable()
//                ->constrained('customer_groups')
//                ->nullOnDelete();

            // GERARCHIA E PRIORITÀ
            //$table->integer('level')->default(0);
            //$table->string('path', 500)->nullable();
            //$table->integer('priority')->default(0);

            // EREDITARIETÀ
            $table->boolean('inherit_from_parent')->default(true);
            $table->boolean('override_parent_prices')->default(false);

            // VALIDITÀ
            $table->boolean('is_default')->default(false);
            $table->date('valid_from')->nullable();
            $table->date('valid_to')->nullable();

            // CONFIGURAZIONI FINANZIARIE
            $table->string('currency', 3)->default('EUR');
            $table->boolean('tax_included')->default(true);
            $table->integer('default_tax_rate')->default(2200);

            // SCONTI AUTOMATICI
            $table->integer('base_discount_percentage')->default(0);
            $table->boolean('volume_discount_enabled')->default(false);
            $table->boolean('loyalty_discount_enabled')->default(false);

            // CONFIGURAZIONI AVANZATE
            $table->boolean('auto_calculate_subscriptions')->default(false);
            $table->integer('round_prices_to')->default(5);

            // METADATA
            $table->json('settings')->nullable();
            $table->string('color', 7)->nullable();
            $table->string('icon', 50)->nullable();

            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            //$table->unique(['company_id', 'slug']);
            $table->index('parent_id');
            //$table->index('path');
            //$table->index(['facility_id', 'customer_group_id']);
            $table->index(['valid_from', 'valid_to']);
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
