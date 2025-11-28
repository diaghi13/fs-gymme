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
        Schema::table('vat_rate_types', function (Blueprint $table) {
            $table->string('code', 50)->nullable()->after('id');
            $table->text('description')->nullable()->after('type');
            $table->integer('order')->default(0)->after('description');
        });

        // Populate existing records with proper values based on VatRateSeeder mapping
        $typeMapping = [
            1 => ['code' => 'ESC', 'description' => 'Operazioni escluse dal campo di applicazione dell\'IVA', 'order' => 1],
            2 => ['code' => 'ESE', 'description' => 'Operazioni esenti da IVA', 'order' => 2],
            3 => ['code' => 'IMP', 'description' => 'Operazioni imponibili IVA', 'order' => 3],
            4 => ['code' => 'NIM', 'description' => 'Operazioni non imponibili IVA', 'order' => 4],
        ];

        foreach ($typeMapping as $id => $data) {
            \DB::table('vat_rate_types')
                ->where('id', $id)
                ->update($data);
        }

        // Now add unique constraint
        Schema::table('vat_rate_types', function (Blueprint $table) {
            $table->string('code', 50)->unique()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vat_rate_types', function (Blueprint $table) {
            $table->dropColumn(['code', 'description', 'order']);
        });
    }
};
