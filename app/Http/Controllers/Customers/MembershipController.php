<?php

namespace App\Http\Controllers\Customers;

use App\Http\Controllers\Controller;
use App\Models\Customer\CustomerSubscription;
use App\Models\PriceList\Membership;
use App\Models\PriceList\Subscription;
use Illuminate\Http\Request;

class MembershipController extends Controller
{
    public function update(Request $request, CustomerSubscription $customerSubscription)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'card_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $customerSubscription->update([
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
            'card_number' => $request->input('card_number'),
            'notes' => $request->input('notes'),
        ]);

        return redirect()->route('customers.show', ['customer' => $customerSubscription->customer_id])
            ->with('status', 'success')
            ->with('message', 'Membership updated successfully.');
    }
}
