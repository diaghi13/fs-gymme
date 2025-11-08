<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Spatie Backup Configuration for Multi-Tenant Application
    |--------------------------------------------------------------------------
    |
    | This configuration is customized for multi-tenant backup strategy.
    | Each tenant database is backed up separately using Spatie Laravel Backup.
    |
    */

    'backup' => [
        'name' => env('APP_NAME', 'fs-gymme'),

        'source' => [
            'files' => [
                // Tenant backups don't include files by default
                // Only database dumps are created per tenant
                'include' => [],
                'exclude' => [],
                'follow_links' => false,
                'ignore_unreadable_directories' => false,
                'relative_path' => null,
            ],

            /*
             * Database connections to backup.
             * For multi-tenant backups, this will be dynamically configured
             * by the TenantBackupService to target specific tenant databases.
             */
            'databases' => [
                // Will be dynamically set by TenantBackupService
            ],
        ],

        'database_dump_compressor' => \Spatie\DbDumper\Compressors\GzipCompressor::class,
        'database_dump_file_timestamp_format' => 'Y-m-d_H-i-s',
        'database_dump_filename_base' => 'database',
        'database_dump_file_extension' => '',

        'destination' => [
            'compression_method' => ZipArchive::CM_DEFAULT,
            'compression_level' => 9,
            'filename_prefix' => env('BACKUP_FILENAME_PREFIX', ''),

            /*
             * Backup storage disks.
             * Tenant backups are stored on 'local' by default.
             * You can add S3, SFTP, or other disks as needed.
             */
            'disks' => [
                env('BACKUP_DISK', 'local'),
            ],
        ],

        'temporary_directory' => storage_path('app/backup-temp'),
        'password' => env('BACKUP_ARCHIVE_PASSWORD'),
        'encryption' => 'default',
        'tries' => 1,
        'retry_delay' => 0,
    ],

    /*
    |--------------------------------------------------------------------------
    | Tenant Backup Configuration
    |--------------------------------------------------------------------------
    |
    | Specific settings for tenant database backups.
    |
    */

    'tenant' => [
        /*
         * Storage path for tenant backups (relative to configured disk).
         * Each tenant's backups will be stored in a subdirectory named after their ID.
         * Example: storage/app/backups/tenants/{tenant_id}/
         */
        'storage_path' => 'backups/tenants',

        /*
         * Retention policy for tenant backups.
         */
        'retention' => [
            'keep_all_backups_for_days' => env('BACKUP_TENANT_KEEP_ALL_DAYS', 7),
            'keep_daily_backups_for_days' => env('BACKUP_TENANT_KEEP_DAILY_DAYS', 30),
            'keep_weekly_backups_for_weeks' => env('BACKUP_TENANT_KEEP_WEEKLY_WEEKS', 12),
            'keep_monthly_backups_for_months' => env('BACKUP_TENANT_KEEP_MONTHLY_MONTHS', 12),
            'keep_yearly_backups_for_years' => env('BACKUP_TENANT_KEEP_YEARLY_YEARS', 5),
            'delete_oldest_backups_when_using_more_megabytes_than' => env('BACKUP_TENANT_MAX_SIZE_MB', 5000),
        ],

        /*
         * Schedule for automatic tenant backups.
         */
        'schedule' => [
            'enabled' => env('BACKUP_SCHEDULE_ENABLED', true),
            'frequency' => env('BACKUP_SCHEDULE_FREQUENCY', 'daily'), // hourly, daily, weekly
            'time' => env('BACKUP_SCHEDULE_TIME', '02:00'),
        ],

        /*
         * Notification settings for tenant backup operations.
         */
        'notifications' => [
            'enabled' => env('BACKUP_NOTIFICATIONS_ENABLED', false),
            'mail' => [
                'to' => env('BACKUP_NOTIFICATION_EMAIL', 'admin@fs-gymme.com'),
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Notifications
    |--------------------------------------------------------------------------
    */

    'notifications' => [
        'notifications' => [
            \Spatie\Backup\Notifications\Notifications\BackupHasFailedNotification::class => ['mail'],
            \Spatie\Backup\Notifications\Notifications\UnhealthyBackupWasFoundNotification::class => ['mail'],
            \Spatie\Backup\Notifications\Notifications\CleanupHasFailedNotification::class => ['mail'],
            \Spatie\Backup\Notifications\Notifications\BackupWasSuccessfulNotification::class => [],
            \Spatie\Backup\Notifications\Notifications\HealthyBackupWasFoundNotification::class => [],
            \Spatie\Backup\Notifications\Notifications\CleanupWasSuccessfulNotification::class => [],
        ],

        'notifiable' => \Spatie\Backup\Notifications\Notifiable::class,

        'mail' => [
            'to' => env('BACKUP_NOTIFICATION_EMAIL', 'admin@fs-gymme.com'),
            'from' => [
                'address' => env('MAIL_FROM_ADDRESS', 'noreply@fs-gymme.com'),
                'name' => env('MAIL_FROM_NAME', 'FS Gymme Backup'),
            ],
        ],

        'slack' => [
            'webhook_url' => env('BACKUP_SLACK_WEBHOOK_URL', ''),
            'channel' => env('BACKUP_SLACK_CHANNEL'),
            'username' => 'FS Gymme Backup',
            'icon' => ':floppy_disk:',
        ],

        'discord' => [
            'webhook_url' => env('BACKUP_DISCORD_WEBHOOK_URL', ''),
            'username' => 'FS Gymme Backup',
            'avatar_url' => '',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Monitor Backups
    |--------------------------------------------------------------------------
    |
    | Health checks for backup monitoring.
    | Tenant-specific monitoring is handled by TenantBackupService.
    |
    */

    'monitor_backups' => [
        // Monitoring configuration will be dynamically generated per tenant
    ],

    /*
    |--------------------------------------------------------------------------
    | Cleanup Strategy
    |--------------------------------------------------------------------------
    |
    | Cleanup strategy for old backups.
    | Applied to both application and tenant backups.
    |
    */

    'cleanup' => [
        'strategy' => \Spatie\Backup\Tasks\Cleanup\Strategies\DefaultStrategy::class,

        'default_strategy' => [
            'keep_all_backups_for_days' => 7,
            'keep_daily_backups_for_days' => 16,
            'keep_weekly_backups_for_weeks' => 8,
            'keep_monthly_backups_for_months' => 4,
            'keep_yearly_backups_for_years' => 2,
            'delete_oldest_backups_when_using_more_megabytes_than' => 5000,
        ],

        'tries' => 1,
        'retry_delay' => 0,
    ],
];
