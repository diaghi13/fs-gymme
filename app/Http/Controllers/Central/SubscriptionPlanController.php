<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Http\Requests\Central\SubscriptionPlanRequest;
use App\Models\SubscriptionPlan;
use Inertia\Inertia;

class SubscriptionPlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('central/subscription-plans/index', [
            'subscriptionPlans' => SubscriptionPlan::all(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('central/subscription-plans/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SubscriptionPlanRequest $request)
    {
        $data = $request->validated();

        // Auto-generate slug if not provided or empty
        if (empty($data['slug'])) {
            $data['slug'] = \Str::slug($data['name']);
        }

        SubscriptionPlan::create($data);

        return redirect()->route('central.subscription-plans.index')
            ->with('status', 'success')
            ->with('message', 'Piano di abbonamento creato con successo.');
    }

    /**
     * Display the specified resource.
     */
    public function show(SubscriptionPlan $subscriptionPlan)
    {
        return Inertia::render('central/subscription-plans/show', [
            'subscriptionPlan' => $subscriptionPlan,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(SubscriptionPlan $subscriptionPlan)
    {
        return Inertia::render('central/subscription-plans/edit', [
            'subscriptionPlan' => $subscriptionPlan,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SubscriptionPlanRequest $request, SubscriptionPlan $subscriptionPlan)
    {
        $data = $request->validated();

        // Auto-generate slug if not provided or empty
        if (empty($data['slug'])) {
            $data['slug'] = \Str::slug($data['name']);
        }

        $subscriptionPlan->update($data);

        return redirect()->route('central.subscription-plans.index')
            ->with('status', 'success')
            ->with('message', 'Piano di abbonamento aggiornato con successo.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SubscriptionPlan $subscriptionPlan)
    {
        $subscriptionPlan->delete();

        return redirect()->route('central.subscription-plans.index')
            ->with('status', 'success')
            ->with('message', 'Piano di abbonamento eliminato con successo.');
    }
}
