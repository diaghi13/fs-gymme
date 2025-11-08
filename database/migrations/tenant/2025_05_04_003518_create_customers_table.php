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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();

            $table->foreignId('structure_id')
                ->nullable()
                ->constrained('structures')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->string('uuid', 50)
                ->unique()
                ->index();

            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['F', 'M', 'other', 'A'])->nullable();
            $table->string('birthplace')->nullable();
            $table->string('tax_id_code')->nullable();
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('street')->nullable();
            $table->string('number')->nullable();
            $table->string('city')->nullable();
            $table->string('zip')->nullable();
            $table->string('province')->nullable();
            $table->string('country')->nullable();

            $table->boolean('gdpr_consent')
                ->default(false);
            $table->date('gdpr_consent_at')
                ->nullable();
            $table->boolean('marketing_consent')
                ->default(false);
            $table->date('marketing_consent_at')
                ->nullable();
            $table->boolean('photo_consent')
                ->default(false);
            $table->boolean('medical_data_consent')
                ->default(false);
            $table->timestamp('data_retention_until')
                ->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
