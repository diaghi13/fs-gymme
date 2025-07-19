<?php

namespace App\Http\Controllers\Central\SubscriptionPlan;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Laravel\Cashier\Exceptions\IncompletePayment;

class SubscribeController extends Controller
{
    public function subscribe(Request $request)
    {
        $request->validate([
            'payment_method' => 'required|string',
            'plan_id' => 'required|string', // questo è lo Stripe price_id
        ]);

        $plan = tenancy()->central(function () use ($request) {
            return \App\Models\SubscriptionPlan::query()
                ->where('stripe_price_id', $request->input('plan_id'))
                ->get()
                ->first();
        });

        if (!$plan->is_active) {
            return response()->json(['error' => 'The selected subscription plan is not active.'], 400);
        }

        // Here you would handle the subscription logic, e.g., creating a subscription record
        // and processing the payment.

        $tenant = tenancy()->find($request->input('tenant'));

        try {
            $subscription = $tenant->newSubscription('default', $request->plan_id)
                ->trialDays($plan->trial_days ?? null) // Imposta i giorni di prova se disponibili
                ->trialUntil($plan->trial_days ? Carbon::now()->addDays($plan->trial_days) : null) // Imposta la data di fine prova
                ->create($request->payment_method);

            // Associa il piano di abbonamento al tenant
            $endDate = $plan->interval === 'monthly' ? Carbon::now()->addMonth() : Carbon::now()->addYear();

            $plan->trial_days ? $endDate->addDays($plan->trial_days) : $endDate;

            $tenant->subscription_planes()->attach($plan->id, [
                'starts_at' => Carbon::now(),
                'ends_at' => $endDate,
                'is_active' => true,
                'is_trial' => false,
                'trial_ends_at' => $plan->trial_days ? Carbon::now()->addDays($plan->trial_days) : null,
                'status' => 'active',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Subscription created successfully.',
                'subscription' => $subscription
            ]);

        } catch (IncompletePayment $exception) {
            // Se 3D Secure è richiesto
            return response()->json([
                'success' => false,
                'requires_action' => true,
                'payment_intent_client_secret' => $exception->payment->client_secret,
                'message' => 'Payment requires additional authentication.'
            ]);
        } catch (\Exception $e) {
            // Errore generico
            return response()->json([
                'success' => false,
                'message' => 'Unable to create subscription: ' . $e->getMessage()
            ], 500);
        }
    }
}
