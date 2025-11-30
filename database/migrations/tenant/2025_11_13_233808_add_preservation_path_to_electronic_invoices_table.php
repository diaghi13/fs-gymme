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
        Schema::table('electronic_invoices', function (Blueprint $table) {
            $table->string('preservation_path')->nullable()->after('preservation_hash')
                ->comment('Path storage conservazione (es: preservation/2025/11/IT123...)');

            $table->timestamp('preservation_deleted_at')->nullable()->after('preservation_expires_at')
                ->comment('Data eliminazione post-retention (dopo 10+ anni)');

            $table->index('preservation_deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('electronic_invoices', function (Blueprint $table) {
            $table->dropIndex(['preservation_deleted_at']);
            $table->dropColumn(['preservation_path', 'preservation_deleted_at']);
        });
    }
};
