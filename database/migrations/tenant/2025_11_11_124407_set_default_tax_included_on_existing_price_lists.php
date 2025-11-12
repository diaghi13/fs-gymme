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
        // Imposta tax_included = true per tutti i price_lists esistenti
        // In Italia i prezzi sono sempre mostrati IVA inclusa di default
        DB::table('price_lists')
            ->whereNull('tax_included')
            ->update(['tax_included' => true]);

        // Ora imposta il default a livello di schema per i nuovi record
        Schema::table('price_lists', function (Blueprint $table) {
            $table->boolean('tax_included')->default(true)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('price_lists', function (Blueprint $table) {
            $table->boolean('tax_included')->default(null)->change();
        });
    }
};
