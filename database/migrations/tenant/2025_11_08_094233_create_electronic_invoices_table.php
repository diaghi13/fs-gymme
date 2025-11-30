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
        Schema::create('electronic_invoices', function (Blueprint $table) {
            $table->id();

            $table->foreignId('sale_id')
                ->constrained('sales')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            // XML content and version
            $table->longText('xml_content')->nullable();
            $table->string('xml_version', 10)->default('1.9');

            // SDI transmission details
            $table->string('transmission_id', 50)->unique()->nullable();
            $table->string('transmission_format', 10)->default('FPR12');

            // SDI status tracking
            $table->string('sdi_status')->default('draft');
            $table->timestamp('sdi_status_updated_at')->nullable();
            $table->longText('sdi_receipt_xml')->nullable();
            $table->text('sdi_error_messages')->nullable();

            // File paths for storage
            $table->string('xml_file_path')->nullable();
            $table->string('signed_pdf_path')->nullable();

            // Digital preservation (conservazione sostitutiva)
            $table->timestamp('preserved_at')->nullable();
            $table->string('preservation_hash')->nullable();
            $table->string('preservation_provider')->nullable();
            $table->string('preservation_reference_id')->nullable();

            // Attempt tracking
            $table->integer('send_attempts')->default(0);
            $table->timestamp('last_send_attempt_at')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('electronic_invoices');
    }
};
