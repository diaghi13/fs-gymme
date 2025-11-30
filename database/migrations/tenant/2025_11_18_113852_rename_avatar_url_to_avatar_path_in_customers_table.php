<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            // Rename avatar_url to avatar_path
            $table->renameColumn('avatar_url', 'avatar_path');
        });

        // Update existing records to extract just the path from the full URL
        // Old format: http://localhost:8000/storage/avatars/filename.jpg
        // New format: avatars/filename.jpg
        $customers = DB::table('customers')
            ->whereNotNull('avatar_path')
            ->where('avatar_path', '!=', '')
            ->get();

        foreach ($customers as $customer) {
            // Extract path after '/storage/'
            $path = $customer->avatar_path;
            if (str_contains($path, '/storage/')) {
                $path = substr($path, strpos($path, '/storage/') + strlen('/storage/'));
            }

            DB::table('customers')
                ->where('id', $customer->id)
                ->update(['avatar_path' => $path]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            // Rename avatar_path back to avatar_url
            $table->renameColumn('avatar_path', 'avatar_url');
        });
    }
};
