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
        if (!$request->user()->hasRole('super-admin') && !$request->user()->company->active_subscription_plan) {
//            return response()->json([
//                'message' => 'You need an active subscription plan to access this resource.',
//            ], 403);
            return redirect()->route('app.subscription-plans.index', ['tenant' => $request->user()->company->id])
                ->with('error', 'You need an active subscription plan to access this resource.');
        }

        return $next($request);
    }
}
