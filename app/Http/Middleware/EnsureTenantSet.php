<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantSet
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check() && ! $request->session()->has('current_tenant_id')) {
            $user = Auth::user();

            if ($user->hasRole('super-admin') && $user->tenants->isEmpty()) {
                $tenantId = $request->route()->originalParameter('tenant');

                if ($tenantId) {
                    $request->session()->put('current_tenant_id', $tenantId);
                }
            }

            if ($user->tenants && $user->tenants->count() > 0) {
                $request->session()->put('current_tenant_id', $user->tenants->first()->id);
            }
        }

        return $next($request);
    }
}
