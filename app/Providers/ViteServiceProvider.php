<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class ViteServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Force absolute URLs for assets in multi-tenant environment
        // This ensures that assets are loaded from the root path, not relative to tenant routes
        Vite::useScriptTagAttributes([
            'data-navigate-track' => 'reload',
        ]);

        Vite::useStyleTagAttributes([
            'data-navigate-track' => 'reload',
        ]);

        // Ensure build directory is correctly set
        Vite::useBuildDirectory('build');

        // Use prefetching to improve performance
        Vite::prefetch(concurrency: 3);
    }
}
