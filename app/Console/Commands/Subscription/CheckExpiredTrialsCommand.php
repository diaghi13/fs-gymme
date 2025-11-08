<?php

namespace App\Console\Commands\Subscription;

use App\Models\Tenant;
use Illuminate\Console\Command;

class CheckExpiredTrialsCommand extends Command
{
    protected $signature = 'subscription:check-expired-trials';

    protected $description = 'Check and handle expired trial subscriptions';

    public function handle(): int
    {
        $this->info('Checking for expired trial subscriptions...');

        $expiredTrials = Tenant::whereHas('subscription_planes', function ($query) {
            $query->wherePivot('is_trial', true)
                ->wherePivot('is_active', true)
                ->where('subscription_plan_tenant.trial_ends_at', '<=', now());
        })->get();

        if ($expiredTrials->isEmpty()) {
            $this->info('No expired trials found.');

            return self::SUCCESS;
        }

        $this->info("Found {$expiredTrials->count()} expired trials.");

        foreach ($expiredTrials as $tenant) {
            $subscription = $tenant->subscription('default');

            if (! $subscription) {
                $this->warn("Tenant {$tenant->id} has expired trial but no Cashier subscription found.");

                continue;
            }

            if ($subscription->onTrial() && $subscription->hasExpiredTrial()) {
                $this->line("Processing tenant: {$tenant->name} ({$tenant->id})");

                // Check if payment method is available
                if (! $subscription->hasDefaultPaymentMethod()) {
                    $this->warn('  → No payment method. Subscription will be cancelled.');

                    // TODO: Send notification to tenant about missing payment method

                    continue;
                }

                // If payment method exists, Stripe will automatically charge
                $this->info('  → Payment method found. Stripe will process automatic billing.');
            }
        }

        $this->newLine();
        $this->info('✓ Expired trials check completed.');

        return self::SUCCESS;
    }
}
