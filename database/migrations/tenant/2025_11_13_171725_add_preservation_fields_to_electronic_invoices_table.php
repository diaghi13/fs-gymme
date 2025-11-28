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
            // Conservazione Sostitutiva - Obbligo 10 anni (Art. 3, D.M. 17/6/2014)
            // Note: preserved_at already exists in table, add new fields only

            $table->string('xml_hash', 64)->nullable()
                ->comment('SHA-256 hash XML per integrità');

            $table->string('pdf_path')->nullable()
                ->comment('Path PDF rappresentazione tabellare');

            $table->string('pdf_hash', 64)->nullable()
                ->comment('SHA-256 hash PDF per integrità');

            $table->string('receipt_path')->nullable()
                ->comment('Path ricevuta SDI (RC/NS/DT)');

            $table->string('receipt_hash', 64)->nullable()
                ->comment('SHA-256 hash ricevuta per integrità');

            $table->timestamp('preservation_expires_at')->nullable()
                ->comment('Data scadenza conservazione (preserved_at + 10 anni)');

            $table->json('preservation_metadata')->nullable()
                ->comment('Metadata conservazione (user_id, ip, timestamp, etc.)');

            // Index per query scadenze
            $table->index('preservation_expires_at');
            $table->index('preserved_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('electronic_invoices', function (Blueprint $table) {
            $table->dropIndex(['preservation_expires_at']);
            $table->dropIndex(['preserved_at']);

            $table->dropColumn([
                'preserved_at',
                'preservation_expires_at',
                'preservation_metadata',
                'xml_hash',
                'pdf_path',
                'pdf_hash',
                'receipt_path',
                'receipt_hash',
            ]);
        });
    }
};
