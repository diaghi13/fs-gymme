<?php

namespace App\Http\Controllers\Application;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubscriptionPlanChoiceController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $plans = tenancy()->central(function () {
            return SubscriptionPlan::where('is_active', true)
                ->orderBy('price', 'asc')
                ->get();
        });

        return Inertia::render('subscription-plan-choice', [
            'tenant' => $request->user()->company,
            'plans' => $plans,
        ]);
    }
}
