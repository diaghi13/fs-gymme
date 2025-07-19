<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForgetTenantMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->session()->has('current_tenant_id')) {
            // Clear the tenant session data
            $request->session()->forget('current_tenant_id');

            // Optionally, you can also clear the tenant from the application context if needed
            // app()->forgetInstance('tenant');
        }

        return $next($request);
    }
}
