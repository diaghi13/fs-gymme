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
        Schema::create('medical_certifications', function (Blueprint $table) {
            $table->id();
            $table->string('medical_certifiable_type');
            $table->unsignedBigInteger('medical_certifiable_id');
            $table->index(['medical_certifiable_type', 'medical_certifiable_id'], 'med_certifiable_idx');
            $table->date('certification_date')->nullable();
            $table->date('valid_until')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medical_certifications');
    }
};
