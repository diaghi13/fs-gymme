<?php

namespace Database\Seeders;

use App\Models\TenantSetting;
use Illuminate\Database\Seeder;

class TenantSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Impostazioni Fatturazione - Imposta di Bollo
        TenantSetting::set(
            key: 'invoice.stamp_duty.charge_customer',
            value: true,
            group: 'invoice',
            description: 'Se TRUE, l\'imposta di bollo viene addebitata al cliente. Se FALSE, l\'azienda se ne fa carico internamente.'
        );

        TenantSetting::set(
            key: 'invoice.stamp_duty.amount',
            value: 200, // 2€ in centesimi
            group: 'invoice',
            description: 'Importo imposta di bollo in centesimi (default 200 = 2€)'
        );

        TenantSetting::set(
            key: 'invoice.stamp_duty.threshold',
            value: 77.47,
            group: 'invoice',
            description: 'Soglia minima in euro per applicazione bollo (default 77,47€)'
        );
    }
}
