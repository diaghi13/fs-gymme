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
        // Register Observers
        \App\Models\Customer\Customer::observe(\App\Observers\Customer\CustomerObserver::class);

        // Register Event Listeners
        \Illuminate\Support\Facades\Event::listen(
            \App\Events\Customer\CustomerCreated::class,
            \App\Listeners\SendWelcomeEmail::class
        );

        // Super admin and owner bypass
        Gate::before(function ($user, $ability) {
            // Debug logging
            \Log::debug('Gate::before called', [
                'user_class' => get_class($user),
                'user_email' => $user->email ?? 'N/A',
                'ability' => $ability,
            ]);

            // Central DB super admin (for debugging and system management)
            if ($user instanceof \App\Models\CentralUser) {
                $result = $user->hasRole('super-admin') ? true : null;
                \Log::debug('CentralUser check', ['has_super_admin' => $result]);

                return $result;
            }

            // Tenant users checks
            if ($user instanceof \App\Models\User) {
                // Super admin can access all tenants (for debugging and testing)
                // IMPORTANT: Only add your own email here for development/debugging
                if ($user->email === 'davide.d.donghi@gmail.com') {
                    \Log::debug('Super admin email match - granting full access');

                    return true;
                }

                // Owner has full access within their tenant
                if ($user->isOwner()) {
                    \Log::debug('Owner role detected - granting full access');

                    return true;
                }
            }

            \Log::debug('Gate::before returning null - checking policies');

            return null;
        });

        // Register Policies explicitly
        Gate::policy(\App\Models\User::class, \App\Policies\UserPolicy::class);
        Gate::policy(\App\Models\Customer\Customer::class, \App\Policies\CustomerPolicy::class);
        Gate::policy(\App\Models\Sale\Sale::class, \App\Policies\SalePolicy::class);

        Cashier::useCustomerModel(Tenant::class);

        // Force asset URLs to be absolute from root for multi-tenant routing
        $appUrl = rtrim(config('app.url'), '/');

        \Illuminate\Support\Facades\URL::forceRootUrl($appUrl);
        \Illuminate\Support\Facades\URL::forceScheme(parse_url($appUrl, PHP_URL_SCHEME) ?: 'http');

        // Configure Vite to use absolute asset URLs
        \Illuminate\Support\Facades\Vite::useScriptTagAttributes(function (?string $src, string $url, ?array $chunk, ?array $manifest) {
            return [
                'type' => 'module',
                'crossorigin' => true,
            ];
        });

        \Illuminate\Support\Facades\Vite::useStyleTagAttributes(function (?string $src, string $url, ?array $chunk, ?array $manifest) {
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
