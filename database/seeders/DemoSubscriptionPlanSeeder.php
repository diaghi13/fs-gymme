<?php

namespace Database\Seeders;

use App\Models\PlanFeature;
use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class DemoSubscriptionPlanSeeder extends Seeder
{
    /**
     * Seed the demo/trial subscription plan with limited features.
     *
     * This creates a free trial plan that users can use to test the platform
     * before committing to a paid subscription.
     */
    public function run(): void
    {
        // Create Demo Plan
        $demoPlan = SubscriptionPlan::create([
            'name' => 'Demo Gratuita',
            'slug' => 'demo',
            'description' => 'Prova Gymme gratuitamente per 14 giorni. Funzionalità limitate per testare la piattaforma.',
            'price' => 0, // FREE
            'currency' => 'EUR',
            'interval' => 'monthly',
            'trial_days' => 0, // Not needed, plan is already free
            'tier' => null, // No tier for demo
            'is_trial_plan' => true, // ← This is a dedicated trial plan
            'is_active' => true,
            'sort_order' => 0, // Show first in UI
            'stripe_price_id' => null, // No Stripe integration for free plan
        ]);

        $this->command->info('✓ Created Demo Plan');

        // Configure LIMITED features for demo
        $this->attachLimitedFeatures($demoPlan);

        $this->command->info('✓ Demo Plan configured with limited features');
        $this->command->line('');
        $this->command->info('Demo Plan Summary:');
        $this->command->line("  - Name: {$demoPlan->name}");
        $this->command->line('  - Price: FREE');
        $this->command->line('  - Duration: 14 days (managed via ends_at)');
        $this->command->line('  - Max Users: 5');
        $this->command->line('  - Storage: 1 GB');
        $this->command->line('  - Electronic Invoicing: NO (can purchase as addon)');
        $this->command->line('');
        $this->command->warn('After 14 days, tenants on this plan should be prompted to upgrade.');
    }

    /**
     * Attach limited features to the demo plan.
     */
    protected function attachLimitedFeatures(SubscriptionPlan $demoPlan): void
    {
        // Get features (assuming they exist from previous seeders)
        $maxUsers = PlanFeature::where('name', 'max_users')->first();
        $storage = PlanFeature::where('name', 'storage_gb')->first();
        $electronicInvoicing = PlanFeature::where('name', 'electronic_invoicing')->first();

        // Max Users: 5 included (very limited for demo)
        if ($maxUsers) {
            $demoPlan->features()->attach($maxUsers->id, [
                'is_included' => true,
                'quota_limit' => 5, // Only 5 users for demo
                'price' => null,
            ]);
            $this->command->line('  ✓ Max Users: 5 (included)');
        }

        // Storage: 1 GB (limited)
        if ($storage) {
            $demoPlan->features()->attach($storage->id, [
                'is_included' => true,
                'quota_limit' => 1, // Only 1 GB
                'price' => null,
            ]);
            $this->command->line('  ✓ Storage: 1 GB (included)');
        }

        // Electronic Invoicing: NOT included (must upgrade)
        if ($electronicInvoicing) {
            $demoPlan->features()->attach($electronicInvoicing->id, [
                'is_included' => false, // Not included in demo
                'quota_limit' => null,
                'price' => null, // Can't purchase as addon on demo
            ]);
            $this->command->line('  ✓ Electronic Invoicing: Not included');
        }

        // Add more features as needed with limitations...
    }
}
