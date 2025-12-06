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
        Schema::create('subscription_plan_tenant', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\Tenant::class)
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignIdFor(\App\Models\SubscriptionPlan::class)
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->dateTime('starts_at')->nullable(); // Start date of the subscription
            $table->dateTime('ends_at')->nullable(); // End date of the subscription
            $table->boolean('is_active')->default(true); // Indicates if the subscription is active
            $table->boolean('is_trial')->default(false); // Indicates if the subscription is in trial period
            $table->dateTime('trial_ends_at')->nullable(); // End date of the trial period
            $table->string('status')->default('active'); // Status of the subscription (e.g., active, canceled, expired)
            $table->string('external_id')->nullable(); // External ID for integration with payment providers
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subsciption_plane_tenant');
    }
};
