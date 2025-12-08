<?php

namespace App\Http\Middleware;

use App\Enums\CentralRoleType;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SwitchToTenantUser
{
    /**
     * Handle an incoming request.
     *
     * After tenancy is initialized, this middleware switches the authenticated user
     * from the central database user to the tenant database user (synced via ResourceSyncing).
     *
     * This ensures that $request->user() and auth()->user() return the correct tenant user
     * with tenant-specific roles and permissions.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()->hasRole(CentralRoleType::SUPER_ADMIN->value)) {
            // Super Admins retain their central user context across tenants
            return $next($request);
        }

        // If tenancy is initialized and user is authenticated
        if (tenancy()->initialized && $request->user()) {
            $centralUser = $request->user();

            // Get the synced user from tenant database using global_id
            if ($centralUser->global_id) {
                $tenantUser = \App\Models\User::where('global_id', $centralUser->global_id)->first();

                if ($tenantUser) {
                    // Replace the authenticated user with tenant user
                    auth()->setUser($tenantUser);
                    $request->setUserResolver(fn () => $tenantUser);
                } else {
                    // User has access to tenant but is not synced yet
                    // This shouldn't happen if ResourceSyncing is properly configured
                    abort(403, 'Utente non sincronizzato in questo tenant.');
                }
            }
        }

        return $next($request);
    }
}
