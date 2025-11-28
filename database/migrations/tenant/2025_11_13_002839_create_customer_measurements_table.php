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
        Schema::create('customer_measurements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->date('measured_at');
            $table->decimal('weight', 5, 2)->nullable(); // kg
            $table->decimal('height', 5, 2)->nullable(); // cm
            $table->decimal('bmi', 4, 2)->nullable(); // auto-calculated
            $table->decimal('chest_circumference', 5, 2)->nullable(); // cm
            $table->decimal('waist_circumference', 5, 2)->nullable();
            $table->decimal('hips_circumference', 5, 2)->nullable();
            $table->decimal('arm_circumference', 5, 2)->nullable();
            $table->decimal('thigh_circumference', 5, 2)->nullable();
            $table->decimal('body_fat_percentage', 4, 2)->nullable();
            $table->decimal('lean_mass_percentage', 4, 2)->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('measured_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_measurements');
    }
};
