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
        Schema::create('electronic_invoice_lookups', function (Blueprint $table) {
            $table->id();
            $table->string('external_id')->unique()->index()->comment('ID from Fattura Elettronica API');
            $table->string('tenant_id')->index()->comment('Tenant UUID');
            $table->timestamps();

            // Foreign key to tenants table for automatic cleanup
            $table->foreign('tenant_id')
                ->references('id')
                ->on('tenants')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('electronic_invoice_lookups');
    }
};
