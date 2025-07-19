<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class LogResourceView
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $user = Auth::user();

        if (Auth::check() && Auth::user()->hasRole('super-admin')) {
            return $next($request);
        }

        // Deve essere usato su route tipo /users/{user} o /progetti/{progetto}
        //tenancy()->central(function () use ($request, $user) {
            $routeParameters = $request->route()?->parameters();

            foreach ($routeParameters as $param) {
                if (is_object($param) && method_exists($param, 'getKey')) {
                    activity()
                        ->causedBy($user)
                        ->performedOn($param)
                        ->withProperties([
                            'ip' => $request->ip(),
                            'user_agent' => $request->header('User-Agent'),
                        ])
                        ->log('Visualizzazione risorsa: ' . class_basename($param));
                }
            }
        //});

        return $response;
    }
}
