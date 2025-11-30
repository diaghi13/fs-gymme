<?php

namespace App\Http\Controllers\Application\Customers;

use App\Http\Controllers\Controller;
use App\Models\Customer\CustomerSubscription;
use App\Models\Customer\CustomerSubscriptionSuspension;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerSubscriptionSuspensionController extends Controller
{
    /**
     * Display a listing of the suspensions for a subscription
     */
    public function index(CustomerSubscription $subscription)
    {
        $suspensions = $subscription->suspensions()
            ->with('created_by')
            ->get();

        return response()->json($suspensions);
    }

    /**
     * Store a newly created suspension
     */
    public function store(Request $request, CustomerSubscription $subscription): RedirectResponse
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'reason' => 'nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($validated, $subscription, $request) {
            // Calculate days suspended
            $startDate = \Carbon\Carbon::parse($validated['start_date']);
            $endDate = \Carbon\Carbon::parse($validated['end_date']);
            $daysSuspended = $startDate->diffInDays($endDate);

            // Create suspension
            $subscription->suspensions()->create([
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'days_suspended' => $daysSuspended,
                'reason' => $validated['reason'] ?? null,
                'created_by' => $request->user()->id,
            ]);

            // Update subscription suspended_days total
            $subscription->increment('suspended_days', $daysSuspended);
        });

        return redirect()->back()
            ->with('status', 'success')
            ->with('message', 'Sospensione creata con successo');
    }

    /**
     * Update the specified suspension
     */
    public function update(Request $request, CustomerSubscriptionSuspension $suspension): RedirectResponse
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'reason' => 'nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($validated, $suspension) {
            $subscription = $suspension->customerSubscription;
            $oldDays = $suspension->days_suspended;

            // Calculate new days suspended
            $startDate = \Carbon\Carbon::parse($validated['start_date']);
            $endDate = \Carbon\Carbon::parse($validated['end_date']);
            $newDays = $startDate->diffInDays($endDate);
            $daysDifference = $newDays - $oldDays;

            // Update suspension
            $suspension->update([
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'days_suspended' => $newDays,
                'reason' => $validated['reason'] ?? $suspension->reason,
            ]);

            // Update subscription suspended_days total
            if ($daysDifference > 0) {
                $subscription->increment('suspended_days', $daysDifference);
            } elseif ($daysDifference < 0) {
                $subscription->decrement('suspended_days', abs($daysDifference));
            }
        });

        return redirect()->back()
            ->with('status', 'success')
            ->with('message', 'Sospensione modificata con successo');
    }

    /**
     * Remove the specified suspension
     */
    public function destroy(CustomerSubscriptionSuspension $suspension): RedirectResponse
    {
        DB::transaction(function () use ($suspension) {
            $subscription = $suspension->customerSubscription;
            $daysSuspended = $suspension->days_suspended;

            // Delete suspension
            $suspension->delete();

            // Update subscription suspended_days total
            $subscription->decrement('suspended_days', $daysSuspended);
        });

        return redirect()->back()
            ->with('status', 'success')
            ->with('message', 'Sospensione eliminata con successo');
    }
}
