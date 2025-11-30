<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class InitializeTenancyBySession
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenantId = null;

        // Get session ID from cookie
        $sessionName = config('session.cookie');
        $sessionCookie = $request->cookie($sessionName);

        \Log::info('TenantAssets Middleware', [
            'has_cookie' => ! is_null($sessionCookie),
            'path' => $request->path(),
        ]);

        if ($sessionCookie) {
            try {
                // Decrypt the session ID
                $sessionId = decrypt($sessionCookie);

                // Read session data from storage (Redis, file, etc.)
                $sessionDriver = config('session.driver');
                $sessionData = null;

                if ($sessionDriver === 'redis') {
                    // Get session data from Redis
                    $redis = \Illuminate\Support\Facades\Redis::connection(config('session.connection'));
                    $prefix = config('session.prefix', 'laravel_session:');
                    $rawData = $redis->get($prefix.$sessionId);

                    \Log::info('Redis session data', [
                        'session_id' => $sessionId,
                        'prefix' => $prefix,
                        'has_data' => ! is_null($rawData),
                    ]);

                    if ($rawData) {
                        $sessionData = unserialize($rawData);
                        \Log::info('Session data', ['keys' => array_keys($sessionData)]);
                    }
                } elseif ($sessionDriver === 'file') {
                    // Get session data from file
                    $filePath = config('session.files').'/'.basename($sessionId);
                    if (file_exists($filePath)) {
                        $rawData = file_get_contents($filePath);
                        $sessionData = unserialize($rawData);
                    }
                }

                // Get tenant ID from session data
                if ($sessionData && isset($sessionData['current_tenant_id'])) {
                    $tenantId = $sessionData['current_tenant_id'];
                    \Log::info('Found tenant ID', ['tenant_id' => $tenantId]);
                }
            } catch (\Exception $e) {
                // If decryption fails, continue without tenant
                \Log::error('Failed to read session for tenant assets', ['error' => $e->getMessage()]);
            }
        }

        if ($tenantId) {
            // Find and initialize tenant
            $tenant = Tenant::find($tenantId);

            if ($tenant) {
                tenancy()->initialize($tenant);
                \Log::info('Tenant initialized', ['tenant_id' => $tenant->id]);
            }
        } else {
            \Log::warning('No tenant ID found in session');
        }

        return $next($request);
    }
}
