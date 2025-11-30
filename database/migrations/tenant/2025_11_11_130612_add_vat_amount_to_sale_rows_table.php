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
            // Aggiungi colonna per salvare l'IVA esatta calcolata dal backend
            // In centesimi, come unit_price_net e total_net
            $table->integer('vat_amount')
                ->after('total_net')
                ->nullable()
                ->comment('Importo IVA calcolato per questa riga (in centesimi). Permette visualizzazione corretta del prezzo lordo.');
        });

        // Calcola e popola vat_amount per le righe esistenti
        // NOTA: total_net è in centesimi, vat_amount deve essere in centesimi
        // Formula: vat_amount = total_net * (percentage / 100)
        DB::statement('
            UPDATE sale_rows sr
            INNER JOIN vat_rates vr ON vr.id = sr.vat_rate_id
            SET sr.vat_amount = ROUND(sr.total_net * vr.percentage / 100)
            WHERE sr.vat_rate_id IS NOT NULL
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sale_rows', function (Blueprint $table) {
            $table->dropColumn('vat_amount');
        });
    }
};
