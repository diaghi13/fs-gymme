<?php

namespace App\Http\Controllers\Application\Customers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\CustomerSubscriptionStoreRequest;
use App\Http\Requests\Customer\CustomerSubscriptionUpdateRequest;
use App\Models\Customer\Customer;
use App\Models\Customer\CustomerSubscription;
use App\Models\PriceList\PriceList;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CustomerSubscriptionController extends Controller
{
    public function index(Request $request, Customer $customer)
    {
        $status = $request->query('status', 'all');

        $query = $customer->subscriptions()
            ->with(['price_list', 'entity', 'sale_row', 'suspensions', 'extensions']);

        // Filter by status
        switch ($status) {
            case 'active':
                $query->active();
                break;
            case 'expired':
                $query->where('end_date', '<', now('Europe/Rome'));
                break;
            case 'future':
                $query->where('start_date', '>', now('Europe/Rome'));
                break;
            default:
                // 'all' - no filter
                break;
        }

        $subscriptions = $query->orderBy('start_date', 'desc')->get();

        return response()->json([
            'subscriptions' => $subscriptions,
        ]);
    }

    public function store(CustomerSubscriptionStoreRequest $request, Customer $customer)
    {
        $data = $request->validated();
        $data['customer_id'] = $customer->id;

        // Se l'abbonamento è manuale, non ha sale_row_id
        if (! isset($data['sale_row_id'])) {
            $data['sale_row_id'] = null;
        }

        $subscription = CustomerSubscription::create($data);

        activity()
            ->performedOn($subscription)
            ->causedBy(auth()->user())
            ->withProperties([
                'reason' => $data['reason'] ?? 'Abbonamento creato manualmente',
            ])
            ->log('Abbonamento creato manualmente');

        // Return JSON for API requests, redirect for web requests
        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Abbonamento creato con successo.',
                'subscription' => $subscription->load(['price_list', 'entity', 'suspensions', 'extensions']),
            ], 201);
        }

        return redirect()->back()
            ->with('status', 'success')
            ->with('message', 'Abbonamento creato con successo.');
    }

    public function update(CustomerSubscriptionUpdateRequest $request, CustomerSubscription $subscription)
    {
        $oldAttributes = $subscription->toArray();

        $subscription->update($request->validated());

        activity()
            ->performedOn($subscription)
            ->causedBy(auth()->user())
            ->withProperties([
                'old' => $oldAttributes,
                'new' => $subscription->fresh()->toArray(),
                'reason' => $request->input('reason') ?? 'Abbonamento modificato',
            ])
            ->log('Abbonamento modificato');

        // Return JSON for API requests, redirect for web requests
        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Abbonamento aggiornato con successo.',
                'subscription' => $subscription->fresh()->load(['price_list', 'entity', 'suspensions', 'extensions']),
            ]);
        }

        return redirect()->back()
            ->with('status', 'success')
            ->with('message', 'Abbonamento aggiornato con successo.');
    }

    public function destroy(Request $request, CustomerSubscription $subscription)
    {
        $subscriptionData = $subscription->toArray();

        activity()
            ->performedOn($subscription)
            ->causedBy(auth()->user())
            ->withProperties([
                'subscription' => $subscriptionData,
                'reason' => $request->input('reason') ?? 'Abbonamento eliminato',
            ])
            ->log('Abbonamento eliminato');

        $subscription->delete();

        return response()->json([
            'message' => 'Abbonamento eliminato con successo.',
        ]);
    }

    public function history(CustomerSubscription $subscription)
    {
        $activities = activity()
            ->forSubject($subscription)
            ->with('causer')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'description' => $activity->description,
                    'causer' => $activity->causer ? [
                        'id' => $activity->causer->id,
                        'name' => $activity->causer->name,
                    ] : null,
                    'properties' => $activity->properties,
                    'created_at' => $activity->created_at,
                ];
            });

        return response()->json([
            'activities' => $activities,
        ]);
    }

    public function getAvailablePriceLists()
    {
        $priceLists = PriceList::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn ($pl) => [
                'id' => $pl->id,
                'name' => $pl->name,
                'price' => $pl->price,
                'entrances' => $pl->entrances,
                'days_duration' => $pl->days_duration,
                'months_duration' => $pl->months_duration,
            ]);

        return response()->json([
            'price_lists' => $priceLists,
        ]);
    }
}
