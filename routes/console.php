<?php

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schedule;

/*
|--------------------------------------------------------------------------
| Console Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of your scheduled commands.
| Commands will be automatically registered by Laravel's command discovery.
|
*/

// Tenant database backups - using Spatie Laravel Backup
if (config('backup.tenant.schedule.enabled', true)) {
    $frequency = config('backup.tenant.schedule.frequency', 'daily');
    $time = config('backup.tenant.schedule.time', '02:00');

    $schedule = Schedule::command('tenants:backup');

    match ($frequency) {
        'hourly' => $schedule->hourly(),
        'daily' => $schedule->dailyAt($time),
        'weekly' => $schedule->weeklyOn(1, $time), // Monday at specified time
        default => $schedule->dailyAt($time),
    };

    $schedule
        ->onSuccess(function () {
            Log::info('Tenant backups completed successfully');
        })
        ->onFailure(function () {
            Log::error('Tenant backups failed');
        });
}

// Clean old backups weekly
Schedule::command('tenants:backup --clean')
    ->weekly()
    ->sundays()
    ->at('03:00')
    ->onSuccess(function () {
        Log::info('Old backup cleanup completed');
    })
    ->onFailure(function () {
        Log::error('Old backup cleanup failed');
    });

// Subscription Management
Schedule::command('subscription:check-expired-trials')
    ->dailyAt('01:00')
    ->onSuccess(function () {
        Log::info('Expired trials check completed');
    })
    ->onFailure(function () {
        Log::error('Expired trials check failed');
    });

// Send renewal reminders 7 days before renewal
Schedule::command('subscription:send-renewal-reminders --days=7')
    ->dailyAt('09:00')
    ->onSuccess(function () {
        Log::info('Renewal reminders sent (7 days)');
    })
    ->onFailure(function () {
        Log::error('Renewal reminders failed (7 days)');
    });

// Send renewal reminders 3 days before renewal
Schedule::command('subscription:send-renewal-reminders --days=3')
    ->dailyAt('09:00')
    ->onSuccess(function () {
        Log::info('Renewal reminders sent (3 days)');
    })
    ->onFailure(function () {
        Log::error('Renewal reminders failed (3 days)');
    });
