<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CleanupExpiredDemoTenantsCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'tenants:cleanup-expired-demos
                            {--dry-run : Show what would be deleted without actually deleting}
                            {--force : Skip confirmation prompt}';

    /**
     * The console command description.
     */
    protected $description = 'Delete expired demo tenants and their databases';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🔍 Searching for expired demo tenants...');

        // Get expired demo tenants
        $expiredTenants = Tenant::demoExpired()->get();

        if ($expiredTenants->isEmpty()) {
            $this->info('✅ No expired demo tenants found.');

            return self::SUCCESS;
        }

        $this->warn("Found {$expiredTenants->count()} expired demo tenant(s):");
        $this->newLine();

        // Display tenants
        $this->table(
            ['ID', 'Name', 'Email', 'Expired At', 'Days Overdue'],
            $expiredTenants->map(function ($tenant) {
                $daysOverdue = now()->diffInDays($tenant->demo_expires_at);

                return [
                    $tenant->id,
                    $tenant->name,
                    $tenant->email,
                    $tenant->demo_expires_at->format('Y-m-d H:i'),
                    $daysOverdue,
                ];
            })->toArray()
        );

        // Dry run mode
        if ($this->option('dry-run')) {
            $this->info('🧪 DRY RUN: No tenants were deleted.');

            return self::SUCCESS;
        }

        // Confirmation prompt
        if (! $this->option('force')) {
            if (! $this->confirm('Are you sure you want to delete these demo tenants and their databases?', false)) {
                $this->info('❌ Operation cancelled.');

                return self::FAILURE;
            }
        }

        // Delete tenants
        $this->info('🗑️  Deleting expired demo tenants...');
        $deletedCount = 0;

        foreach ($expiredTenants as $tenant) {
            try {
                $this->line("   Deleting tenant: {$tenant->name} ({$tenant->id})");

                // Delete tenant (will cascade delete database via TenantDeleted event)
                $tenant->delete();

                $deletedCount++;

                Log::info('Deleted expired demo tenant', [
                    'tenant_id' => $tenant->id,
                    'tenant_name' => $tenant->name,
                    'expired_at' => $tenant->demo_expires_at,
                ]);
            } catch (\Exception $e) {
                $this->error("   ❌ Failed to delete tenant {$tenant->id}: {$e->getMessage()}");
                Log::error('Failed to delete expired demo tenant', [
                    'tenant_id' => $tenant->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->newLine();
        $this->info("✅ Successfully deleted {$deletedCount} demo tenant(s).");

        return self::SUCCESS;
    }
}
