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
        Schema::table('payment_conditions', function (Blueprint $table) {
            $table->boolean('visible')
                ->default(true)
                ->after('end_of_month');
            $table->boolean('active')
                ->default(true)
                ->after('visible');
            $table->boolean('is_default')
                ->default(false)
                ->after('active');
            $table->foreignId('financial_resource_type_id')
                ->nullable()
                ->after('is_default')
                ->constrained('financial_resource_types')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_conditions', function (Blueprint $table) {
            $table->dropForeign(['financial_resource_type_id']);
            $table->dropColumn([
                'visible',
                'active',
                'is_default',
                'financial_resource_type_id'
            ]);
        });
    }
};
