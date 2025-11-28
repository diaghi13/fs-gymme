<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Rename 'max_uses' column to 'entrances' for better naming consistency.
     * This column represents the total number of entries/uses allowed for tokens.
     */
    public function up(): void
    {
        Schema::table('price_lists', function (Blueprint $table) {
            $table->renameColumn('max_uses', 'entrances');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('price_lists', function (Blueprint $table) {
            $table->renameColumn('entrances', 'max_uses');
        });
    }
};
