<?php

namespace App\Http\Controllers\Application\Configurations;

use App\Http\Controllers\Controller;
use App\Models\TenantSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceConfigurationController extends Controller
{
    /**
     * Display invoice configuration settings
     */
    public function show(): Response
    {
        $settings = [
            'stamp_duty' => [
                'charge_customer' => TenantSetting::get('invoice.stamp_duty.charge_customer', true),
                'amount' => TenantSetting::get('invoice.stamp_duty.amount', 200),
                'threshold' => TenantSetting::get('invoice.stamp_duty.threshold', 77.47),
            ],
        ];

        return Inertia::render('configurations/invoice-configuration', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update invoice configuration settings
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'stamp_duty.charge_customer' => 'required|boolean',
            'stamp_duty.amount' => 'required|integer|min:0',
            'stamp_duty.threshold' => 'required|numeric|min:0',
        ]);

        // Update stamp duty settings
        TenantSetting::set(
            key: 'invoice.stamp_duty.charge_customer',
            value: $validated['stamp_duty']['charge_customer'],
            group: 'invoice',
            description: 'Se TRUE, l\'imposta di bollo viene addebitata al cliente. Se FALSE, l\'azienda se ne fa carico internamente.'
        );

        TenantSetting::set(
            key: 'invoice.stamp_duty.amount',
            value: $validated['stamp_duty']['amount'],
            group: 'invoice',
            description: 'Importo imposta di bollo in centesimi (default 200 = 2€)'
        );

        TenantSetting::set(
            key: 'invoice.stamp_duty.threshold',
            value: $validated['stamp_duty']['threshold'],
            group: 'invoice',
            description: 'Soglia minima in euro per applicazione bollo (default 77,47€)'
        );

        return redirect()->back()->with('status', 'Configurazione fatturazione aggiornata con successo.');
    }
}
