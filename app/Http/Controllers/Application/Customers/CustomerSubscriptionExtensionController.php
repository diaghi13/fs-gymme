<?php

namespace App\Http\Controllers\Application\Customers;

use App\Http\Controllers\Controller;
use App\Models\Customer\CustomerSubscription;
use App\Models\Customer\CustomerSubscriptionExtension;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerSubscriptionExtensionController extends Controller
{
    /**
     * Display a listing of the extensions for a subscription
     */
    public function index(CustomerSubscription $subscription)
    {
        $extensions = $subscription->extensions()
            ->with('created_by')
            ->get();

        return response()->json($extensions);
    }

    /**
     * Store a newly created extension
     */
    public function store(Request $request, CustomerSubscription $subscription): RedirectResponse
    {
        $validated = $request->validate([
            'days_extended' => 'required|integer|min:1|max:365',
            'reason' => 'nullable|string|max:1000',
            'extended_at' => 'nullable|date',
        ]);

        DB::transaction(function () use ($validated, $subscription, $request) {
            $daysExtended = $validated['days_extended'];
            $extendedAt = $validated['extended_at'] ?? now()->format('Y-m-d');

            // Calculate new end date
            $currentEndDate = $subscription->effective_end_date ?? $subscription->end_date;
            $newEndDate = $currentEndDate ? $currentEndDate->copy()->addDays($daysExtended) : null;

            // Create extension
            $subscription->extensions()->create([
                'days_extended' => $daysExtended,
                'reason' => $validated['reason'] ?? null,
                'extended_at' => $extendedAt,
                'new_end_date' => $newEndDate,
                'created_by' => $request->user()->id,
            ]);

            // Update subscription extended_days total
            $subscription->increment('extended_days', $daysExtended);
        });

        return redirect()->back()
            ->with('status', 'success')
            ->with('message', 'Proroga creata con successo');
    }

    /**
     * Update the specified extension
     */
    public function update(Request $request, CustomerSubscriptionExtension $extension): RedirectResponse
    {
        $validated = $request->validate([
            'days_extended' => 'required|integer|min:1|max:365',
            'reason' => 'nullable|string|max:1000',
            'extended_at' => 'nullable|date',
        ]);

        DB::transaction(function () use ($validated, $extension) {
            $subscription = $extension->customerSubscription;
            $oldDays = $extension->days_extended;
            $newDays = $validated['days_extended'];
            $daysDifference = $newDays - $oldDays;

            // Update extension
            $extension->update([
                'days_extended' => $newDays,
                'reason' => $validated['reason'] ?? $extension->reason,
                'extended_at' => $validated['extended_at'] ?? $extension->extended_at,
            ]);

            // Recalculate new_end_date
            $currentEndDate = $subscription->end_date;
            if ($currentEndDate) {
                // Get all other extensions before this one
                $previousExtensions = $subscription->extensions()
                    ->where('id', '!=', $extension->id)
                    ->where('extended_at', '<=', $extension->extended_at)
                    ->sum('days_extended');

                $newEndDate = $currentEndDate->copy()
                    ->addDays($subscription->suspended_days ?? 0)
                    ->addDays($previousExtensions)
                    ->addDays($newDays);

                $extension->update(['new_end_date' => $newEndDate]);
            }

            // Update subscription extended_days total
            if ($daysDifference > 0) {
                $subscription->increment('extended_days', $daysDifference);
            } elseif ($daysDifference < 0) {
                $subscription->decrement('extended_days', abs($daysDifference));
            }
        });

        return redirect()->back()
            ->with('status', 'success')
            ->with('message', 'Proroga modificata con successo');
    }

    /**
     * Remove the specified extension
     */
    public function destroy(CustomerSubscriptionExtension $extension): RedirectResponse
    {
        DB::transaction(function () use ($extension) {
            $subscription = $extension->customerSubscription;
            $daysExtended = $extension->days_extended;

            // Delete extension
            $extension->delete();

            // Update subscription extended_days total
            $subscription->decrement('extended_days', $daysExtended);
        });

        return redirect()->back()
            ->with('status', 'success')
            ->with('message', 'Proroga eliminata con successo');
    }
}
