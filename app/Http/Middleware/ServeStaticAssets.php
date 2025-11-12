<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class ServeStaticAssets
{
    /**
     * Handle an incoming request.
     *
     * Intercepts requests to /build/ assets and serves them directly,
     * bypassing all routing and tenancy logic.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $path = $request->path();

        // Check if the request is for a build asset
        // Handle /tenancy/.../build/..., /app/{tenant}/build/..., or just /build/...
        if (preg_match('#(?:tenancy|app/[^/]+)/.*?build/(.+)$#', $path, $matches) ||
            preg_match('#^build/(.+)$#', $path, $matches)) {

            $assetPath = public_path('build/'.$matches[1]);

            if (file_exists($assetPath) && is_file($assetPath)) {
                return new BinaryFileResponse($assetPath);
            }
        }

        $response = $next($request);

        // Post-process HTML responses to fix asset URLs
        if ($response instanceof \Illuminate\Http\Response &&
            str_contains($response->headers->get('Content-Type', ''), 'text/html')) {

            $content = $response->getContent();

            if ($content) {
                // Fix any /tenancy/assets/build/ or /app/{tenant}/build/ to /build/
                $content = preg_replace(
                    '#(["\'])(?:/tenancy(?:/assets)?|/app/[^/]+)(/build/[^"\']+)#',
                    '$1$2',
                    $content
                );

                $response->setContent($content);
            }
        }

        return $response;
    }
}
