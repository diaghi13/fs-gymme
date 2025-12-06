<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class CleanupExpiredDemoTenants extends Command
{
    protected $signature = 'demo:cleanup
                            {--dry-run : Show what would be deleted without actually deleting}
                            {--force : Skip confirmation prompt}';

    protected $description = 'Clean up expired demo tenants after grace period';

    public function handle(): int
    {
        if (! config('demo.auto_delete_enabled')) {
            $this->warn('Automatic demo deletion is disabled in config/demo.php');

            return self::SUCCESS;
        }

        $gracePeriod = config('demo.grace_period_days', 7);
        $dryRun = $this->option('dry-run');

        $this->info('🔍 Searching for expired demo tenants...');
        $this->newLine();

        // Find demo tenants that:
        // 1. Have is_demo = true OR have active subscription with is_trial_plan = true
        // 2. Have expired (demo_expires_at or ends_at is past)
        // 3. Have been expired for longer than grace period
        $expiredDemos = $this->findExpiredDemoTenants($gracePeriod);

        if ($expiredDemos->isEmpty()) {
            $this->info('✅ No expired demo tenants found for deletion.');

            return self::SUCCESS;
        }

        $this->displayTenantsToDelete($expiredDemos, $gracePeriod);

        if ($dryRun) {
            $this->warn('🔸 DRY RUN MODE - No tenants will be deleted');

            return self::SUCCESS;
        }

        if (! $this->option('force') && ! $this->confirm('⚠️  Do you want to proceed with deletion?', false)) {
            $this->info('Operation cancelled.');

            return self::SUCCESS;
        }

        $this->newLine();
        $this->info('🗑️  Deleting expired demo tenants...');

        $deleted = 0;
        $failed = 0;

        foreach ($expiredDemos as $tenant) {
            try {
                $this->deleteTenant($tenant);
                $deleted++;
                $this->line("  ✓ Deleted: {$tenant->name} (ID: {$tenant->id})");
            } catch (\Exception $e) {
                $failed++;
                $this->error("  ✗ Failed: {$tenant->name} - {$e->getMessage()}");
                Log::error('Failed to delete demo tenant', [
                    'tenant_id' => $tenant->id,
                    'tenant_name' => $tenant->name,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->newLine();
        $this->info("✅ Cleanup completed: {$deleted} deleted, {$failed} failed");

        return self::SUCCESS;
    }

    /**
     * Find demo tenants that should be deleted.
     */
    protected function findExpiredDemoTenants(int $gracePeriod)
    {
        $cutoffDate = now()->subDays($gracePeriod);

        return Tenant::query()
            ->where(function ($query) use ($cutoffDate) {
                // Method 1: Using demo_expires_at field directly on tenant
                $query->where('is_demo', true)
                    ->whereNotNull('demo_expires_at')
                    ->where('demo_expires_at', '<=', $cutoffDate);
            })
            ->orWhereHas('active_subscription_plan', function ($query) use ($cutoffDate) {
                // Method 2: Active subscription with is_trial_plan AND expired
                $query->join('subscription_plans as sp', 'sp.id', '=', 'subscription_plan_tenant.subscription_plan_id')
                    ->where('subscription_plans.is_trial_plan', true)
                    ->where('subscription_plan_tenant.status', 'expired')
                    ->whereNotNull('subscription_plan_tenant.ends_at')
                    ->where('subscription_plan_tenant.ends_at', '<=', $cutoffDate);
            })
            ->with([/* 'active_subscription_plan.pivot', */ 'users'])
            ->get();
    }

    /**
     * Display information about tenants to be deleted.
     */
    protected function displayTenantsToDelete($tenants, int $gracePeriod): void
    {
        $this->warn("Found {$tenants->count()} expired demo tenant(s) past {$gracePeriod}-day grace period:");
        $this->newLine();

        $headers = ['ID', 'Name', 'Email', 'Expired Date', 'Days Past Grace', 'Users'];
        $rows = [];

        foreach ($tenants as $tenant) {
            $expiredDate = $tenant->demo_expires_at
                ?? $tenant->active_subscription_plan?->pivot?->ends_at;

            $daysPastGrace = $expiredDate
                ? now()->diffInDays($expiredDate) - $gracePeriod
                : 'N/A';

            $rows[] = [
                $tenant->id,
                $tenant->name,
                $tenant->email,
                $expiredDate?->format('Y-m-d H:i') ?? 'N/A',
                $daysPastGrace > 0 ? "+{$daysPastGrace}" : '0',
                $tenant->users->count(),
            ];
        }

        $this->table($headers, $rows);
    }

    /**
     * Delete a tenant and all associated data.
     */
    protected function deleteTenant(Tenant $tenant): void
    {
        DB::beginTransaction();

        try {
            // 1. Delete tenant-specific storage files
            $this->deleteTenantStorage($tenant);

            // 2. Delete tenant database
            $tenant->delete();

            // Note: Stancl/Tenancy's delete() method handles:
            // - Dropping tenant database
            // - Deleting tenant domains
            // - Removing from central tenants table
            // - Cascading relationships via foreign keys

            DB::commit();

            Log::info('Demo tenant deleted successfully', [
                'tenant_id' => $tenant->id,
                'tenant_name' => $tenant->name,
                'expired_at' => $tenant->demo_expires_at
                    ?? $tenant->active_subscription_plan?->pivot?->ends_at,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete tenant-specific storage files.
     */
    protected function deleteTenantStorage(Tenant $tenant): void
    {
        $suffixBase = config('tenancy.filesystem.suffix_base', 'tenant_');
        $tenantStoragePath = "{$suffixBase}{$tenant->id}";

        // Check if tenant storage exists
        if (Storage::exists($tenantStoragePath)) {
            // Delete all files in tenant storage directory
            Storage::deleteDirectory($tenantStoragePath);

            Log::info('Tenant storage deleted', [
                'tenant_id' => $tenant->id,
                'storage_path' => $tenantStoragePath,
            ]);
        }
    }
}
