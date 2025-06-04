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
        Schema::table('sale_rows', function (Blueprint $table) {
            $table->string('entitable_type')
                ->nullable()
                ->after('price_list_id');
            $table->unsignedBigInteger('entitable_id')
                ->nullable()
                ->after('entitable_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sale_rows', function (Blueprint $table) {
            $table->dropColumn(['entitable_type', 'entitable_id']);
        });
    }
};
