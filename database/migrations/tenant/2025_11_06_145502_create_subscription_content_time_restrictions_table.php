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
        Schema::create('subscription_content_time_restrictions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscription_content_id')
                ->constrained('subscription_contents')
                ->cascadeOnDelete()
                ->name('sub_content_time_restrictions_fk');
            $table->json('days')->nullable(); // ['monday', 'tuesday', ...]
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->string('restriction_type')->default('allowed'); // 'allowed' or 'blocked'
            $table->string('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_content_time_restrictions');
    }
};
