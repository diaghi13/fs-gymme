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
        Schema::create('sales', function (Blueprint $table) {
            $table->id();

            $table->string('uuid', 50)
                ->unique()
                ->index();
            $table->foreignId('structure_id')
                ->nullable()
                ->constrained('structures')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->foreignIdFor(\App\Models\Support\DocumentType::class)
                ->constrained()
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->foreignIdFor(\App\Models\Support\DocumentTypeElectronicInvoice::class)
                ->constrained()
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->string('sale_number', 50)->nullable();
            $table->string('description')->nullable();
            $table->timestamp('sale_date')->nullable();
            $table->integer('year')->nullable();
            $table->foreignId('customer_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            // $table->bigInteger('payment_condition_id')->nullable();
            $table->foreignIdFor(\App\Models\Support\PaymentCondition::class)
                ->constrained()
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            // $table->bigInteger('financial_resource_id')->nullable();
            $table->foreignIdFor(\App\Models\Support\FinancialResource::class)
                ->constrained()
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            // payments

            $table->integer('discount_percentage')->nullable();
            $table->integer('discount_absolute')->nullable();
            $table->foreignIdFor(\App\Models\Sale\Promotion::class)
                ->nullable()
                ->constrained()
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->string('status')->default('draft'); // bozza, salvata, invitata, annullata
            $table->string('payment_status')->default('pending'); // in attesa, pagata, parzialmente pagata, non pagata
            $table->string('accounting_status')->default('pending'); // in attesa, contabilizzata, non contabilizzata
            $table->string('exported_status')->default('pending'); // in attesa, esportata, non esportata
            $table->string('currency')->default('EUR');

            $table->longText('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
