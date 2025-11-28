<?php

namespace App\Http\Controllers\Application\Configurations;

use App\Http\Controllers\Controller;
use App\Models\TenantSetting;
use App\Models\VatNature;
use App\Models\VatRate;
use App\Models\VatRateGroup;
use App\Models\VatRateType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VatSettingsController extends Controller
{
    /**
     * Display VAT settings page with dynamic VAT natures from database
     */
    public function show(): Response
    {
        // Get all VAT rates with relationships (including inactive for advanced section)
        $vatRates = VatRate::with(['vatRateType', 'vatRateGroup'])
            ->orderBy('order')
            ->get()
            ->map(function ($vat) {
                return [
                    'id' => $vat->id,
                    'code' => $vat->code,
                    'description' => $vat->description,
                    'percentage' => $vat->percentage,
                    'nature' => $vat->nature,
                    'type' => [
                        'id' => $vat->vatRateType?->id,
                        'code' => $vat->vatRateType?->code,
                        'type' => $vat->vatRateType?->type,
                    ],
                    'group' => [
                        'id' => $vat->vatRateGroup?->id,
                        'code' => $vat->vatRateGroup?->code,
                        'group' => $vat->vatRateGroup?->group,
                    ],
                    'is_system' => $vat->is_system,
                    'is_active' => $vat->is_active,
                    'visible_in_activity' => $vat->visible_in_activity,
                    'checkout_application' => $vat->checkout_application,
                    'label' => "{$vat->code} - {$vat->description} ({$vat->percentage}%)",
                ];
            });

        // Get all VAT natures from database (dynamic, not hardcoded)
        $vatNatures = VatNature::orderBy('order')
            ->get()
            ->map(function ($nature) {
                return [
                    'id' => $nature->id,
                    'code' => $nature->code,
                    'description' => $nature->description,
                    'full_label' => $nature->full_label,
                    'parent_code' => $nature->parent_code,
                    'usage_notes' => $nature->usage_notes,
                    'requires_document_reference' => $nature->requires_document_reference,
                    'is_parent' => $nature->isParent(),
                ];
            });

        // Get VAT rate types for filtering/grouping
        $vatRateTypes = VatRateType::orderBy('order')->get();

        // Get VAT rate groups for filtering/grouping
        $vatRateGroups = VatRateGroup::orderBy('order')->get();

        return Inertia::render('configurations/vat-settings', [
            'settings' => [
                'default_sales_vat_rate_id' => TenantSetting::get('vat.default_sales_rate_id', null),
                'default_purchase_vat_rate_id' => TenantSetting::get('vat.default_purchase_rate_id', null),
                'split_payment_enabled' => TenantSetting::get('vat.split_payment_enabled', false),
                'reverse_charge_enabled' => TenantSetting::get('vat.reverse_charge_enabled', false),
            ],
            'vatRates' => $vatRates,
            'vatNatures' => $vatNatures,
            'vatRateTypes' => $vatRateTypes,
            'vatRateGroups' => $vatRateGroups,
        ]);
    }

    /**
     * Update VAT settings (removed deprecated exempt_nature_nX booleans)
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'default_sales_vat_rate_id' => 'nullable|exists:vat_rates,id',
            'default_purchase_vat_rate_id' => 'nullable|exists:vat_rates,id',
            'split_payment_enabled' => 'boolean',
            'reverse_charge_enabled' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            TenantSetting::set(
                "vat.{$key}",
                $value,
                'vat',
                "VAT setting: {$key}"
            );
        }

        return redirect()->back()->with('success', 'Impostazioni IVA aggiornate con successo');
    }

    /**
     * Toggle is_active status for a VAT rate
     */
    public function toggleActive(Request $request, VatRate $vatRate)
    {
        $validated = $request->validate([
            'is_active' => 'required|boolean',
        ]);

        $vatRate->update([
            'is_active' => $validated['is_active'],
        ]);

        $message = $validated['is_active']
            ? "Aliquota {$vatRate->code} attivata con successo"
            : "Aliquota {$vatRate->code} disattivata con successo";

        return redirect()->back()->with('success', $message);
    }

    /**
     * Store a custom VAT rate created by tenant
     */
    public function storeCustomRate(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:vat_rates,code',
            'description' => 'required|string|max:255',
            'percentage' => 'required|numeric|min:0|max:100',
            'nature' => 'nullable|string|exists:vat_natures,code',
            'vat_rate_type_id' => 'required|exists:vat_rate_types,id',
            'vat_rate_group_id' => 'required|exists:vat_rate_groups,id',
            'visible_in_activity' => 'boolean',
            'checkout_application' => 'boolean',
        ]);

        // Note: MoneyCast automatically handles percentage conversion (stores as cents)
        // No manual multiplication needed here

        // Custom rates are not system rates and are active by default
        $validated['is_system'] = false;
        $validated['is_active'] = true;

        // Set order to end of list
        $maxOrder = VatRate::max('order') ?? 0;
        $validated['order'] = $maxOrder + 1;

        $vatRate = VatRate::create($validated);

        return redirect()
            ->back()
            ->with('success', "Aliquota personalizzata {$vatRate->code} creata con successo");
    }
}
