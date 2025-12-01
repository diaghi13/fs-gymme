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
        Schema::create('subscription_plan_features', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\SubscriptionPlan::class)
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('plan_feature_id')
                ->constrained('plan_features')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->boolean('is_included')->default(true); // Feature included in plan
            $table->integer('quota_limit')->nullable(); // null = unlimited, number = limit
            $table->integer('price_cents')->nullable(); // null = included, number = price if purchased separately with this plan
            $table->timestamps();

            $table->unique(['subscription_plan_id', 'plan_feature_id'], 'plan_feature_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_plan_features');
    }
};
