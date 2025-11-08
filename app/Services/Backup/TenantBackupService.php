<?php

namespace App\Services\Backup;

use App\Models\Tenant;
use Carbon\Carbon;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Spatie\DbDumper\Compressors\GzipCompressor;
use Spatie\DbDumper\Databases\MySql;
use ZipArchive;

class TenantBackupService
{
    protected string $disk;

    protected string $storagePath;

    public function __construct()
    {
        $this->disk = config('backup.backup.destination.disks.0', 'local');
        $this->storagePath = config('backup.tenant.storage_path', 'backups/tenants');
    }

    /**
     * Backup a single tenant database.
     */
    public function backupTenant(Tenant $tenant): string
    {
        $backupPath = $this->getTenantBackupPath($tenant);
        $disk = Storage::disk($this->disk);

        // Ensure the backup directory exists
        if (! $disk->exists($backupPath)) {
            $disk->makeDirectory($backupPath);
        }

        $timestamp = now()->format('Y-m-d_H-i-s');
        $dumpFileName = "{$tenant->id}_database_{$timestamp}.sql.gz";
        $zipFileName = "{$tenant->id}_{$timestamp}.zip";

        $tempDir = storage_path('app/backup-temp/'.uniqid());
        $tempDumpPath = "{$tempDir}/{$dumpFileName}";
        $finalZipPath = $disk->path("{$backupPath}/{$zipFileName}");

        try {
            // Create temp directory
            File::ensureDirectoryExists($tempDir);

            // Create database dump using Spatie DbDumper
            $this->createDatabaseDump($tenant, $tempDumpPath);

            // Create ZIP archive
            $this->createZipArchive($tempDumpPath, $finalZipPath);

            Log::info('Tenant backup completed', [
                'tenant_id' => $tenant->id,
                'tenant_name' => $tenant->name,
                'backup_path' => $finalZipPath,
                'size' => $disk->size("{$backupPath}/{$zipFileName}"),
            ]);

            return "{$backupPath}/{$zipFileName}";
        } catch (\Exception $e) {
            Log::error('Tenant backup failed', [
                'tenant_id' => $tenant->id,
                'tenant_name' => $tenant->name,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        } finally {
            // Clean up temp directory
            if (File::exists($tempDir)) {
                File::deleteDirectory($tempDir);
            }
        }
    }

    /**
     * Restore a tenant database from backup.
     */
    public function restoreTenant(Tenant $tenant, ?string $backupDate = null): bool
    {
        $backup = $this->findBackup($tenant, $backupDate);

        if (! $backup) {
            throw new RuntimeException('Backup file not found.');
        }

        // Create a pre-restore backup
        $this->createPreRestoreBackup($tenant);

        try {
            // Extract the backup and restore the database
            $this->extractAndRestoreDatabase($tenant, $backup['path']);

            Log::info('Tenant restored successfully', [
                'tenant_id' => $tenant->id,
                'tenant_name' => $tenant->name,
                'backup_date' => $backup['date']->format('Y-m-d H:i:s'),
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Tenant restore failed', [
                'tenant_id' => $tenant->id,
                'tenant_name' => $tenant->name,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * List all backups for a tenant.
     */
    public function listBackups(Tenant $tenant): array
    {
        $backupPath = $this->getTenantBackupPath($tenant);
        $disk = Storage::disk($this->disk);

        if (! $disk->exists($backupPath)) {
            return [];
        }

        $files = $disk->files($backupPath);
        $backups = [];

        foreach ($files as $file) {
            $filename = basename($file);

            // Parse backup filename to extract date
            // Expected format: {tenant_id}_{date}.zip
            if (preg_match('/.*_(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})\.zip$/', $filename, $matches)) {
                $dateString = $matches[1];
                $date = Carbon::createFromFormat('Y-m-d_H-i-s', $dateString);

                $backups[] = [
                    'path' => $file,
                    'filename' => $filename,
                    'date' => $date,
                    'size' => $disk->size($file),
                    'human_size' => $this->formatBytes($disk->size($file)),
                ];
            }
        }

        // Sort by date descending (newest first)
        usort($backups, fn ($a, $b) => $b['date']->timestamp <=> $a['date']->timestamp);

        return $backups;
    }

    /**
     * Clean old backups based on retention policy.
     */
    public function cleanOldBackups(?Tenant $tenant = null): array
    {
        $deleted = [];

        if ($tenant) {
            // Clean backups for a specific tenant
            $deleted = $this->cleanTenantBackups($tenant);
        } else {
            // Clean backups for all tenants
            $tenants = Tenant::all();

            foreach ($tenants as $tenant) {
                $deleted = array_merge($deleted, $this->cleanTenantBackups($tenant));
            }
        }

        return $deleted;
    }

    /**
     * Create a database dump for a tenant.
     */
    protected function createDatabaseDump(Tenant $tenant, string $dumpPath): void
    {
        $tenantDatabaseName = config('tenancy.database.prefix').$tenant->id;
        $host = config('tenancy.database.host') ?? config('database.connections.mysql.host');
        $port = config('tenancy.database.port') ?? config('database.connections.mysql.port', 3306);
        $username = config('tenancy.database.username') ?? config('database.connections.mysql.username');
        $password = config('tenancy.database.password') ?? config('database.connections.mysql.password');

        MySql::create()
            ->setDbName($tenantDatabaseName)
            ->setHost($host)
            ->setPort($port)
            ->setUserName($username)
            ->setPassword($password)
            ->useCompressor(new GzipCompressor)
            ->dumpToFile($dumpPath);
    }

    /**
     * Create a ZIP archive containing the database dump.
     */
    protected function createZipArchive(string $dumpPath, string $zipPath): void
    {
        $zip = new ZipArchive;

        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new RuntimeException('Failed to create ZIP archive.');
        }

        $zip->addFile($dumpPath, 'db-dumps/'.basename($dumpPath));
        $zip->close();
    }

    /**
     * Clean backups for a specific tenant based on retention policy.
     */
    protected function cleanTenantBackups(Tenant $tenant): array
    {
        $backups = $this->listBackups($tenant);
        $retention = config('backup.tenant.retention');
        $deleted = [];

        $now = Carbon::now();
        $keepAllUntil = $now->copy()->subDays($retention['keep_all_backups_for_days']);
        $keepDailyUntil = $now->copy()->subDays($retention['keep_daily_backups_for_days']);
        $keepWeeklyUntil = $now->copy()->subWeeks($retention['keep_weekly_backups_for_weeks']);
        $keepMonthlyUntil = $now->copy()->subMonths($retention['keep_monthly_backups_for_months']);

        $groupedBackups = [
            'keep_all' => [],
            'keep_daily' => [],
            'keep_weekly' => [],
            'keep_monthly' => [],
            'keep_yearly' => [],
        ];

        foreach ($backups as $backup) {
            $date = $backup['date'];

            if ($date->gte($keepAllUntil)) {
                $groupedBackups['keep_all'][] = $backup;
            } elseif ($date->gte($keepDailyUntil)) {
                $day = $date->format('Y-m-d');
                if (! isset($groupedBackups['keep_daily'][$day])) {
                    $groupedBackups['keep_daily'][$day] = $backup;
                }
            } elseif ($date->gte($keepWeeklyUntil)) {
                $week = $date->format('Y-W');
                if (! isset($groupedBackups['keep_weekly'][$week])) {
                    $groupedBackups['keep_weekly'][$week] = $backup;
                }
            } elseif ($date->gte($keepMonthlyUntil)) {
                $month = $date->format('Y-m');
                if (! isset($groupedBackups['keep_monthly'][$month])) {
                    $groupedBackups['keep_monthly'][$month] = $backup;
                }
            } else {
                $year = $date->format('Y');
                if (! isset($groupedBackups['keep_yearly'][$year])) {
                    $groupedBackups['keep_yearly'][$year] = $backup;
                }
            }
        }

        // Collect all backups to keep
        $backupsToKeep = collect($groupedBackups['keep_all'])
            ->merge(array_values($groupedBackups['keep_daily']))
            ->merge(array_values($groupedBackups['keep_weekly']))
            ->merge(array_values($groupedBackups['keep_monthly']))
            ->merge(array_values($groupedBackups['keep_yearly']))
            ->pluck('path')
            ->toArray();

        // Delete backups not in the keep list (except the newest one)
        $disk = Storage::disk($this->disk);
        $backupsToDelete = array_filter($backups, fn ($backup) => ! in_array($backup['path'], $backupsToKeep));

        // Never delete the newest backup
        if (count($backupsToDelete) > 0 && count($backups) > 0) {
            $newestBackup = $backups[0];
            $backupsToDelete = array_filter($backupsToDelete, fn ($backup) => $backup['path'] !== $newestBackup['path']);
        }

        foreach ($backupsToDelete as $backup) {
            if ($disk->delete($backup['path'])) {
                $deleted[] = $backup['path'];
                Log::info('Deleted old backup', [
                    'tenant_id' => $tenant->id,
                    'backup_path' => $backup['path'],
                ]);
            }
        }

        return $deleted;
    }

    /**
     * Get the backup path for a tenant.
     */
    protected function getTenantBackupPath(Tenant $tenant): string
    {
        return $this->storagePath.'/'.$tenant->id;
    }

    /**
     * Find a specific backup by date or return the latest.
     */
    protected function findBackup(Tenant $tenant, ?string $backupDate = null): ?array
    {
        $backups = $this->listBackups($tenant);

        if (empty($backups)) {
            return null;
        }

        if ($backupDate) {
            foreach ($backups as $backup) {
                if ($backup['date']->format('Y-m-d_H-i-s') === $backupDate) {
                    return $backup;
                }
            }

            return null;
        }

        // Return the latest backup
        return $backups[0];
    }

    /**
     * Create a pre-restore backup.
     */
    protected function createPreRestoreBackup(Tenant $tenant): void
    {
        try {
            $this->backupTenant($tenant);
        } catch (\Exception $e) {
            Log::warning('Failed to create pre-restore backup', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Extract backup and restore database.
     */
    protected function extractAndRestoreDatabase(Tenant $tenant, string $backupPath): void
    {
        $disk = Storage::disk($this->disk);
        $tempDir = storage_path('app/backup-temp/restore_'.uniqid());

        try {
            // Create temp directory
            File::ensureDirectoryExists($tempDir);

            // Extract the backup zip
            $zip = new ZipArchive;
            $zipPath = $disk->path($backupPath);

            if ($zip->open($zipPath) !== true) {
                throw new RuntimeException('Failed to open backup archive.');
            }

            $zip->extractTo($tempDir);
            $zip->close();

            // Find the SQL dump file
            $sqlFiles = File::glob($tempDir.'/db-dumps/*.sql.gz');

            if (empty($sqlFiles)) {
                $sqlFiles = File::glob($tempDir.'/db-dumps/*.sql');
            }

            if (empty($sqlFiles)) {
                throw new RuntimeException('SQL dump file not found in backup.');
            }

            $sqlFile = $sqlFiles[0];

            // Decompress if needed
            if (str_ends_with($sqlFile, '.gz')) {
                $decompressedFile = str_replace('.gz', '', $sqlFile);
                $this->decompressFile($sqlFile, $decompressedFile);
                $sqlFile = $decompressedFile;
            }

            // Restore the database
            $this->restoreDatabase($tenant, $sqlFile);
        } finally {
            // Clean up temp directory
            if (File::exists($tempDir)) {
                File::deleteDirectory($tempDir);
            }
        }
    }

    /**
     * Decompress a gzip file.
     */
    protected function decompressFile(string $source, string $destination): void
    {
        $sourceHandle = gzopen($source, 'rb');
        $destHandle = fopen($destination, 'wb');

        while (! gzeof($sourceHandle)) {
            fwrite($destHandle, gzread($sourceHandle, 4096));
        }

        gzclose($sourceHandle);
        fclose($destHandle);
    }

    /**
     * Restore database from SQL file.
     */
    protected function restoreDatabase(Tenant $tenant, string $sqlFile): void
    {
        $tenantDatabaseName = config('tenancy.database.prefix').$tenant->id;
        $host = config('tenancy.database.host') ?? config('database.connections.mysql.host');
        $username = config('tenancy.database.username') ?? config('database.connections.mysql.username');
        $password = config('tenancy.database.password') ?? config('database.connections.mysql.password');

        // Use mysql command to restore
        $command = sprintf(
            'mysql -h %s -u %s %s %s < %s',
            escapeshellarg($host),
            escapeshellarg($username),
            $password ? '-p'.escapeshellarg($password) : '',
            escapeshellarg($tenantDatabaseName),
            escapeshellarg($sqlFile)
        );

        exec($command, $output, $returnCode);

        if ($returnCode !== 0) {
            throw new RuntimeException('Database restore failed: '.implode("\n", $output));
        }
    }

    /**
     * Format bytes to human-readable size.
     */
    protected function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision).' '.$units[$i];
    }
}
