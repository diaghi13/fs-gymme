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
            // Rename unit_price to unit_price_net (prezzo unitario NETTO, senza IVA)
            $table->renameColumn('unit_price', 'unit_price_net');

            // Rename total to total_net (totale riga NETTO, senza IVA)
            $table->renameColumn('total', 'total_net');
        });

        // Update column comments for clarity
        Schema::table('sale_rows', function (Blueprint $table) {
            $table->integer('unit_price_net')->comment('Prezzo unitario NETTO (imponibile, senza IVA) in centesimi')->change();
            $table->integer('total_net')->comment('Totale riga NETTO (imponibile, senza IVA) in centesimi')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sale_rows', function (Blueprint $table) {
            $table->renameColumn('unit_price_net', 'unit_price');
            $table->renameColumn('total_net', 'total');
        });
    }
};
