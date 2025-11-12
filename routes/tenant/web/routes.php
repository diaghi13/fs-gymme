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

    // Sales API endpoints for real-time calculations
    Route::post('sales/quick-calculate', [\App\Http\Controllers\Application\Sales\SaleController::class, 'quickCalculate'])
        ->name('app.sales.quick-calculate');

    Route::post('sales/calculate-installments', [\App\Http\Controllers\Application\Sales\SaleController::class, 'calculateInstallments'])
        ->name('app.sales.calculate-installments');

    Route::post('sales/subscription-contents', [\App\Http\Controllers\Application\Sales\SaleController::class, 'getSubscriptionContents'])
        ->name('app.sales.subscription-contents');

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

        Route::post('/generate-credit-note', \App\Http\Controllers\Application\Sales\ElectronicInvoice\GenerateCreditNoteController::class)
            ->name('app.sales.electronic-invoice.generate-credit-note');
    });

    // Debug route (temporary - remove in production)
    Route::get('sales/{sale}/debug-status', \App\Http\Controllers\Application\Sales\DebugSaleStatusController::class)
        ->name('app.sales.debug-status');

    Route::get('subscription-plan', \App\Http\Controllers\Application\SubscriptionPlanChoiceController::class)
        ->withoutMiddleware(\App\Http\Middleware\HasActiveSubscriptionPlan::class)
        ->name('app.subscription-plans.index');

    Route::get('subscription-plan-payment/{subscriptionPlan}', \App\Http\Controllers\Application\SubscriptionPlanPaymentController::class)
        ->withoutMiddleware(\App\Http\Middleware\HasActiveSubscriptionPlan::class)
        ->name('app.subscription-plans.payment');

    Route::get('subscription/status', \App\Http\Controllers\Application\SubscriptionStatusController::class)
        ->name('app.subscription.status');

    // Structure Management
    Route::get('structures/switch/{structure}', [\App\Http\Controllers\Tenant\StructureController::class, 'switch'])
        ->name('app.structures.switch');
});

require __DIR__.'/products.php';
require __DIR__.'/price-lists.php';
require __DIR__.'/configurations.php';
require __DIR__.'/settings.php';
require __DIR__.'/customers.php';
