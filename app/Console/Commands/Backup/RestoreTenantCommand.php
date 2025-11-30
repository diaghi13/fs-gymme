<?php

namespace App\Console\Commands\Backup;

use App\Models\Tenant;
use App\Services\Backup\TenantBackupService;
use Illuminate\Console\Command;

class RestoreTenantCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tenants:restore
                            {tenant : The tenant ID to restore}
                            {--date= : Specific backup date to restore (Y-m-d_H-i-s format)}
                            {--latest : Restore from the latest backup}
                            {--force : Skip confirmation prompt}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Restore a tenant database from backup';

    /**
     * Execute the console command.
     */
    public function handle(TenantBackupService $backupService): int
    {
        $tenantId = $this->argument('tenant');
        $tenant = Tenant::find($tenantId);

        if (! $tenant) {
            $this->error("Tenant {$tenantId} not found.");

            return self::FAILURE;
        }

        // List available backups
        $backups = $backupService->listBackups($tenant);

        if (empty($backups)) {
            $this->error("No backups found for tenant {$tenant->name}.");

            return self::FAILURE;
        }

        $this->info("Available backups for {$tenant->name}:");
        $this->table(
            ['#', 'Date', 'Size', 'File'],
            array_map(fn ($backup, $index) => [
                $index + 1,
                $backup['date']->format('Y-m-d H:i:s'),
                $backup['human_size'],
                basename($backup['path']),
            ], $backups, array_keys($backups))
        );

        // Determine which backup to restore
        $backupDate = $this->option('date');
        $backupToRestore = null;

        if ($this->option('latest') || $backupDate === null) {
            $backupToRestore = $backups[0];
            $this->info("Selected latest backup: {$backupToRestore['date']->format('Y-m-d H:i:s')}");
        } elseif ($backupDate) {
            foreach ($backups as $backup) {
                if ($backup['date']->format('Y-m-d_H-i-s') === $backupDate) {
                    $backupToRestore = $backup;
                    break;
                }
            }

            if (! $backupToRestore) {
                $this->error("Backup with date {$backupDate} not found.");

                return self::FAILURE;
            }
        }

        // Confirmation prompt
        if (! $this->option('force')) {
            $this->newLine();
            $this->warn('⚠ WARNING: This will replace the current database with the backup!');
            $this->warn('   A pre-restore backup will be created automatically.');
            $this->newLine();

            if (! $this->confirm("Are you sure you want to restore {$tenant->name}?")) {
                $this->info('Restore cancelled.');

                return self::SUCCESS;
            }
        }

        // Perform restore
        $this->info("Restoring tenant {$tenant->name}...");

        try {
            $backupService->restoreTenant($tenant, $backupToRestore['date']->format('Y-m-d_H-i-s'));
            $this->info('✓ Restore completed successfully!');
            $this->line("  Restored from: {$backupToRestore['date']->format('Y-m-d H:i:s')}");

            return self::SUCCESS;
        } catch (\Exception $e) {
            $this->error("✗ Restore failed: {$e->getMessage()}");

            return self::FAILURE;
        }
    }
}
