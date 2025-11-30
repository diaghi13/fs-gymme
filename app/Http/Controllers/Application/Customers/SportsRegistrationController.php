<?php

namespace App\Http\Controllers\Application\Customers;

use App\Http\Controllers\Controller;
use App\Models\Customer\Customer;
use App\Models\Customer\SportsRegistration;
use Illuminate\Http\Request;

class SportsRegistrationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Customer $customer)
    {
        $registrations = $customer->sports_registrations()
            ->orderBy('end_date', 'desc')
            ->get();

        return response()->json([
            'registrations' => $registrations,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'organization' => ['required', 'string', 'max:100'],
            'membership_number' => ['nullable', 'string', 'max:50'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $registration = $customer->sports_registrations()->create([
            ...$validated,
            'status' => 'active',
        ]);

        return response()->json([
            'registration' => $registration,
            'message' => 'Tesseramento creato con successo',
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Customer $customer, SportsRegistration $registration)
    {
        // Ensure registration belongs to customer
        if ($registration->customer_id !== $customer->id) {
            abort(404);
        }

        return response()->json([
            'registration' => $registration,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Customer $customer, SportsRegistration $registration)
    {
        // Ensure registration belongs to customer
        if ($registration->customer_id !== $customer->id) {
            abort(404);
        }

        $validated = $request->validate([
            'organization' => ['required', 'string', 'max:100'],
            'membership_number' => ['nullable', 'string', 'max:50'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'status' => ['required', 'in:active,expired'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $registration->update($validated);

        return response()->json([
            'registration' => $registration->fresh(),
            'message' => 'Tesseramento aggiornato con successo',
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Customer $customer, SportsRegistration $registration)
    {
        // Ensure registration belongs to customer
        if ($registration->customer_id !== $customer->id) {
            abort(404);
        }

        $registration->delete();

        return response()->json([
            'message' => 'Tesseramento eliminato con successo',
        ]);
    }
}
