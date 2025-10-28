<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        channels: __DIR__ . '/../routes/channels.php',
        then: function (Application $app) {

            $centralDomains = config('tenancy.central_domains');

            foreach ($centralDomains as $domain) {
                Route::middleware('web')
                    ->domain($domain)
                    ->group(base_path('routes/central/web/routes.php'));

                Route::middleware('api')
                    ->domain($domain)
                    ->prefix('api/v1')
                    ->group(base_path('routes/central/api/routes.php'));
            }

            Route::middleware([
                'web',
                //\Stancl\Tenancy\Middleware\InitializeTenancyByRequestData::class,
                'auth',
                'tenant',
                'log',
            ])
                ->prefix('/app/{tenant}')
                ->group(base_path('routes/tenant/web/routes.php'));

            Route::middleware(['api', \Stancl\Tenancy\Middleware\InitializeTenancyByRequestData::class])
                ->prefix('/api/v1')
                ->group(base_path('routes/tenant/api/routes.php'));

//        web: __DIR__.'/../routes/web.php',
//        api: __DIR__.'/../routes/api.php',
//        commands: __DIR__.'/../routes/console.php',
//        health: '/up',
//        apiPrefix: '/api/v1',
        })
//    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->statefulApi();

        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
            'log.view' => \App\Http\Middleware\LogResourceView::class,
            'log.page' => \App\Http\Middleware\LogPageView::class,
        ]);

        $middleware->group('tenant', [
            \App\Http\Middleware\EnsureTenantSet::class,
            \Stancl\Tenancy\Middleware\InitializeTenancyByPath::class,
            \App\Http\Middleware\EnsureUserIsInTenantMiddleware::class,
            \App\Http\Middleware\HasActiveSubscriptionPlan::class,
        ]);

        $middleware->group('log', [
            \App\Http\Middleware\LogResourceView::class,
            \App\Http\Middleware\LogPageView::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
