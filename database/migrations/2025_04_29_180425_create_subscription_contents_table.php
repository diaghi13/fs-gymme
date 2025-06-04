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
        Schema::create('subscription_contents', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\PriceList\PriceList::class, 'subscription_id')
                ->constrained('price_lists')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->integer('days_duration')->nullable();
            $table->integer('months_duration')->nullable();
            $table->integer('entrances')->nullable();
            $table->integer('price')->nullable();
            $table->foreignIdFor(\App\Models\VatRate::class)
                ->nullable()
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->boolean('is_optional')->default(false);
            $table->integer('daily_access')->nullable();
            $table->integer('weekly_access')->nullable();
            $table->integer('reservation_limit')->nullable();
            $table->integer('daily_reservation_limit')->nullable();
            $table->morphs('price_listable', 'subscription_contents_price_listable_index');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_contents');
    }
};
