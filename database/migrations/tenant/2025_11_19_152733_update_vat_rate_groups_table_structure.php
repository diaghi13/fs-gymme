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
        // Add columns without unique constraint first
        Schema::table('vat_rate_groups', function (Blueprint $table) {
            $table->string('code', 50)->nullable()->after('id');
            $table->text('description')->nullable()->after('group');
            $table->integer('order')->default(0)->after('description');
        });

        // Populate existing records with proper values based on VatRateSeeder mapping
        $groupMapping = [
            345 => ['code' => 'NORM', 'description' => 'Aliquote IVA ordinarie', 'order' => 1],
            346 => ['code' => 'ART10', 'description' => 'Operazioni esenti ex art. 10 DPR 633/72', 'order' => 2],
            347 => ['code' => 'ART15', 'description' => 'Operazioni escluse ex art. 15 DPR 633/72', 'order' => 3],
            348 => ['code' => 'ART17', 'description' => 'Inversione contabile (reverse charge) ex art. 17 DPR 633/72', 'order' => 4],
            349 => ['code' => 'ART74', 'description' => 'Operazioni ex art. 74 DPR 633/72 (rottami, cascami)', 'order' => 5],
            350 => ['code' => 'MARGIN', 'description' => 'Regime del margine (beni usati, arte, antiquariato)', 'order' => 6],
            351 => ['code' => 'NONIM', 'description' => 'Operazioni non imponibili (esportazioni, intracomunitarie)', 'order' => 7],
            352 => ['code' => 'ALTESC', 'description' => 'Altre operazioni escluse dal campo IVA', 'order' => 8],
            353 => ['code' => 'EXTRA', 'description' => 'Operazioni extraterritoriali', 'order' => 9],
            355 => ['code' => 'VIAGGI', 'description' => 'Regime speciale agenzie di viaggio', 'order' => 10],
            357 => ['code' => 'AGRIC', 'description' => 'Regime speciale prodotti agricoli', 'order' => 11],
            358 => ['code' => 'ALTESE', 'description' => 'Altre operazioni esenti', 'order' => 12],
            362 => ['code' => 'ART74V', 'description' => 'Art. 74 per volume d\'affari', 'order' => 13],
            364 => ['code' => 'SPLIT', 'description' => 'Split payment (scissione pagamenti PA)', 'order' => 14],
            365 => ['code' => 'FORFAIT', 'description' => 'Regime forfetario/minimi', 'order' => 15],
        ];

        foreach ($groupMapping as $id => $data) {
            \DB::table('vat_rate_groups')
                ->where('id', $id)
                ->update($data);
        }

        // Now add unique constraint
        Schema::table('vat_rate_groups', function (Blueprint $table) {
            $table->string('code', 50)->unique()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vat_rate_groups', function (Blueprint $table) {
            $table->dropColumn(['code', 'description', 'order']);
        });
    }
};
