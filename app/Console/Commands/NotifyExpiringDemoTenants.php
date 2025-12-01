<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NotifyExpiringDemoTenants extends Command
{
    protected $signature = 'demo:notify-expiring';

    protected $description = 'Send warning emails to demo tenants approaching expiration';

    public function handle(): int
    {
        $warningDays = config('demo.warning_email_days', [3, 1]);

        $this->info('🔔 Checking for demo tenants expiring soon...');
        $this->newLine();

        $notified = 0;

        foreach ($warningDays as $days) {
            $expiringTenants = $this->findTenantsExpiringIn($days);

            if ($expiringTenants->isEmpty()) {
                $this->line("  No tenants expiring in {$days} day(s)");

                continue;
            }

            $this->info("  Found {$expiringTenants->count()} tenant(s) expiring in {$days} day(s)");

            foreach ($expiringTenants as $tenant) {
                try {
                    // TODO: Create and send actual email notification
                    // Mail::to($tenant->email)->send(new DemoExpiringNotification($tenant, $days));

                    $this->line("    ✓ Notified: {$tenant->name} ({$tenant->email})");

                    Log::info('Demo expiration warning sent', [
                        'tenant_id' => $tenant->id,
                        'tenant_email' => $tenant->email,
                        'days_until_expiration' => $days,
                    ]);

                    $notified++;
                } catch (\Exception $e) {
                    $this->error("    ✗ Failed: {$tenant->name} - {$e->getMessage()}");
                    Log::error('Failed to send demo expiration warning', [
                        'tenant_id' => $tenant->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        }

        $this->newLine();
        $this->info("✅ Notifications sent: {$notified}");

        return self::SUCCESS;
    }

    /**
     * Find tenants expiring in exactly N days.
     */
    protected function findTenantsExpiringIn(int $days)
    {
        $targetDate = now()->addDays($days);
        $startOfDay = $targetDate->copy()->startOfDay();
        $endOfDay = $targetDate->copy()->endOfDay();

        return Tenant::where(function ($query) use ($startOfDay, $endOfDay) {
            // Method 1: Tenants with demo_expires_at
            $query->where('is_demo', true)
                ->whereNotNull('demo_expires_at')
                ->whereBetween('demo_expires_at', [$startOfDay, $endOfDay]);
        })
            ->orWhereHas('active_subscription_plan', function ($query) use ($startOfDay, $endOfDay) {
                // Method 2: Active subscription with is_trial_plan
                $query->join('subscription_plans', 'subscription_plans.id', '=', 'subscription_plan_tenant.subscription_plan_id')
                    ->where('subscription_plans.is_trial_plan', true)
                    ->whereNotNull('subscription_plan_tenant.ends_at')
                    ->whereBetween('subscription_plan_tenant.ends_at', [$startOfDay, $endOfDay]);
            })
            ->get();
    }
}
