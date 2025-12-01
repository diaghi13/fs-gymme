<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Tenant Routes
|--------------------------------------------------------------------------
|
| Here you can register the tenant routes for your application.
| These routes are loaded by the TenantRouteServiceProvider.
|
| Feel free to customize them however you want. Good luck!
|
*/

Route::middleware([])->group(function () {

    // Storage - serve files from tenant's public storage
    Route::get('storage/{path}', [\App\Http\Controllers\Application\StorageController::class, 'show'])
        ->where('path', '.*')
        ->name('app.storage');

    // Onboarding
    Route::post('onboarding/complete', [\App\Http\Controllers\Tenant\OnboardingController::class, 'complete'])
        ->name('app.onboarding.complete');

    Route::get('dashboard', \App\Http\Controllers\Application\DashboardController::class)
        ->name('app.dashboard');

    Route::resource('sales', \App\Http\Controllers\Application\Sales\SaleController::class)
        ->names([
            'index' => 'app.sales.index',
            'create' => 'app.sales.create',
            'store' => 'app.sales.store',
            'show' => 'app.sales.show',
            'edit' => 'app.sales.edit',
            'update' => 'app.sales.update',
            'destroy' => 'app.sales.destroy',
        ]);

    Route::get('sales/{sale}/export-xml', \App\Http\Controllers\Application\Sales\ExportXml::class)
        ->name('app.sales.export-xml');

    Route::post('sales/{sale}/credit-note', \App\Http\Controllers\Application\Sales\CreditNoteController::class)
        ->name('app.sales.credit-note');

    // Sales API endpoints for real-time calculations
    Route::post('sales/quick-calculate', [\App\Http\Controllers\Application\Sales\SaleController::class, 'quickCalculate'])
        ->name('app.sales.quick-calculate');

    Route::post('sales/calculate-installments', [\App\Http\Controllers\Application\Sales\SaleController::class, 'calculateInstallments'])
        ->name('app.sales.calculate-installments');

    Route::post('sales/subscription-contents', [\App\Http\Controllers\Application\Sales\SaleController::class, 'getSubscriptionContents'])
        ->name('app.sales.subscription-contents');

    // Renewal routes - prepare sales for renewals
    Route::get('renewal/membership-fee/{membershipFee}', [\App\Http\Controllers\Application\Sales\RenewalController::class, 'renewMembershipFee'])
        ->name('app.renewal.membership-fee');

    Route::get('renewal/subscription/{subscription}', [\App\Http\Controllers\Application\Sales\RenewalController::class, 'renewSubscription'])
        ->name('app.renewal.subscription');

    // Electronic Invoice routes
    Route::prefix('sales/{sale}/electronic-invoice')->group(function () {
        Route::post('/generate', \App\Http\Controllers\Application\Sales\ElectronicInvoice\GenerateController::class)
            ->name('app.sales.electronic-invoice.generate');

        Route::post('/send', \App\Http\Controllers\Application\Sales\ElectronicInvoice\SendController::class)
            ->name('app.sales.electronic-invoice.send');

        Route::get('/download-xml', \App\Http\Controllers\Application\Sales\ElectronicInvoice\DownloadXmlController::class)
            ->name('app.sales.electronic-invoice.download-xml');

        Route::get('/download-pdf', \App\Http\Controllers\Application\Sales\ElectronicInvoice\DownloadPdfController::class)
            ->name('app.sales.electronic-invoice.download-pdf');

        Route::post('/generate-credit-note', \App\Http\Controllers\Application\Sales\CreditNoteController::class)
            ->name('app.sales.electronic-invoice.generate-credit-note');
    });

    // Electronic Invoice Preservation routes
    Route::prefix('electronic-invoices')->name('app.electronic-invoices.')->group(function () {
        Route::get('/preservation', function () {
            $service = app(\App\Services\Sale\ElectronicInvoicePreservationService::class);
            $stats = $service->getStatistics();

            return \Inertia\Inertia::render('electronic-invoice/preservation', [
                'stats' => $stats,
            ]);
        })->name('preservation');

        Route::get('/preservation/stats', [\App\Http\Controllers\Application\ElectronicInvoice\PreservationController::class, 'stats'])
            ->name('preservation.stats');

        Route::get('/preservation/export', [\App\Http\Controllers\Application\ElectronicInvoice\PreservationController::class, 'export'])
            ->name('export-preservation');

        Route::post('/preservation/run', [\App\Http\Controllers\Application\ElectronicInvoice\PreservationController::class, 'runManual'])
            ->name('run-preservation');
    });

    // Debug route (temporary - remove in production)
    Route::get('sales/{sale}/debug-status', \App\Http\Controllers\Application\Sales\DebugSaleStatusController::class)
        ->name('app.sales.debug-status');

    Route::get('subscription-plan', \App\Http\Controllers\Application\SubscriptionPlanChoiceController::class)
        // ->withoutMiddleware(\App\Http\Middleware\HasActiveSubscriptionPlan::class)
        ->name('app.subscription-plans.index');

    Route::get('subscription-plan-payment/{subscriptionPlan}', \App\Http\Controllers\Application\SubscriptionPlanPaymentController::class)
        ->withoutMiddleware(\App\Http\Middleware\HasActiveSubscriptionPlan::class)
        ->name('app.subscription-plans.payment');

    Route::get('subscription/status', \App\Http\Controllers\Application\SubscriptionStatusController::class)
        ->name('app.subscription.status');

    // Subscription Addons Management
    Route::prefix('subscription/addons')->name('app.addons.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Application\TenantAddonController::class, 'index'])
            ->name('index');
        Route::post('/', [\App\Http\Controllers\Application\TenantAddonController::class, 'store'])
            ->name('store');
        Route::delete('{addon}', [\App\Http\Controllers\Application\TenantAddonController::class, 'destroy'])
            ->name('destroy');
        Route::post('{addon}/upgrade', [\App\Http\Controllers\Application\TenantAddonController::class, 'upgrade'])
            ->name('upgrade');
    });

    // Structure Management
    Route::get('structures/switch/{structure}', [\App\Http\Controllers\Tenant\StructureController::class, 'switch'])
        ->name('app.structures.switch');
});

require __DIR__.'/products.php';
require __DIR__.'/price-lists.php';
require __DIR__.'/configurations.php';
require __DIR__.'/settings.php';
require __DIR__.'/customers.php';
require __DIR__.'/users.php';
