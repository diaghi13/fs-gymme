<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        channels: __DIR__.'/../routes/channels.php',
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
                // \Stancl\Tenancy\Middleware\InitializeTenancyByRequestData::class,
                'auth',
                'tenant',
                'log',
            ])
                ->prefix('/app/{tenant}')
                ->group(base_path('routes/tenant/web/routes.php'));

            Route::middleware(['api', \Stancl\Tenancy\Middleware\InitializeTenancyByRequestData::class])
                ->prefix('/api/v1')
                ->group(base_path('routes/tenant/api/routes.php'));

            // Webhook routes (no auth, no tenant middleware)
            Route::middleware('api')
                ->prefix('/webhooks')
                ->group(base_path('routes/webhooks.php'));

            //        web: __DIR__.'/../routes/web.php',
            //        api: __DIR__.'/../routes/api.php',
            //        commands: __DIR__.'/../routes/console.php',
            //        health: '/up',
            //        apiPrefix: '/api/v1',
        })
    ->withMiddleware(function (Middleware $middleware) {
        // Add global middleware to serve static assets first - must be the very first middleware
        $middleware->use([
            \App\Http\Middleware\ServeStaticAssets::class,
        ]);

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state', 'current_structure_id']);

        $middleware->validateCsrfTokens(except: [
            'stripe/webhook',
        ]);

        $middleware->web(append: [
            HandleAppearance::class,
            AddLinkHeadersForPreloadedAssets::class,
            HandleInertiaRequests::class,
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
            \App\Http\Middleware\VerifyTenantAccess::class,  // Check access BEFORE tenant init
            \Stancl\Tenancy\Middleware\InitializeTenancyByPath::class,
            \App\Http\Middleware\SwitchToTenantUser::class,
            \App\Http\Middleware\EnsureUserIsInTenantMiddleware::class,
            \App\Http\Middleware\HasActiveSubscriptionPlan::class,
            \App\Http\Middleware\SetCurrentStructure::class,
        ]);

        $middleware->group('log', [
            \App\Http\Middleware\LogResourceView::class,
            \App\Http\Middleware\LogPageView::class,
        ]);
    })
    ->withSchedule(function (\Illuminate\Console\Scheduling\Schedule $schedule) {
        // Conservazione Sostitutiva - Esegui il 1° giorno del mese alle 02:00
        // Conserva fatture del mese precedente (obbligo normativo 10 anni)
        $schedule->command('preserve:electronic-invoices')
            ->monthlyOn(1, '02:00')
            ->timezone('Europe/Rome')
            ->withoutOverlapping()
            ->runInBackground()
            ->onSuccess(function () {
                \Log::info('Scheduled preservation completed successfully');
            })
            ->onFailure(function () {
                \Log::error('Scheduled preservation failed');
            });

        // Notify Expiring Demo Tenants - Esegui ogni giorno alle 09:00
        // Invia email di avviso ai tenant demo in scadenza (configurabile in config/demo.php)
        $schedule->command('demo:notify-expiring')
            ->dailyAt('09:00')
            ->timezone('Europe/Rome')
            ->withoutOverlapping()
            ->runInBackground()
            ->onSuccess(function () {
                \Log::info('Demo expiration notifications sent successfully');
            })
            ->onFailure(function () {
                \Log::error('Demo expiration notifications failed');
            });

        // Cleanup Demo Tenants - Esegui ogni giorno alle 02:30
        // Elimina tenant demo scaduti dopo il periodo di grace (configurabile in config/demo.php)
        $schedule->command('demo:cleanup --force')
            ->dailyAt('02:30')
            ->timezone('Europe/Rome')
            ->withoutOverlapping()
            ->runInBackground()
            ->onSuccess(function () {
                \Log::info('Demo tenants cleanup completed successfully');
            })
            ->onFailure(function () {
                \Log::error('Demo tenants cleanup failed');
            });
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
