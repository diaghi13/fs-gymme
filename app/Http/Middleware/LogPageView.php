<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class LogPageView
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (!Auth::check() || !$request->isMethod('get')) {
            return $response; // Solo GET e solo utenti loggati
        }

        // Escludi alcune rotte (opzionale)
        $excludedPaths = [
            'api/*',
            'admin/logs',
            'notifications/poll',
        ];

        foreach ($excludedPaths as $excluded) {
            if ($request->is($excluded)) {
                return $response;
            }
        }

        $user = Auth::user();

        if ($user->hasRole('super-admin')) {
            return $response;
        }

        //tenancy()->central(function () use ($request, $user) {
            $routeName = $request->route()?->getName();
            $uri = $request->path();
            $routeParams = $request->route()?->parameters();

            $log = activity()
                ->causedBy($user)
                ->withProperties([
                    'uri' => $uri,
                    'route_name' => $routeName,
                    'ip' => $request->ip(),
                    'user_agent' => $request->header('User-Agent'),
                ]);

            // Se ci sono parametri modello Eloquent (es. user, post, ecc.)
            foreach ($routeParams as $param) {
                if (is_object($param) && method_exists($param, 'getKey')) {
                    $log->performedOn($param);
                }
            }

            $log->log("Pagina visitata: " . ($routeName ?: $uri));
        //});

        return $response;
    }
}
