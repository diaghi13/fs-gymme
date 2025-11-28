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
        // Get VAT rates for default selection
        $vatRates = \App\Models\VatRate::orderBy('percentage', 'desc')
            ->get(['id', 'code', 'percentage'])
            ->map(fn ($vat) => [
                'id' => $vat->id,
                'label' => "{$vat->code} ({$vat->percentage}%)",
            ]);

        // Get payment methods for default selection
        $paymentMethods = \App\Models\Support\FinancialResource::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn ($pm) => [
                'id' => $pm->id,
                'label' => $pm->name,
            ]);

        $data = [
            'vatRates' => $vatRates,
            'paymentMethods' => $paymentMethods,
            'settings' => [
                // Progressive numbering
                'progressive' => [
                    'format' => TenantSetting::get('invoice.progressive_format', 'FT-{year}-{number}'),
                    'start' => TenantSetting::get('invoice.progressive_start', 1),
                    'prefix' => TenantSetting::get('invoice.progressive_prefix', 'FT-'),
                    'reset_yearly' => TenantSetting::get('invoice.progressive_reset_yearly', true),
                    'padding' => TenantSetting::get('invoice.progressive_padding', 4),
                ],

                // Default values
                'defaults' => [
                    'vat_rate_id' => TenantSetting::get('invoice.default_vat_rate_id', null),
                    'payment_terms_days' => TenantSetting::get('invoice.default_payment_terms_days', 30),
                    'payment_method_id' => TenantSetting::get('invoice.default_payment_method_id', null),
                    'notes' => TenantSetting::get('invoice.default_notes', ''),
                ],

                // PDF settings
                'pdf' => [
                    'logo_path' => TenantSetting::get('invoice.pdf_logo_path', ''),
                    'footer' => TenantSetting::get('invoice.pdf_footer', ''),
                    'show_stamp' => TenantSetting::get('invoice.pdf_show_stamp', true),
                    'legal_notes' => TenantSetting::get('invoice.pdf_legal_notes', ''),
                    'template' => TenantSetting::get('invoice.pdf_template', 'classic'),
                ],

                // Stamp duty
                'stamp_duty' => [
                    'charge_customer' => TenantSetting::get('invoice.stamp_duty_charge_customer', true),
                    'amount' => TenantSetting::get('invoice.stamp_duty_amount', 200), // 2.00€ in cents
                    'threshold' => TenantSetting::get('invoice.stamp_duty_threshold', 77.47),
                ],
            ],
        ];

        return Inertia::render('configurations/invoice-configuration', $data);
    }

    /**
     * Update invoice settings
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            // Progressive numbering
            'progressive.format' => 'required|string|max:255',
            'progressive.start' => 'required|integer|min:1',
            'progressive.prefix' => 'nullable|string|max:10',
            'progressive.reset_yearly' => 'required|boolean',
            'progressive.padding' => 'required|integer|min:1|max:10',

            // Defaults
            'defaults.vat_rate_id' => 'nullable|integer|exists:vat_rates,id',
            'defaults.payment_terms_days' => 'required|integer|min:0|max:365',
            'defaults.payment_method_id' => 'nullable|integer',
            'defaults.notes' => 'nullable|string|max:5000',

            // PDF settings
            'pdf.logo_path' => 'nullable|string|max:255',
            'pdf.footer' => 'nullable|string|max:500',
            'pdf.show_stamp' => 'required|boolean',
            'pdf.legal_notes' => 'nullable|string|max:2000',
            'pdf.template' => 'required|string|in:classic,modern,minimal',

            // Stamp duty
            'stamp_duty.charge_customer' => 'required|boolean',
            'stamp_duty.amount' => 'required|numeric|min:0',
            'stamp_duty.threshold' => 'required|numeric|min:0',
        ]);

        // Save progressive numbering settings
        TenantSetting::set('invoice.progressive_format', $validated['progressive']['format'], 'invoice', 'Invoice numbering format');
        TenantSetting::set('invoice.progressive_start', $validated['progressive']['start'], 'invoice', 'Invoice starting number');
        TenantSetting::set('invoice.progressive_prefix', $validated['progressive']['prefix'] ?? '', 'invoice', 'Invoice number prefix');
        TenantSetting::set('invoice.progressive_reset_yearly', $validated['progressive']['reset_yearly'], 'invoice', 'Reset invoice numbering yearly');
        TenantSetting::set('invoice.progressive_padding', $validated['progressive']['padding'], 'invoice', 'Invoice number padding (zeros)');

        // Save defaults
        TenantSetting::set('invoice.default_vat_rate_id', $validated['defaults']['vat_rate_id'], 'invoice', 'Default VAT rate for invoices');
        TenantSetting::set('invoice.default_payment_terms_days', $validated['defaults']['payment_terms_days'], 'invoice', 'Default payment terms in days');
        TenantSetting::set('invoice.default_payment_method_id', $validated['defaults']['payment_method_id'], 'invoice', 'Default payment method');
        TenantSetting::set('invoice.default_notes', $validated['defaults']['notes'] ?? '', 'invoice', 'Default invoice notes');

        // Save PDF settings
        TenantSetting::set('invoice.pdf_logo_path', $validated['pdf']['logo_path'] ?? '', 'invoice', 'Invoice PDF logo path');
        TenantSetting::set('invoice.pdf_footer', $validated['pdf']['footer'] ?? '', 'invoice', 'Invoice PDF footer text');
        TenantSetting::set('invoice.pdf_show_stamp', $validated['pdf']['show_stamp'], 'invoice', 'Show stamp duty in PDF');
        TenantSetting::set('invoice.pdf_template', $validated['pdf']['template'], 'invoice', 'Invoice PDF template layout');
        TenantSetting::set('invoice.pdf_legal_notes', $validated['pdf']['legal_notes'] ?? '', 'invoice', 'Invoice PDF legal notes');

        // Save stamp duty settings (convert euros to cents for amount)
        TenantSetting::set('invoice.stamp_duty_charge_customer', $validated['stamp_duty']['charge_customer'], 'invoice', 'Charge stamp duty to customer');
        TenantSetting::set('invoice.stamp_duty_amount', (int) ($validated['stamp_duty']['amount'] * 100), 'invoice', 'Stamp duty amount in cents');
        TenantSetting::set('invoice.stamp_duty_threshold', $validated['stamp_duty']['threshold'], 'invoice', 'Stamp duty threshold amount');

        return redirect()->back()->with('success', 'Impostazioni fatturazione aggiornate con successo');
    }
}
