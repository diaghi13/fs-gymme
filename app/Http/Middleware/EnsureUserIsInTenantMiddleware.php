<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsInTenantMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response) $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (!$user) {
            abort(403, 'Non autorizzato per questo tenant.');
        }

        // If tenancy is initialized, the tenant access check has already been done
        // by SwitchToTenantUser middleware which runs before this one
        if (tenancy()->initialized) {
            return $next($request);
        }

        // For central routes, check if user has access to the requested tenant
        $tenantId = $request->session()->get('current_tenant_id');

        // Skip check for super-admin
        if ($user->roles->pluck('name')->contains('super-admin')) {
            return $next($request);
        }

        // Check tenant access via pivot table
        if ($tenantId && !$user->tenants->contains('id', $tenantId)) {
            abort(403, 'Non autorizzato per questo tenant.');
        }

        return $next($request);
    }
}
