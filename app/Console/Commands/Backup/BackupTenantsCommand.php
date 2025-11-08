<?php

namespace App\Console\Commands\Backup;

use App\Models\Tenant;
use App\Services\Backup\TenantBackupService;
use Illuminate\Console\Command;

class BackupTenantsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tenants:backup
                            {tenant? : The tenant ID to backup (optional, all tenants if not provided)}
                            {--list : List available backups}
                            {--clean : Clean old backups based on retention policy}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Backup tenant database(s)';

    /**
     * Execute the console command.
     */
    public function handle(TenantBackupService $backupService): int
    {
        // Handle --list option
        if ($this->option('list')) {
            return $this->listBackups($backupService);
        }

        // Handle --clean option
        if ($this->option('clean')) {
            return $this->cleanBackups($backupService);
        }

        $tenantId = $this->argument('tenant');

        // Backup specific tenant
        if ($tenantId) {
            return $this->backupSingleTenant($tenantId, $backupService);
        }

        // Backup all tenants
        return $this->backupAllTenants($backupService);
    }

    /**
     * Backup a single tenant.
     */
    protected function backupSingleTenant(string $tenantId, TenantBackupService $backupService): int
    {
        $tenant = Tenant::find($tenantId);

        if (! $tenant) {
            $this->error("Tenant {$tenantId} not found.");

            return self::FAILURE;
        }

        $this->info("Starting backup for tenant: {$tenant->name} ({$tenant->id})");

        try {
            $backupPath = $backupService->backupTenant($tenant);
            $this->info('✓ Backup completed successfully!');
            $this->line("  Backup location: {$backupPath}");

            return self::SUCCESS;
        } catch (\Exception $e) {
            $this->error("✗ Backup failed: {$e->getMessage()}");

            return self::FAILURE;
        }
    }

    /**
     * Backup all tenants.
     */
    protected function backupAllTenants(TenantBackupService $backupService): int
    {
        $tenants = Tenant::all();
        $count = $tenants->count();

        if ($count === 0) {
            $this->warn('No tenants found to backup.');

            return self::SUCCESS;
        }

        $this->info("Starting backup for {$count} tenant(s)...");

        $progressBar = $this->output->createProgressBar($count);
        $progressBar->start();

        $results = [];
        foreach ($tenants as $tenant) {
            try {
                $backupPath = $backupService->backupTenant($tenant);
                $results[] = [
                    'tenant' => $tenant->name,
                    'status' => '✓ Success',
                    'path' => basename($backupPath),
                ];
            } catch (\Exception $e) {
                $results[] = [
                    'tenant' => $tenant->name,
                    'status' => '✗ Failed',
                    'path' => $e->getMessage(),
                ];
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        // Display results table
        $this->table(
            ['Tenant', 'Status', 'Backup File / Error'],
            $results
        );

        $successCount = count(array_filter($results, fn ($r) => str_contains($r['status'], 'Success')));
        $failedCount = $count - $successCount;

        $this->newLine();
        $this->info("Backup completed: {$successCount} successful, {$failedCount} failed");

        return $failedCount > 0 ? self::FAILURE : self::SUCCESS;
    }

    /**
     * List backups for all tenants.
     */
    protected function listBackups(TenantBackupService $backupService): int
    {
        $tenants = Tenant::all();

        if ($tenants->isEmpty()) {
            $this->warn('No tenants found.');

            return self::SUCCESS;
        }

        foreach ($tenants as $tenant) {
            $backups = $backupService->listBackups($tenant);

            if (empty($backups)) {
                continue;
            }

            $this->info("Backups for {$tenant->name} ({$tenant->id}):");

            $tableData = array_map(fn ($backup) => [
                $backup['date']->format('Y-m-d H:i:s'),
                $backup['human_size'],
                basename($backup['path']),
            ], $backups);

            $this->table(['Date', 'Size', 'File'], $tableData);
            $this->newLine();
        }

        return self::SUCCESS;
    }

    /**
     * Clean old backups.
     */
    protected function cleanBackups(TenantBackupService $backupService): int
    {
        $this->info('Cleaning old backups based on retention policy...');

        $deleted = $backupService->cleanOldBackups();
        $count = count($deleted);

        if ($count === 0) {
            $this->info('No old backups found to clean.');
        } else {
            $this->info("✓ Cleaned {$count} old backup(s).");
        }

        return self::SUCCESS;
    }
}
