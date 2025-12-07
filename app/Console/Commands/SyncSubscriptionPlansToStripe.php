<?php

namespace App\Console\Commands;

use App\Models\SubscriptionPlan;
use App\Services\StripeProductService;
use Illuminate\Console\Command;

class SyncSubscriptionPlansToStripe extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'stripe:sync-plans
                            {--plan= : Sync only a specific plan by ID}
                            {--force : Skip confirmation prompt}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync subscription plans to Stripe (creates/updates Products and Prices)';

    public function __construct(
        protected StripeProductService $stripeService
    ) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🚀 Starting Stripe synchronization...');
        $this->newLine();

        // Check if syncing a specific plan
        if ($planId = $this->option('plan')) {
            return $this->syncSinglePlan($planId);
        }

        // Sync all plans
        return $this->syncAllPlans();
    }

    /**
     * Sync a single subscription plan.
     */
    protected function syncSinglePlan(int $planId): int
    {
        $plan = SubscriptionPlan::find($planId);

        if (! $plan) {
            $this->error("❌ Plan with ID {$planId} not found");

            return self::FAILURE;
        }

        $this->info("Syncing plan: {$plan->name} (ID: {$plan->id})");

        try {
            $this->stripeService->syncPlan($plan);
            $this->info("✅ Successfully synced: {$plan->name}");
            $this->displayPlanInfo($plan->fresh());

            return self::SUCCESS;
        } catch (\Exception $e) {
            $this->error("❌ Failed to sync plan: {$e->getMessage()}");

            return self::FAILURE;
        }
    }

    /**
     * Sync all subscription plans.
     */
    protected function syncAllPlans(): int
    {
        $plans = SubscriptionPlan::all();

        if ($plans->isEmpty()) {
            $this->warn('⚠️  No subscription plans found in database');

            return self::SUCCESS;
        }

        $this->info("Found {$plans->count()} subscription plan(s)");
        $this->newLine();

        // Show confirmation unless --force is used
        if (! $this->option('force')) {
            if (! $this->confirm('Do you want to sync all plans to Stripe?', true)) {
                $this->warn('Operation cancelled');

                return self::SUCCESS;
            }
            $this->newLine();
        }

        // Sync all plans
        $this->withProgressBar($plans, function ($plan) {
            try {
                $this->stripeService->syncPlan($plan);
            } catch (\Exception $e) {
                // Error will be logged, continue with others
            }
        });

        $this->newLine(2);

        // Show results
        $results = $this->displayResults($plans);

        return $results['failed'] > 0 ? self::FAILURE : self::SUCCESS;
    }

    /**
     * Display results summary.
     */
    protected function displayResults($plans): array
    {
        $synced = [];
        $failed = [];

        foreach ($plans as $plan) {
            $plan = $plan->fresh();

            if ($plan->stripe_product_id && $plan->stripe_price_id) {
                $synced[] = $plan;
            } else {
                $failed[] = $plan;
            }
        }

        $this->info('📊 Sync Results:');
        $this->info('✅ Successfully synced: '.count($synced));

        if (! empty($failed)) {
            $this->error('❌ Failed to sync: '.count($failed));
        }

        $this->newLine();

        // Show synced plans details
        if (! empty($synced)) {
            $this->info('Successfully synced plans:');
            $this->table(
                ['ID', 'Name', 'Stripe Product', 'Stripe Price', 'Active'],
                collect($synced)->map(fn ($p) => [
                    $p->id,
                    $p->name,
                    substr($p->stripe_product_id, 0, 20).'...',
                    substr($p->stripe_price_id, 0, 20).'...',
                    $p->is_active ? '✓' : '✗',
                ])
            );
        }

        // Show failed plans
        if (! empty($failed)) {
            $this->newLine();
            $this->error('Failed plans:');
            $this->table(
                ['ID', 'Name'],
                collect($failed)->map(fn ($p) => [$p->id, $p->name])
            );
        }

        return [
            'synced' => count($synced),
            'failed' => count($failed),
        ];
    }

    /**
     * Display detailed information about a plan.
     */
    protected function displayPlanInfo(SubscriptionPlan $plan): void
    {
        $this->newLine();
        $this->info('Plan Details:');
        $this->table(
            ['Field', 'Value'],
            [
                ['Name', $plan->name],
                ['Price', $plan->price.' '.$plan->currency],
                ['Interval', $plan->interval],
                ['Trial Days', $plan->trial_days],
                ['Active', $plan->is_active ? 'Yes' : 'No'],
                ['Stripe Product ID', $plan->stripe_product_id ?? 'N/A'],
                ['Stripe Price ID', $plan->stripe_price_id ?? 'N/A'],
            ]
        );
    }
}
