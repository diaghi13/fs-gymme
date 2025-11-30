<?php

namespace App\Http\Controllers\Application\Customers;

use App\Http\Controllers\Controller;
use App\Models\Customer\Customer;
use App\Models\Customer\CustomerMeasurement;
use Illuminate\Http\Request;

class CustomerMeasurementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Customer $customer)
    {
        $measurements = $customer->measurements()
            ->with('measuredBy')
            ->orderBy('measured_at', 'desc')
            ->get();

        return response()->json([
            'measurements' => $measurements,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'measured_at' => ['required', 'date'],
            'weight' => ['nullable', 'numeric', 'min:0', 'max:500'],
            'height' => ['nullable', 'numeric', 'min:0', 'max:300'],
            'chest_circumference' => ['nullable', 'numeric', 'min:0', 'max:300'],
            'waist_circumference' => ['nullable', 'numeric', 'min:0', 'max:300'],
            'hips_circumference' => ['nullable', 'numeric', 'min:0', 'max:300'],
            'arm_circumference' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'thigh_circumference' => ['nullable', 'numeric', 'min:0', 'max:150'],
            'body_fat_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'lean_mass_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $measurement = $customer->measurements()->create([
            ...$validated,
            'measured_by' => $request->user()->id,
        ]);

        return response()->json([
            'measurement' => $measurement->load('measuredBy'),
            'message' => 'Misurazione salvata con successo',
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Customer $customer, CustomerMeasurement $measurement)
    {
        // Ensure measurement belongs to customer
        if ($measurement->customer_id !== $customer->id) {
            abort(404);
        }

        return response()->json([
            'measurement' => $measurement->load('measuredBy'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Customer $customer, CustomerMeasurement $measurement)
    {
        // Ensure measurement belongs to customer
        if ($measurement->customer_id !== $customer->id) {
            abort(404);
        }

        $validated = $request->validate([
            'measured_at' => ['required', 'date'],
            'weight' => ['nullable', 'numeric', 'min:0', 'max:500'],
            'height' => ['nullable', 'numeric', 'min:0', 'max:300'],
            'chest_circumference' => ['nullable', 'numeric', 'min:0', 'max:300'],
            'waist_circumference' => ['nullable', 'numeric', 'min:0', 'max:300'],
            'hips_circumference' => ['nullable', 'numeric', 'min:0', 'max:300'],
            'arm_circumference' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'thigh_circumference' => ['nullable', 'numeric', 'min:0', 'max:150'],
            'body_fat_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'lean_mass_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $measurement->update($validated);

        return response()->json([
            'measurement' => $measurement->fresh()->load('measuredBy'),
            'message' => 'Misurazione aggiornata con successo',
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Customer $customer, CustomerMeasurement $measurement)
    {
        // Ensure measurement belongs to customer
        if ($measurement->customer_id !== $customer->id) {
            abort(404);
        }

        $measurement->delete();

        return response()->json([
            'message' => 'Misurazione eliminata con successo',
        ]);
    }
}
