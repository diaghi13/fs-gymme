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
        Schema::table('sales', function (Blueprint $table) {
            // Rename existing fields to match standard
            $table->renameColumn('sale_number', 'progressive_number');
            $table->renameColumn('sale_date', 'date');
        });

        Schema::table('sales', function (Blueprint $table) {
            // Progressive number components
            $table->string('progressive_number_prefix', 10)->nullable()->after('progressive_number');
            $table->integer('progressive_number_value')->nullable()->after('progressive_number_prefix');

            // Electronic invoice status tracking
            $table->string('electronic_invoice_status')->default('draft')->after('exported_status');
            $table->timestamp('sdi_sent_at')->nullable()->after('electronic_invoice_status');
            $table->timestamp('sdi_received_at')->nullable()->after('sdi_sent_at');
            $table->string('sdi_notification_type', 10)->nullable()->after('sdi_received_at');
            $table->text('sdi_notification_message')->nullable()->after('sdi_notification_type');

            // XML storage path
            $table->string('electronic_invoice_xml_path')->nullable()->after('sdi_notification_message');

            // Withholding tax (ritenuta d'acconto)
            $table->integer('withholding_tax_amount')->nullable()->after('electronic_invoice_xml_path');
            $table->decimal('withholding_tax_rate', 5, 2)->nullable()->after('withholding_tax_amount');
            $table->string('withholding_tax_type', 10)->nullable()->after('withholding_tax_rate');

            // Stamp duty (bollo)
            $table->integer('stamp_duty_amount')->nullable()->after('withholding_tax_type');

            // Welfare fund (cassa previdenziale)
            $table->string('welfare_fund_type', 10)->nullable()->after('stamp_duty_amount');
            $table->decimal('welfare_fund_rate', 5, 2)->nullable()->after('welfare_fund_type');
            $table->integer('welfare_fund_amount')->nullable()->after('welfare_fund_rate');
            $table->integer('welfare_fund_taxable_amount')->nullable()->after('welfare_fund_amount');
            $table->foreignId('welfare_fund_vat_rate_id')->nullable()->after('welfare_fund_taxable_amount')->constrained('vat_rates')->cascadeOnUpdate()->restrictOnDelete();

            // Invoice causale (required field)
            $table->text('causale')->nullable()->after('description');

            // SDI transmission ID
            $table->string('sdi_transmission_id', 50)->nullable()->unique()->after('uuid');

            // Data retention
            $table->timestamp('fiscal_retention_until')->nullable()->after('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropForeign(['welfare_fund_vat_rate_id']);
            $table->dropColumn([
                'progressive_number_prefix',
                'progressive_number_value',
                'electronic_invoice_status',
                'sdi_sent_at',
                'sdi_received_at',
                'sdi_notification_type',
                'sdi_notification_message',
                'electronic_invoice_xml_path',
                'withholding_tax_amount',
                'withholding_tax_rate',
                'withholding_tax_type',
                'stamp_duty_amount',
                'welfare_fund_type',
                'welfare_fund_rate',
                'welfare_fund_amount',
                'welfare_fund_taxable_amount',
                'welfare_fund_vat_rate_id',
                'causale',
                'sdi_transmission_id',
                'fiscal_retention_until',
            ]);
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->renameColumn('progressive_number', 'sale_number');
            $table->renameColumn('date', 'sale_date');
        });
    }
};
