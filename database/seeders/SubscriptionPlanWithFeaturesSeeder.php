<?php

namespace Database\Seeders;

use App\Enums\SubscriptionPlanTier;
use App\Models\PlanFeature;
use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanWithFeaturesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure features exist first
        $this->call(PlanFeatureSeeder::class);

        // Get all features
        $features = PlanFeature::all()->keyBy('name');

        // ====== PIANO BASE ======
        $basePlan = SubscriptionPlan::updateOrCreate(
            ['slug' => 'base'],
            [
                'name' => 'Base',
                'tier' => SubscriptionPlanTier::Base->value,
                'description' => "Piano ideale per piccole palestre e centri fitness che stanno iniziando.\n\nInclude le funzionalità essenziali per gestire clienti, abbonamenti e vendite.",
                'price' => 49, // MoneyCast gestisce i centesimi, quindi 49 = €0.49
                'currency' => 'EUR',
                'interval' => 'monthly',
                'trial_days' => 14,
                'is_trial_plan' => false,
                'sort_order' => 1,
                'is_active' => true,
                'stripe_price_id' => null, // Da configurare con Stripe
            ]
        );

        // Features Piano BASE
        $basePlan->features()->sync([
            $features['unlimited_customers']->id => [
                'is_included' => true,
                'quota_limit' => 100, // Max 100 clienti
                'price' => null, // Incluso
            ],
            $features['multi_location']->id => [
                'is_included' => true,
                'quota_limit' => 1, // 1 sede
                'price' => null,
            ],
            $features['unlimited_users']->id => [
                'is_included' => true,
                'quota_limit' => 3, // Max 3 utenti staff
                'price' => null,
            ],
            $features['electronic_invoicing']->id => [
                'is_included' => false, // NON incluso - acquistabile come addon
                'quota_limit' => 50, // Se acquistato come addon: 50 fatture
                'price' => 15.00, // €15/mese come addon
            ],
            $features['advanced_reporting']->id => [
                'is_included' => false,
                'quota_limit' => null,
                'price' => 20.00, // €20/mese
            ],
            $features['api_access']->id => [
                'is_included' => false,
                'quota_limit' => null,
                'price' => 25.00, // €25/mese
            ],
            $features['custom_branding']->id => [
                'is_included' => false,
                'quota_limit' => null,
                'price' => 15.00, // €15/mese
            ],
        ]);

        // ====== PIANO GOLD ======
        $goldPlan = SubscriptionPlan::updateOrCreate(
            ['slug' => 'gold'],
            [
                'name' => 'Gold',
                'tier' => SubscriptionPlanTier::Gold->value,
                'description' => "Piano professionale per centri fitness di medie dimensioni.\n\nInclude fatturazione elettronica, report avanzati e supporto per più sedi.",
                'price' => 99, // MoneyCast gestisce i centesimi, quindi 99 = €99.99
                'currency' => 'EUR',
                'interval' => 'monthly',
                'trial_days' => 21, // Piano Gold ha 21 giorni di trial
                'is_trial_plan' => false,
                'sort_order' => 2,
                'is_active' => true,
                'stripe_price_id' => null,
            ]
        );

        // Features Piano GOLD
        $goldPlan->features()->sync([
            $features['unlimited_customers']->id => [
                'is_included' => true,
                'quota_limit' => 500, // Max 500 clienti
                'price' => null,
            ],
            $features['multi_location']->id => [
                'is_included' => true,
                'quota_limit' => 3, // Fino a 3 sedi
                'price' => 10.00, // €10 per sede extra oltre le 3
            ],
            $features['unlimited_users']->id => [
                'is_included' => true,
                'quota_limit' => 10, // Max 10 utenti
                'price' => 5.00, // €5 per utente extra
            ],
            $features['electronic_invoicing']->id => [
                'is_included' => true, // INCLUSO!
                'quota_limit' => 200, // 200 fatture/mese incluse
                'price' => 10.00, // €10 per pacchetti extra (+100 fatture)
            ],
            $features['advanced_reporting']->id => [
                'is_included' => true, // INCLUSO!
                'quota_limit' => null,
                'price' => null,
            ],
            $features['api_access']->id => [
                'is_included' => true, // INCLUSO!
                'quota_limit' => null,
                'price' => null,
            ],
            $features['custom_branding']->id => [
                'is_included' => false,
                'quota_limit' => null,
                'price' => 10.00, // €10/mese
            ],
            $features['priority_support']->id => [
                'is_included' => false,
                'quota_limit' => null,
                'price' => null, // Non acquistabile - solo Platinum
            ],
        ]);

        // ====== PIANO PLATINUM ======
        $platinumPlan = SubscriptionPlan::updateOrCreate(
            ['slug' => 'platinum'],
            [
                'name' => 'Platinum',
                'tier' => SubscriptionPlanTier::Platinum->value,
                'description' => "Piano enterprise per grandi catene e centri fitness.\n\nTutto incluso, senza limiti, con supporto prioritario dedicato.",
                'price' => 199.00, // €199/mese (in centesimi)
                'currency' => 'EUR',
                'interval' => 'monthly',
                'trial_days' => 30, // Piano Platinum ha 30 giorni di trial
                'is_trial_plan' => false,
                'sort_order' => 3,
                'is_active' => true,
                'stripe_price_id' => null,
            ]
        );

        // Features Piano PLATINUM
        $platinumPlan->features()->sync([
            $features['unlimited_customers']->id => [
                'is_included' => true,
                'quota_limit' => null, // ILLIMITATI!
                'price' => null,
            ],
            $features['multi_location']->id => [
                'is_included' => true,
                'quota_limit' => null, // ILLIMITATE!
                'price' => null,
            ],
            $features['unlimited_users']->id => [
                'is_included' => true,
                'quota_limit' => null, // ILLIMITATI!
                'price' => null,
            ],
            $features['electronic_invoicing']->id => [
                'is_included' => true,
                'quota_limit' => null, // ILLIMITATE!
                'price' => null,
            ],
            $features['advanced_reporting']->id => [
                'is_included' => true,
                'quota_limit' => null,
                'price' => null,
            ],
            $features['api_access']->id => [
                'is_included' => true,
                'quota_limit' => null,
                'price' => null,
            ],
            $features['custom_branding']->id => [
                'is_included' => true, // INCLUSO!
                'quota_limit' => null,
                'price' => null,
            ],
            $features['priority_support']->id => [
                'is_included' => true, // INCLUSO!
                'quota_limit' => null,
                'price' => null,
            ],
        ]);

        $this->command->info('✅ Created 3 subscription plans with features:');
        $this->command->info('   - Base: €49/mese (100 clienti, 1 sede)');
        $this->command->info('   - Gold: €99/mese (500 clienti, 3 sedi, fatturazione inclusa)');
        $this->command->info('   - Platinum: €199/mese (tutto illimitato)');
    }
}
