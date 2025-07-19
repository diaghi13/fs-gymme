<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Http\Requests\Central\SubscriptionPlanRequest;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
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
        SubscriptionPlan::create($request->validated());

        return redirect()->route('central.subscription-plans.index')
            ->with('status', 'success')
            ->with('message', 'Subscription plan created successfully.');
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
        $subscriptionPlan->update($request->validated());

        return redirect()->route('central.subscription-plans.index')
            ->with('status', 'success')
            ->with('message', 'Subscription plan updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SubscriptionPlan $subscriptionPlan)
    {
        $subscriptionPlan->delete();

        return redirect()->route('central.subscription-plans.index')
            ->with('status', 'success')
            ->with('message', 'Subscription plan deleted successfully.');
    }
}
