<?php

use App\Models\Tenant;
use App\Services\Backup\TenantBackupService;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    // Check if mysqldump is available
    // Backup tests require MySQL in production
    exec('which mysqldump', $output, $returnCode);
    if ($returnCode !== 0) {
        $this->markTestSkipped('mysqldump command not found. Backup tests require MySQL and mysqldump to be installed.');
    }

    // Clean up any existing backups before each test
    $backupDir = storage_path('app/backups/tenants');
    if (File::exists($backupDir)) {
        File::deleteDirectory($backupDir);
    }
});

afterEach(function () {
    // Clean up backups after each test
    $backupDir = storage_path('app/backups/tenants');
    if (File::exists($backupDir)) {
        File::deleteDirectory($backupDir);
    }

    // End any active tenancy
    if (tenancy()->initialized) {
        $this->endTenancy();
    }

    // Clean up any test tenant databases
    foreach (glob(database_path('gymme-tenant_*')) as $file) {
        if (is_file($file)) {
            @unlink($file);
        }
    }

    // Clear tenant records
    DB::table('tenants')->truncate();
});

test('can backup a single tenant database', function () {
    // Create tenant with database
    $tenant = $this->createTenantWithDatabase(['name' => 'Test Tenant']);

    // Perform backup
    $backupService = app(TenantBackupService::class);
    $backupPath = $backupService->backupTenant($tenant);

    // Assert backup was created
    $disk = Storage::disk(config('backup.backup.destination.disks.0', 'local'));

    expect($disk->exists($backupPath))
        ->toBeTrue()
        ->and($backupPath)->toContain($tenant->id)
        ->and($backupPath)->toEndWith('.zip');
});

test('backup creates valid ZIP archive with SQL dump', function () {
    // Create tenant with database
    $tenant = $this->createTenantWithDatabase(['name' => 'Test Tenant']);

    // Perform backup
    $backupService = app(TenantBackupService::class);
    $backupPath = $backupService->backupTenant($tenant);

    // Get full path to backup file
    $disk = Storage::disk(config('backup.backup.destination.disks.0', 'local'));
    $fullPath = $disk->path($backupPath);

    // Verify it's a valid ZIP
    $zip = new ZipArchive;
    expect($zip->open($fullPath))->toBe(true);

    // Verify ZIP contains db-dumps directory
    $foundSqlDump = false;
    for ($i = 0; $i < $zip->numFiles; $i++) {
        $filename = $zip->getNameIndex($i);
        if (str_starts_with($filename, 'db-dumps/') && str_ends_with($filename, '.sql.gz')) {
            $foundSqlDump = true;
            break;
        }
    }

    $zip->close();

    expect($foundSqlDump)->toBeTrue('ZIP should contain a gzipped SQL dump in db-dumps directory');
});

test('backup includes tenant data', function () {
    // Create tenant with database
    $tenant = $this->createTenantWithDatabase(['name' => 'Test Tenant']);

    // Add some data to tenant database
    $this->initializeTenancy($tenant);
    \App\Models\Structure::create(['name' => 'Test Structure', 'street' => 'Test Address']);
    $this->endTenancy();

    // Perform backup
    $backupService = app(TenantBackupService::class);
    $backupPath = $backupService->backupTenant($tenant);

    // Assert backup file is not empty and has reasonable size
    $disk = Storage::disk(config('backup.backup.destination.disks.0', 'local'));
    $fileSize = $disk->size($backupPath);

    expect($fileSize)->toBeGreaterThan(100, 'Backup should be larger than 100 bytes');
});

test('can list backups for a tenant', function () {
    // Create tenant with database
    $tenant = $this->createTenantWithDatabase(['name' => 'Test Tenant']);

    // Create multiple backups
    $backupService = app(TenantBackupService::class);
    $backupService->backupTenant($tenant);

    sleep(1); // Ensure different timestamps

    $backupService->backupTenant($tenant);

    // List backups
    $backups = $backupService->listBackups($tenant);

    expect($backups)
        ->toHaveCount(2)
        ->and($backups[0]['date'])->toBeInstanceOf(\Carbon\Carbon::class)
        ->and($backups[0])->toHaveKey('size')
        ->and($backups[0])->toHaveKey('human_size')
        ->and($backups[0])->toHaveKey('filename')
        ->and($backups[0]['filename'])->toEndWith('.zip');
});

test('backups are sorted by date descending', function () {
    // Create tenant with database
    $tenant = $this->createTenantWithDatabase(['name' => 'Test Tenant']);

    // Create three backups with delays
    $backupService = app(TenantBackupService::class);

    $backupService->backupTenant($tenant);
    sleep(1);
    $backupService->backupTenant($tenant);
    sleep(1);
    $backupService->backupTenant($tenant);

    // List backups
    $backups = $backupService->listBackups($tenant);

    expect($backups)->toHaveCount(3);

    // Verify they are in descending order (newest first)
    expect($backups[0]['date']->isAfter($backups[1]['date']))->toBeTrue();
    expect($backups[1]['date']->isAfter($backups[2]['date']))->toBeTrue();
});

test('can restore tenant from backup', function () {
    // This test requires MySQL for restore functionality
    // Skip if using SQLite for tests
    if (config('database.connections.tenant.driver') === 'sqlite') {
        $this->markTestSkipped('Restore test requires MySQL connection');
    }

    // Create tenant with database
    $tenant = $this->createTenantWithDatabase(['name' => 'Test Tenant']);

    // Add initial data
    $this->initializeTenancy($tenant);
    \App\Models\Structure::create(['name' => 'Original Structure', 'street' => 'Original Address']);
    $this->endTenancy();

    // Create backup
    $backupService = app(TenantBackupService::class);
    $backupService->backupTenant($tenant);

    // Modify data after backup
    $this->initializeTenancy($tenant);
    \App\Models\Structure::query()->delete();
    \App\Models\Structure::create(['name' => 'Modified Structure', 'street' => 'Modified Address']);
    $this->endTenancy();

    // Restore from backup
    $backupService->restoreTenant($tenant);

    // Verify original data is restored
    $this->initializeTenancy($tenant);
    $restoredStructure = \App\Models\Structure::query()->withoutGlobalScopes()->first();

    expect($restoredStructure->name)
        ->toBe('Original Structure')
        ->and($restoredStructure->street)->toBe('Original Address');

    $this->endTenancy();
})->skip('Restore functionality requires MySQL and is tested manually');

test('can clean old backups based on retention policy', function () {
    // Create tenant
    $tenant = $this->createTenantWithDatabase(['name' => 'Test Tenant']);
    $backupService = app(TenantBackupService::class);

    // Create a backup
    $backupPath = $backupService->backupTenant($tenant);

    $disk = Storage::disk(config('backup.backup.destination.disks.0', 'local'));
    $fullPath = $disk->path($backupPath);

    // Manually set file modification time to be older than retention period
    $keepAllDays = config('backup.tenant.retention.keep_all_backups_for_days', 7);
    $keepDailyDays = config('backup.tenant.retention.keep_daily_backups_for_days', 30);
    $oldTimestamp = now()->subDays($keepDailyDays + 10)->timestamp;
    touch($fullPath, $oldTimestamp);

    // Create a newer backup that should be kept
    sleep(1);
    $newBackupPath = $backupService->backupTenant($tenant);

    // Clean old backups
    $deleted = $backupService->cleanOldBackups($tenant);

    // The old backup should be deleted, but the new one kept
    expect($deleted)->toHaveCount(1)
        ->and($disk->exists($backupPath))->toBeFalse('Old backup should be deleted')
        ->and($disk->exists($newBackupPath))->toBeTrue('New backup should be kept');
});

test('never deletes the newest backup', function () {
    // Create tenant
    $tenant = $this->createTenantWithDatabase(['name' => 'Test Tenant']);
    $backupService = app(TenantBackupService::class);

    // Create a single old backup
    $backupPath = $backupService->backupTenant($tenant);

    $disk = Storage::disk(config('backup.backup.destination.disks.0', 'local'));
    $fullPath = $disk->path($backupPath);

    // Make it very old
    $oldTimestamp = now()->subYears(10)->timestamp;
    touch($fullPath, $oldTimestamp);

    // Clean old backups
    $deleted = $backupService->cleanOldBackups($tenant);

    // Even though it's old, it should NOT be deleted because it's the newest (only) backup
    expect($deleted)->toHaveCount(0)
        ->and($disk->exists($backupPath))->toBeTrue('Newest backup should never be deleted');
});

test('backup command backs up all tenants', function () {
    // Create multiple tenants
    $tenant1 = $this->createTenantWithDatabase(['name' => 'Tenant 1']);
    $tenant2 = $this->createTenantWithDatabase(['name' => 'Tenant 2']);

    // Run backup command
    $this->artisan('tenants:backup')
        ->assertSuccessful();

    // Verify backups were created
    $backupService = app(TenantBackupService::class);

    $backups1 = $backupService->listBackups($tenant1);
    $backups2 = $backupService->listBackups($tenant2);

    expect($backups1)
        ->toHaveCount(1)
        ->and($backups2)->toHaveCount(1);
});

test('backup command can backup specific tenant', function () {
    // Create multiple tenants
    $tenant1 = $this->createTenantWithDatabase(['name' => 'Tenant 1']);
    $tenant2 = $this->createTenantWithDatabase(['name' => 'Tenant 2']);

    // Backup only tenant1
    $this->artisan('tenants:backup', ['tenant' => $tenant1->id])
        ->assertSuccessful();

    // Verify only tenant1 has backup
    $backupService = app(TenantBackupService::class);

    $backups1 = $backupService->listBackups($tenant1);
    $backups2 = $backupService->listBackups($tenant2);

    expect($backups1)
        ->toHaveCount(1)
        ->and($backups2)->toHaveCount(0);
});

test('backup command can list backups', function () {
    // Create tenant with backup
    $tenant = $this->createTenantWithDatabase(['name' => 'Test Tenant']);

    $backupService = app(TenantBackupService::class);
    $backupService->backupTenant($tenant);

    // Run list command
    $this->artisan('tenants:backup', ['--list' => true])
        ->expectsOutput("Backups for {$tenant->name} ({$tenant->id}):")
        ->assertSuccessful();
});

test('backup command can clean old backups', function () {
    // Create tenant with old backup
    $tenant = $this->createTenantWithDatabase(['name' => 'Test Tenant']);

    $backupService = app(TenantBackupService::class);
    $backupPath = $backupService->backupTenant($tenant);

    $disk = Storage::disk(config('backup.backup.destination.disks.0', 'local'));
    $fullPath = $disk->path($backupPath);

    // Make backup old
    $keepDailyDays = config('backup.tenant.retention.keep_daily_backups_for_days', 30);
    $oldTimestamp = now()->subDays($keepDailyDays + 10)->timestamp;
    touch($fullPath, $oldTimestamp);

    // Create a newer backup
    sleep(1);
    $newBackupPath = $backupService->backupTenant($tenant);

    // Run clean command
    $this->artisan('tenants:backup', ['--clean' => true])
        ->assertSuccessful();

    // Verify old backup was deleted but new one kept
    expect($disk->exists($backupPath))->toBeFalse()
        ->and($disk->exists($newBackupPath))->toBeTrue();
});

test('restore command lists available backups', function () {
    // Create tenant with backups
    $tenant = $this->createTenantWithDatabase(['name' => 'Test Tenant']);

    $backupService = app(TenantBackupService::class);
    $backupService->backupTenant($tenant);
    sleep(1);
    $backupService->backupTenant($tenant);

    // Run restore command (will fail at confirmation but that's ok)
    $this->artisan('tenants:restore', ['tenant' => $tenant->id])
        ->expectsQuestion("Are you sure you want to restore {$tenant->name}?", false)
        ->assertSuccessful();
});

test('human readable file sizes are formatted correctly', function () {
    $tenant = $this->createTenantWithDatabase(['name' => 'Test Tenant']);

    $backupService = app(TenantBackupService::class);
    $backupService->backupTenant($tenant);

    $backups = $backupService->listBackups($tenant);

    expect($backups[0]['human_size'])
        ->toMatch('/^\d+(\.\d+)?\s+(B|KB|MB|GB)$/', 'Size should be formatted as human readable');
});
