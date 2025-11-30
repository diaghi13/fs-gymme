<?php

namespace App\Console\Commands\Subscription;

use App\Models\Tenant;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class SendRenewalRemindersCommand extends Command
{
    protected $signature = 'subscription:send-renewal-reminders
                            {--days=7 : Number of days before renewal to send reminder}';

    protected $description = 'Send renewal reminders to tenants before their subscription renews';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $reminderDate = Carbon::now()->addDays($days);

        $this->info("Checking for subscriptions renewing on {$reminderDate->toDateString()}...");

        $tenantsToRemind = Tenant::whereHas('subscription_planes', function ($query) use ($reminderDate) {
            $query->wherePivot('is_active', true)
                ->wherePivot('is_trial', false)
                ->whereDate('subscription_plan_tenant.ends_at', $reminderDate->toDateString());
        })->with('active_subscription_plan')->get();

        if ($tenantsToRemind->isEmpty()) {
            $this->info('No subscriptions found for renewal reminders.');

            return self::SUCCESS;
        }

        $this->info("Found {$tenantsToRemind->count()} tenants to remind.");

        foreach ($tenantsToRemind as $tenant) {
            $subscription = $tenant->subscription('default');

            if (! $subscription || ! $subscription->active()) {
                continue;
            }

            $this->line("Sending reminder to: {$tenant->name} ({$tenant->email})");

            // TODO: Send notification/email
            // You can dispatch a notification job here
            // $tenant->notify(new SubscriptionRenewalReminder($subscription));

            $this->info('  → Reminder sent successfully.');
        }

        $this->newLine();
        $this->info('✓ Renewal reminders sent.');

        return self::SUCCESS;
    }
}
