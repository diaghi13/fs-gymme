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
        $tenantId = $request->session()->get('current_tenant_id');

        if (!$user || !$user->roles->pluck('name')->contains('super-admin') && (!$tenantId || !$user->tenants->contains('id', $tenantId))) {
            abort(403, 'Non autorizzato per questo tenant.');
        }

        return $next($request);
    }
}
