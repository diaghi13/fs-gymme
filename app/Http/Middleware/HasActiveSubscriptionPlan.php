<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HasActiveSubscriptionPlan
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user->email === 'davide.d.donghi@gmail.com') {
            return $next($request);
        }

        // Skip check for super-admin
        if ($user->hasRole('super-admin')) {
            return $next($request);
        }

        // Check tenant subscription status
        if (tenancy()->initialized) {
            $tenant = tenancy()->tenant;

            // Check if tenant has active subscription or trial
            if (!$tenant->trial_ends_at && !$tenant->subscribed('default')) {
                return redirect()->route('app.subscription-plans.index', ['tenant' => $tenant->id])
                    ->with('error', 'You need an active subscription plan to access this resource.');
            }

            // Check if trial has expired
            if ($tenant->trial_ends_at && now()->isAfter($tenant->trial_ends_at) && !$tenant->subscribed('default')) {
                return redirect()->route('app.subscription-plans.index', ['tenant' => $tenant->id])
                    ->with('error', 'Your trial has expired. Please subscribe to continue.');
            }

            return $next($request);
        }

        // For central routes, check company subscription
        if ($user->company && !$user->company->active_subscription_plan) {
            return redirect()->route('app.subscription-plans.index', ['tenant' => $user->company->id])
                ->with('error', 'You need an active subscription plan to access this resource.');
        }

        return $next($request);
    }
}
