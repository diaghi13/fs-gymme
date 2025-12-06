<?php

namespace App\Http\Controllers\Application\Configurations;

use App\Http\Controllers\Controller;
use App\Models\Support\FinancialResource;
use Illuminate\Http\Request;

class FinancialResourceConfigurationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return inertia('configurations/financial-resource-configuration', [
            'financialResources' => FinancialResource::all(),
        ]);
    }

    /**
     * CustomerShow the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'iban' => 'nullable|string|max:255|regex:/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/',
            'bic' => 'nullable|string|max:255|regex:/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/',
        ]);

        // dd($validated);

        FinancialResource::create($validated);

        return redirect()->route('app.configurations.financial-resources', ['tenant' => $request->user()->company->id])
            ->with('status', 'success');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * CustomerShow the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'type' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'iban' => 'nullable|string|max:255',
            'swift' => 'nullable|string|max:255',
        ]);

        $financialResource = FinancialResource::findOrFail($id);
        $financialResource->update($validated);

        return redirect()->route('app.configurations.financial-resources', ['tenant' => $request->user()->company->id])
            ->with('status', 'success');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
