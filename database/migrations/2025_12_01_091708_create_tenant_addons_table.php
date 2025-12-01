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
        Schema::create('tenant_addons', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->foreign('tenant_id')
                ->references('id')
                ->on('tenants')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('plan_feature_id')
                ->constrained('plan_features')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->integer('quota_limit')->nullable(); // null = unlimited, number = quota purchased
            $table->integer('price_cents'); // Price paid for this addon
            $table->dateTime('starts_at');
            $table->dateTime('ends_at')->nullable(); // null = active, date = cancelled/expired
            $table->boolean('is_active')->default(true);
            $table->string('stripe_subscription_item_id')->nullable(); // For recurring addons via Stripe
            $table->string('payment_method')->default('stripe'); // stripe, bank_transfer, manual
            $table->string('status')->default('active'); // active, cancelled, expired, pending_payment
            $table->softDeletes();
            $table->timestamps();

            $table->index(['tenant_id', 'is_active']);
            $table->index(['tenant_id', 'plan_feature_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_addons');
    }
};
