<?php

namespace App\Http\Controllers\Application\Customers;

use App\Http\Controllers\Controller;
use App\Models\Customer\Customer;
use App\Models\Support\MedicalCertification;
use Illuminate\Http\Request;

class MedicalCertificationController extends Controller
{
    public function store(Request $request, Customer $customer)
    {
        // Validate the request data
        $validated = $request->validate([
            'certification_date' => 'required|date',
            'valid_until' => 'required|date|after_or_equal:certification_date',
            'notes' => 'nullable|string|max:255',
        ]);

        $customer->medical_certifications()->create([
            'certification_date' => $validated['certification_date'],
            'valid_until' => $validated['valid_until'],
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('app.customers.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'customer' => $customer->id
        ])
            ->with('status', 'success')
            ->with('message', 'Medical certification created successfully.');
    }

    public function update(Request $request, MedicalCertification $medicalCertification)
    {
        $validated = $request->validate([
            'certification_date' => 'required|date',
            'valid_until' => 'required|date|after_or_equal:certification_date',
            'notes' => 'nullable|string|max:255',
        ]);

        $medicalCertification->update($validated);

        return redirect()->route('app.customers.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'customer' => $medicalCertification->medical_certifiable_id
        ])
            ->with('status', 'success')
            ->with('message', 'Medical certification updated successfully.');
    }

    public function destroy(Request $request, MedicalCertification $medicalCertification)
    {
        $medicalCertification->delete();

        return redirect()->route('app.customers.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'customer' => $medicalCertification->customer_id
        ])
            ->with('status', 'success')
            ->with('message', 'Medical certification deleted successfully.');
    }
}
