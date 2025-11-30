<?php

namespace App\Http\Controllers\Application\Configurations;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompanyConfigurationController extends Controller
{
    /**
     * Display the company configuration page
     */
    public function show(): Response
    {
        $tenant = tenant();

        return Inertia::render('configurations/company-configuration', [
            'company' => [
                'name' => $tenant->name ?? '',
                'tax_code' => $tenant->tax_code ?? '',
                'vat_number' => $tenant->vat_number ?? '',
                'address' => $tenant->address ?? '',
                'city' => $tenant->city ?? '',
                'postal_code' => $tenant->postal_code ?? '',
                'province' => $tenant->province ?? '',
                'country' => $tenant->country ?? 'IT',
                'phone' => $tenant->phone ?? '',
                'email' => $tenant->email ?? '',
                'pec_email' => $tenant->pec_email ?? '',
                'sdi_code' => $tenant->sdi_code ?? '',
                'fiscal_regime' => $tenant->fiscal_regime ?? '',
                'website' => $tenant->website ?? '',
            ],
        ]);
    }

    /**
     * Update company configuration
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'tax_code' => 'nullable|string|max:16',
            'vat_number' => 'nullable|string|max:11',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'province' => 'nullable|string|max:2',
            'country' => 'nullable|string|max:2',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'pec_email' => 'nullable|email|max:255',
            'sdi_code' => 'nullable|string|max:7',
            'fiscal_regime' => 'nullable|string|max:10',
            'website' => 'nullable|url|max:255',
        ]);

        $tenant = tenant();
        $tenant->update($validated);

        return redirect()->back()->with('success', 'Dati azienda aggiornati con successo');
    }
}
