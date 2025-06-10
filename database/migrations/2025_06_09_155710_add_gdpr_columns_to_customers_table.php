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
        Schema::table('customers', function (Blueprint $table) {
            $table->boolean('gdpr_consent')
                ->default(false)
                ->after('country');
            $table->date('gdpr_consent_at')
                ->nullable();
            $table->boolean('marketing_consent')
                ->default(false);
            $table->date('marketing_consent_at')
                ->nullable();
            $table->boolean('photo_consent')
                ->default(false);
            $table->boolean('medical_data_consent')
                ->default(false);
            $table->timestamp('data_retention_until')
                ->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn([
                'gdpr_consent',
                'gdpr_consent_at',
                'marketing_consent',
                'marketing_consent_at',
                'photo_consent',
                'medical_data_consent',
                'data_retention_until',
            ]);
        });
    }
};
