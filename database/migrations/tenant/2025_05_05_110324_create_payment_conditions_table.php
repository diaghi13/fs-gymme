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
        Schema::create('payment_conditions', function (Blueprint $table) {
            $table->id();

            $table->string('description');
            $table->foreignIdFor(\App\Models\Support\PaymentMethod::class)
                ->nullable()
                ->constrained()
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->integer('number_of_installments')
                ->nullable();
            $table->boolean('end_of_month')
                ->default(false);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_conditions');
    }
};
