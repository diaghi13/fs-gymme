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
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('province', 2)->nullable()->after('postal_code')->comment('Sigla provincia (es: MI, RM)');
            $table->string('fiscal_regime', 10)->nullable()->after('sdi_code')->comment('Regime fiscale (es: RF01, RF02)');
            $table->string('website')->nullable()->after('email')->comment('Sito web aziendale');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['province', 'fiscal_regime', 'website']);
        });
    }
};
