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
        Schema::table('subscription_plans', function (Blueprint $table) {
            $table->string('tier')->nullable()->after('slug'); // base, gold, platinum
            $table->boolean('is_trial_plan')->default(false)->after('trial_days');
            $table->integer('sort_order')->default(0)->after('is_trial_plan'); // For display ordering
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscription_plans', function (Blueprint $table) {
            $table->dropColumn(['tier', 'is_trial_plan', 'sort_order']);
        });
    }
};
