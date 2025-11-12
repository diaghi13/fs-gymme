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
            // Aggiungi campi gross (lordi) per evitare arrotondamenti nel ricalcolo
            $table->integer('unit_price_gross')->nullable()->after('unit_price_net')->comment('Prezzo unitario LORDO (IVA inclusa) in centesimi');
            $table->integer('total_gross')->nullable()->after('total_net')->comment('Totale riga LORDO (IVA inclusa) in centesimi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sale_rows', function (Blueprint $table) {
            $table->dropColumn(['unit_price_gross', 'total_gross']);
        });
    }
};
