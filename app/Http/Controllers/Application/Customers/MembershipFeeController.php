<?php

namespace App\Http\Controllers\Application\Customers;

use App\Http\Controllers\Controller;
use App\Models\Customer\Customer;
use App\Models\Customer\MembershipFee;
use Illuminate\Http\Request;

class MembershipFeeController extends Controller
{
    /**
     * Display a listing of the resource.
     * Note: Membership fees are created automatically from sales, not manually.
     */
    public function index(Customer $customer)
    {
        $membershipFees = $customer->membership_fees()
            ->with('saleRow.sale')
            ->orderBy('end_date', 'desc')
            ->get();

        return response()->json([
            'membership_fees' => $membershipFees,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Customer $customer, MembershipFee $membershipFee)
    {
        // Ensure membership fee belongs to customer
        if ($membershipFee->customer_id !== $customer->id) {
            abort(404);
        }

        $membershipFee->load('saleRow.sale');

        return response()->json([
            'membership_fee' => $membershipFee,
        ]);
    }

    /**
     * Update the specified resource (only dates and status for corrections).
     * Note: Membership fees are created from sales, this is only for fixing errors.
     */
    public function update(Request $request, Customer $customer, MembershipFee $membershipFee)
    {
        // Ensure membership fee belongs to customer
        if ($membershipFee->customer_id !== $customer->id) {
            abort(404);
        }

        $validated = $request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'status' => ['required', 'in:active,expired,suspended'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $membershipFee->update($validated);

        return response()->json([
            'membership_fee' => $membershipFee->fresh(),
            'message' => 'Quota associativa aggiornata con successo',
        ]);
    }
}
