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
        Schema::table('payment_conditions', function (Blueprint $table) {
            $table->boolean('is_system')->default(false)->after('is_default')->comment('Se TRUE, la condizione è di sistema e non può essere eliminata');
        });

        // Mark all existing payment conditions as system
        DB::table('payment_conditions')->update([
            'is_system' => true,
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_conditions', function (Blueprint $table) {
            $table->dropColumn('is_system');
        });
    }
};
