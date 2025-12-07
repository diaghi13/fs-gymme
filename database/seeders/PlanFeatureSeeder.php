<?php

namespace Database\Seeders;

use App\Enums\FeatureType;
use App\Models\PlanFeature;
use Illuminate\Database\Seeder;

class PlanFeatureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $features = [
            [
                'name' => 'electronic_invoicing',
                'display_name' => 'Fatturazione Elettronica',
                'description' => 'Emissione e gestione fatture elettroniche XML',
                'feature_type' => FeatureType::Quota->value,
                'is_addon_purchasable' => true,
                'default_addon_price' => 15.00, // €15/mese
                'default_addon_quota' => 50, // 50 fatture/mese
                'sort_order' => 1,
            ],
            [
                'name' => 'multi_location',
                'display_name' => 'Multi-Sede',
                'description' => 'Gestione di più sedi/strutture',
                'feature_type' => FeatureType::Quota->value,
                'is_addon_purchasable' => true,
                'default_addon_price' => 10.00, // €10/mese per sede extra
                'default_addon_quota' => 1, // 1 sede extra
                'sort_order' => 2,
            ],
            [
                'name' => 'advanced_reporting',
                'display_name' => 'Report Avanzati',
                'description' => 'Report personalizzati, export e analytics avanzate',
                'feature_type' => FeatureType::Boolean->value,
                'is_addon_purchasable' => true,
                'default_addon_price' => 20.00, // €20/mese
                'default_addon_quota' => null,
                'sort_order' => 3,
            ],
            [
                'name' => 'api_access',
                'display_name' => 'Accesso API',
                'description' => 'Accesso alle API REST per integrazioni',
                'feature_type' => FeatureType::Boolean->value,
                'is_addon_purchasable' => true,
                'default_addon_price' => 25.00, // €25/mese
                'default_addon_quota' => null,
                'sort_order' => 4,
            ],
            [
                'name' => 'custom_branding',
                'display_name' => 'Personalizzazione Brand',
                'description' => 'Logo personalizzato, colori e branding',
                'feature_type' => FeatureType::Boolean->value,
                'is_addon_purchasable' => true,
                'default_addon_price' => 15.00, // €15/mese
                'default_addon_quota' => null,
                'sort_order' => 5,
            ],
            [
                'name' => 'priority_support',
                'display_name' => 'Supporto Prioritario',
                'description' => 'Supporto tecnico prioritario via email e telefono',
                'feature_type' => FeatureType::Boolean->value,
                'is_addon_purchasable' => false, // Solo nei piani top
                'default_addon_price' => null,
                'default_addon_quota' => null,
                'sort_order' => 6,
            ],
            [
                'name' => 'unlimited_customers',
                'display_name' => 'Clienti Illimitati',
                'description' => 'Numero illimitato di clienti nel database',
                'feature_type' => FeatureType::Quota->value,
                'is_addon_purchasable' => false, // Solo upgrade piano
                'default_addon_price' => null,
                'default_addon_quota' => null,
                'sort_order' => 7,
            ],
            [
                'name' => 'unlimited_users',
                'display_name' => 'Utenti Illimitati',
                'description' => 'Numero illimitato di utenti staff',
                'feature_type' => FeatureType::Quota->value,
                'is_addon_purchasable' => true,
                'default_addon_price' => 5.00, // €5 per utente extra
                'default_addon_quota' => 1, // 1 utente
                'sort_order' => 8,
            ],
        ];

        foreach ($features as $feature) {
            PlanFeature::updateOrCreate(
                ['name' => $feature['name']],
                $feature
            );
        }
    }
}
