<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class VerifyTenantAccess
{
    /**
     * Verify that the authenticated user has access to the requested tenant.
     *
     * This middleware runs BEFORE InitializeTenancyByPath to ensure it can
     * access the central database to check the tenant_user pivot table.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only check on tenant routes (routes with {tenant} parameter)
        $tenantId = $request->route('tenant');

        if (!$tenantId) {
            return $next($request);
        }

        // If user is not authenticated, let auth middleware handle it
        $user = $request->user();
        if (!$user) {
            return $next($request);
        }

        // Super-admin has access to all tenants
        if ($user->hasRole('super-admin')) {
            return $next($request);
        }

        // Check if user has access to this tenant via pivot table
        $hasAccess = DB::table('tenant_user')
            ->where('user_id', $user->id)
            ->where('tenant_id', $tenantId)
            ->exists();

        if (!$hasAccess) {
            abort(403, 'Non hai accesso a questo tenant.');
        }

        return $next($request);
    }
}
