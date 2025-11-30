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

        // Check if request contains build/assets but with wrong prefix
        // Examples: /app/{tenant}/build/assets/..., /tenant{uuid}/build/assets/...
        if (preg_match('#^(.+?)/build/(.+)$#', $path, $matches)) {
            $prefix = $matches[1]; // e.g. "app/tenant-id" or "tenant60876..."
            $assetPath = $matches[2]; // e.g. "assets/app.js"

            // If there's a prefix before /build/, redirect to the correct path
            if (! empty($prefix)) {
                return redirect('/build/'.$assetPath, 301);
            }
        }

        // Serve assets directly if requested at correct path
        if (preg_match('#^build/(.+)$#', $path, $matches)) {
            $assetPath = public_path('build/'.$matches[1]);

            if (is_file($assetPath)) {
                return new BinaryFileResponse($assetPath);
            }
        }

        $response = $next($request);

        // Post-process HTML responses to fix asset URLs
        if ($response instanceof \Illuminate\Http\Response &&
            str_contains($response->headers->get('Content-Type', ''), 'text/html')) {

            $content = $response->getContent();

            if ($content) {
                // Force any src/href with prefixed build/ to use absolute /build/
                $content = preg_replace(
                    '#((?:src|href)=["\'])[^"\']*?/build/#',
                    '$1/build/',
                    $content
                );

                $response->setContent($content);
            }
        }

        return $response;
    }
}
