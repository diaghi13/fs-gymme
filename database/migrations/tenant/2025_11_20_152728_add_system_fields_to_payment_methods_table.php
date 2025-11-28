<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('payment_methods', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->after('code')->comment('Se TRUE, il metodo è disponibile per le vendite');
            $table->boolean('is_system')->default(false)->after('is_active')->comment('Se TRUE, il metodo è di sistema e non può essere eliminato');
        });

        // Mark all existing payment methods as system
        DB::table('payment_methods')->update([
            'is_active' => true,
            'is_system' => true,
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_methods', function (Blueprint $table) {
            $table->dropColumn(['is_active', 'is_system']);
        });
    }
};
