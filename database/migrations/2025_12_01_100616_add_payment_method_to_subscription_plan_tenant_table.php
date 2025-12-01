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
        Schema::table('subscription_plan_tenant', function (Blueprint $table) {
            $table->string('payment_method')->default('stripe')->after('status');
            // stripe, bank_transfer, manual

            $table->text('bank_transfer_notes')->nullable()->after('payment_method');
            // For storing payment reference, transaction ID, etc.

            $table->dateTime('payment_confirmed_at')->nullable()->after('bank_transfer_notes');
            // Timestamp when payment was manually confirmed by admin

            $table->unsignedBigInteger('payment_confirmed_by')->nullable()->after('payment_confirmed_at');
            // Admin user who confirmed the payment
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscription_plan_tenant', function (Blueprint $table) {
            $table->dropColumn([
                'payment_method',
                'bank_transfer_notes',
                'payment_confirmed_at',
                'payment_confirmed_by',
            ]);
        });
    }
};
