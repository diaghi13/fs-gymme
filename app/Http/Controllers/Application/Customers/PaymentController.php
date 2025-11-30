<?php

namespace App\Http\Controllers\Application\Customers;

use App\Http\Controllers\Controller;
use App\Models\Customer\Customer;
use App\Models\Sale\Payment;
use App\Models\Sale\Sale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    /**
     * Store a new payment for a sale
     */
    public function store(Request $request, Customer $customer, Sale $sale): RedirectResponse
    {
        $validated = $request->validate([
            'due_date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|exists:payment_methods,id',
            'payed_at' => 'nullable|date',
        ]);

        $sale->payments()->create([
            'due_date' => $validated['due_date'],
            'amount' => $validated['amount'],
            'payment_method_id' => $validated['payment_method'],
            'payed_at' => $validated['payed_at'] ?? null,
        ]);

        return redirect()->back()->with('status', 'Pagamento aggiunto con successo.');
    }

    /**
     * Update an existing payment
     */
    public function update(Request $request, Customer $customer, Sale $sale, Payment $payment): RedirectResponse
    {
        $validated = $request->validate([
            'payed_at' => 'required|date',
        ]);

        $payment->update([
            'payed_at' => $validated['payed_at'],
        ]);

        return redirect()->back()->with('status', 'Pagamento registrato con successo.');
    }
}
