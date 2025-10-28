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
        Schema::create('vat_rate_types', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->timestamps();
        });

        Schema::create('vat_rate_groups', function (Blueprint $table) {
            $table->id();
            $table->string('group');
            $table->timestamps();
        });

        Schema::create('vat_rates', function (Blueprint $table) {
            $table->id();

            $table->foreignId('vat_rate_type_id')
                ->nullable()
                ->constrained('vat_rate_types')
                ->cascadeOnDelete();
            $table->foreignId('vat_rate_group_id')
                ->nullable()
                ->constrained('vat_rate_groups')
                ->cascadeOnDelete();

            $table->string('code')->unique();
            $table->longText('description')->nullable();
            $table->integer('percentage')->default(0);
            $table->integer('order')->nullable();
            $table->string('nature')->nullable();
            $table->boolean('visible_in_activity')->default(false);
            $table->boolean('checkout_application')->default(true);
            $table->boolean('withholding_tax_application')->default(true);
            $table->boolean('social_security_withholding_application')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vat_rates');
        Schema::dropIfExists('vat_rate_types');
        Schema::dropIfExists('vat_rate_groups');
    }
};
