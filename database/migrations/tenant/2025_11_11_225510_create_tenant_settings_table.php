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
        Schema::create('tenant_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique()->comment('Chiave univoca per l\'impostazione (es: invoice.stamp_duty.charge_customer)');
            $table->text('value')->nullable()->comment('Valore dell\'impostazione (JSON, stringa, numero, boolean)');
            $table->string('type')->default('string')->comment('Tipo di dato: string, integer, boolean, json, decimal');
            $table->string('group')->nullable()->comment('Gruppo di appartenenza (es: invoice, general, notifications)');
            $table->text('description')->nullable()->comment('Descrizione dell\'impostazione');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_settings');
    }
};
