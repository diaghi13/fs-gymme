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
        Schema::create('course_product_planning_details', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('course_product_planning_id');
            $table->foreign('course_product_planning_id', 'course_product_planning_fk')
                ->references('id')
                ->on('course_product_plannings')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->enum('day', ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']);
            $table->time('time');
            $table->integer('duration_in_minutes');
            $table->unsignedBigInteger('instructor_id')->nullable();
            $table->unsignedBigInteger('room_id')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_product_planning_details');
    }
};
