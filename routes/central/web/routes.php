<?php

use App\Models\Tenant;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $user = auth()->user();
    $dashboardRoute = null;

    if ($user) {
        // Determine dashboard route based on user type
        if ($user->hasRole('super-admin')) {
            $dashboardRoute = route('central.dashboard');
        } else {
            // Get user's first tenant for redirect
            $tenant = $user->tenants()->first();
            if ($tenant) {
                $dashboardRoute = route('central.redirectToApp', ['tenant' => $tenant->id]);
            }
        }
    }

    return Inertia::render('users/landing-new', [
        'auth' => [
            'user' => $user?->only(['id', 'first_name', 'last_name', 'email']),
        ],
        'dashboardRoute' => $dashboardRoute,
    ]);
})->name('home');

// Stripe Webhooks (must be outside middleware to avoid CSRF protection)
Route::post('stripe/webhook', [\App\Http\Controllers\Central\WebhookController::class, 'handleWebhook']);

// Tenant Registration (public)
Route::middleware('guest')->group(function () {
    Route::get('register-tenant', [\App\Http\Controllers\Central\TenantRegistrationController::class, 'create'])
        ->name('tenant.register');

    Route::post('register-tenant', [\App\Http\Controllers\Central\TenantRegistrationController::class, 'store'])
        ->name('tenant.register.store');

    Route::get('check-tenant-email/{email}', [\App\Http\Controllers\Central\TenantRegistrationController::class, 'checkEmail'])
        ->name('tenant.check-email');

    Route::get('check-tenant-slug/{slug}', [\App\Http\Controllers\Central\TenantRegistrationController::class, 'checkSlug'])
        ->name('tenant.check-slug');
});

Route::middleware([
    'auth',
    'verified',
    'role:super-admin',
    \App\Http\Middleware\ForgetTenantMiddleware::class,
])->group(function () {
    Route::get('dashboard', \App\Http\Controllers\Central\Dashboard::class)
        ->name('central.dashboard');

    Route::resource('tenants', \App\Http\Controllers\Central\TenantController::class)
        ->only(['index', 'create', 'store', 'edit', 'update'])
        ->names('central.tenants');

    Route::resource('users', \App\Http\Controllers\Central\UserController::class)
        ->only(['index', 'create', 'store', 'edit', 'update'])
        ->names('central.users');

    Route::get('tenants/{tenant}/redirect', \App\Http\Controllers\Central\RedirectToAppController::class)
        ->name('central.redirectToApp');

    Route::resource('subscription-plans', \App\Http\Controllers\Central\SubscriptionPlanController::class)
        ->names('central.subscription-plans');

    Route::resource('plan-features', \App\Http\Controllers\Central\PlanFeatureController::class)
        ->names('central.plan-features');

    // Subscription Payments Management
    Route::prefix('subscription-payments')->name('central.subscription-payments.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Central\SubscriptionPaymentController::class, 'index'])
            ->name('index');
        Route::post('{subscriptionId}/confirm', [\App\Http\Controllers\Central\SubscriptionPaymentController::class, 'confirm'])
            ->name('confirm');
        Route::post('{subscriptionId}/reject', [\App\Http\Controllers\Central\SubscriptionPaymentController::class, 'reject'])
            ->name('reject');
    });

    Route::get('centrals/redirect', \App\Http\Controllers\Central\RedirectToCentralController::class)
        ->name('central.redirectToCentral');
});

Route::middleware(['verified'])->group(function () {
    Route::get('profile', function () {
        $user = auth()->user();

        // Passa solo i dati essenziali per evitare memory leak
        return Inertia::render('Profile', [
            'user' => $user?->only(['id', 'name', 'email']),
        ]);
    })->name('central.profile');
});

require __DIR__.'/auth.php';
