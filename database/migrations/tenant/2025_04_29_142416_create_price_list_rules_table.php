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
        Schema::create('price_list_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('price_list_id')
                ->constrained('price_lists')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            // CONDIZIONI DI APPLICAZIONE
            $table->string('rule_type'); // Enum replaced with string

            // CONDIZIONI SPECIFICHE
            $table->json('customer_group_ids')->nullable();
            $table->json('facility_ids')->nullable();

            // CONDIZIONI TEMPORALI
            $table->date('valid_from_date')->nullable();
            $table->date('valid_to_date')->nullable();
            $table->json('valid_days_of_week')->nullable();
            $table->json('valid_time_slots')->nullable();

            // CONDIZIONI QUANTITATIVE
            $table->integer('min_quantity')->nullable();
            $table->integer('max_quantity')->nullable();
            $table->integer('min_total_amount')->nullable();
            $table->integer('max_total_amount')->nullable();

            // CONDIZIONI MEMBERSHIP
            $table->integer('min_membership_months')->nullable();
            $table->date('customer_registration_after')->nullable();

            // CONDIZIONI PERSONALIZZATE
            $table->json('custom_conditions')->nullable();

            // PRIORITÀ E COMBINAZIONI
            $table->integer('priority')->default(0);
            $table->boolean('can_combine_with_other_rules')->default(true);

            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('price_list_id');
            $table->index('rule_type');
            $table->index(['valid_from_date', 'valid_to_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('price_list_rules');
    }
};
