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
        Schema::table('price_lists', function (Blueprint $table) {
            // Add saleable flag and date range for subscription/membership items
            $table->boolean('saleable')->default(true)->after('visible_online');
            $table->date('saleable_from')->nullable()->after('saleable');
            $table->date('saleable_to')->nullable()->after('saleable_from');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('price_lists', function (Blueprint $table) {
            $table->dropColumn([
                'saleable',
                'saleable_from',
                'saleable_to',
            ]);
        });
    }
};
