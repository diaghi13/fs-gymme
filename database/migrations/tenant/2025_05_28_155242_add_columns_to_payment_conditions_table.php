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
        Schema::table('payment_conditions', function (Blueprint $table) {
            $table->integer('number_of_installments')
                ->nullable()
                ->after('payment_method_id');
            $table->boolean('end_of_month')
                ->default(false)
                ->after('number_of_installments');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_conditions', function (Blueprint $table) {
            $table->dropColumn('number_of_installments');
            $table->dropColumn('end_of_month');
        });
    }
};
