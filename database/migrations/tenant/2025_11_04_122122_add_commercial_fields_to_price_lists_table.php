<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Add fields for commercial offerings (Subscription, Membership, DayPass, Token, etc.)
     */
    public function up(): void
    {
        Schema::table('price_lists', function (Blueprint $table) {
            // Type discriminator (STI) - replaces list_type
            $table->string('type')->after('id')->nullable(); // 'folder', 'article', 'membership', 'subscription', 'day_pass', 'token'

            // Price (for all sellable items)
            $table->integer('price')->nullable()->after('description'); // Stored in cents

            // VAT Rate
            $table->foreignId('vat_rate_id')
                ->nullable()
                ->after('price')
                ->constrained('vat_rates')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            // Duration (for subscriptions and memberships)
            $table->integer('duration_months')->nullable()->after('vat_rate_id');
            $table->integer('duration_days')->nullable()->after('duration_months');

            // Subscription/Membership specific
            $table->boolean('is_renewable')->default(false)->after('duration_days');
            $table->boolean('auto_renew_default')->default(false)->after('is_renewable');

            // Token/Carnet specific
            $table->integer('validity_days')->nullable()->after('auto_renew_default'); // How long token is valid after purchase
            $table->integer('max_uses')->nullable()->after('validity_days'); // Number of uses (for tokens/carnets)

            // Online selling
            $table->longText('selling_description')->nullable()->after('description');
            $table->boolean('visible_online')->default(false)->after('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('price_lists', function (Blueprint $table) {
            $table->dropColumn([
                'type',
                'price',
                'duration_months',
                'duration_days',
                'is_renewable',
                'auto_renew_default',
                'validity_days',
                'max_uses',
                'selling_description',
                'visible_online',
            ]);

            $table->dropForeign(['vat_rate_id']);
            $table->dropColumn('vat_rate_id');
        });
    }
};
