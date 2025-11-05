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
        Schema::table('products', function (Blueprint $table) {
            // Sale configuration fields (NOT commercial pricing)
            // These are templates/defaults for when creating PriceLists
            $table->boolean('saleable_in_subscription')->default(true)->after('is_active');
            $table->longText('selling_description')->nullable()->after('saleable_in_subscription');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'saleable_in_subscription',
                'selling_description',
            ]);
        });
    }
};
