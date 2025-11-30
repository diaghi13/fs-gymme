<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class FixAssetPaths
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only process HTML responses
        if ($response->headers->get('Content-Type') &&
            str_contains($response->headers->get('Content-Type'), 'text/html')) {

            $content = $response->getContent();

            if ($content) {
                // Fix /app/{tenant}/build/ paths to /build/
                $tenant = $request->route('tenant');
                if ($tenant) {
                    $content = str_replace('/app/'.$tenant.'/build/', '/build/', $content);
                }

                // Also fix any relative build/ paths to absolute /build/
                $content = preg_replace(
                    '/(href|src)="(?!http|\/\/|\/build)([^"]*build\/[^"]*)"/',
                    '$1="/build/$2"',
                    $content
                );

                $response->setContent($content);
            }
        }

        return $response;
    }
}
