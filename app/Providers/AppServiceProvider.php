<?php

namespace App\Providers;

use App\Models\Tenant;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\ServiceProvider;
use Laravel\Cashier\Cashier;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::before(function ($user, $ability) {
            return $user->hasRole('super-admin') ? true : null;
        });

        Cashier::useCustomerModel(Tenant::class);

        // Force asset URLs to be absolute from root for multi-tenant routing
        $appUrl = config('app.url');

        \Illuminate\Support\Facades\URL::forceRootUrl($appUrl);
        \Illuminate\Support\Facades\URL::forceScheme(parse_url($appUrl, PHP_URL_SCHEME) ?: 'http');

        // Configure Vite to use absolute asset URLs
        \Illuminate\Support\Facades\Vite::useScriptTagAttributes(function (string $src, string $url, ?array $chunk, ?array $manifest) {
            return [
                'type' => 'module',
                'crossorigin' => true,
            ];
        });

        \Illuminate\Support\Facades\Vite::useStyleTagAttributes(function (string $src, string $url, ?array $chunk, ?array $manifest) {
            return [];
        });

        // Ensure all asset URLs are absolute
        \Illuminate\Support\Facades\Vite::macro('assetUrl', function ($asset) use ($appUrl) {
            return $appUrl.'/'.ltrim($asset, '/');
        });

        Validator::extend('numeric_or_array', function ($attribute, $value, $parameters, $validator) {
            return is_array($value) || is_numeric($value);
        });
    }
}
