<?php

use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth'])->prefix('/configurations')->group(function () {

    Route::get('/', function (\Illuminate\Http\Request $request) {
        $currentTenantId = $request->session()->get('current_tenant_id');

        return redirect()->route('app.configurations.company', [
            'tenant' => $currentTenantId,
        ]);
    })->name('app.configurations.index');

    Route::get('/company', [
        \App\Http\Controllers\Application\Configurations\CompanyConfigurationController::class,
        'show',
    ])->name('app.configurations.company');

    Route::patch('/company', [
        \App\Http\Controllers\Application\Configurations\CompanyConfigurationController::class,
        'update',
    ])->name('app.configurations.company');

    Route::get('/structure', [
        \App\Http\Controllers\Application\Configurations\StructureConfigurationController::class,
        'show',
    ])->name('app.configurations.structure');

    Route::patch('/structure', [
        \App\Http\Controllers\Application\Configurations\StructureConfigurationController::class,
        'update',
    ])->name('app.configurations.structure');

    Route::resource('/financial-resources', \App\Http\Controllers\Application\Configurations\FinancialResourceConfigurationController::class)
        ->only(['index', 'show', 'update', 'store'])
        ->names([
            'index' => 'app.configurations.financial-resources',
            'create' => 'app.configurations.financial-resources.create',
            'store' => 'app.configurations.financial-resources.store',
            'show' => 'app.configurations.financial-resources.show',
            'update' => 'app.configurations.financial-resources.update',
        ]);

    Route::match(['put', 'patch'], '/financial-resources/set-default/{financial_resource}', \App\Http\Controllers\Application\Configurations\FinancialResourcesSetDefaultController::class)
        ->name('app.configurations.financial-resources.set-default');

    Route::match(['put', 'patch'], '/financial-resources/toggle-active/{financial_resource}', \App\Http\Controllers\Application\Configurations\FinancialResourcesToggleActiveController::class)
        ->name('app.configurations.financial-resources.toggle-active');

    Route::get('/invoice', [
        \App\Http\Controllers\Application\Configurations\InvoiceConfigurationController::class,
        'show',
    ])->name('app.configurations.invoice');

    Route::patch('/invoice', [
        \App\Http\Controllers\Application\Configurations\InvoiceConfigurationController::class,
        'update',
    ])->name('app.configurations.invoice.update');

    Route::post('/invoice/upload-logo', \App\Http\Controllers\Application\Configurations\UploadLogoController::class)
        ->name('app.configurations.invoice.upload-logo');

    Route::get('/invoice/sample-pdf', \App\Http\Controllers\Application\Configurations\SamplePdfController::class)
        ->name('app.configurations.invoice.sample-pdf');

    // Regional Settings
    Route::get('/regional', [
        \App\Http\Controllers\Application\Configurations\RegionalSettingsController::class,
        'show',
    ])->name('app.configurations.regional');

    Route::patch('/regional', [
        \App\Http\Controllers\Application\Configurations\RegionalSettingsController::class,
        'update',
    ])->name('app.configurations.regional.update');

    // Email Settings
    Route::get('/email', [
        \App\Http\Controllers\Application\Configurations\EmailSettingsController::class,
        'show',
    ])->name('app.configurations.email');

    Route::patch('/email', [
        \App\Http\Controllers\Application\Configurations\EmailSettingsController::class,
        'update',
    ])->name('app.configurations.email.update');

    Route::patch('/email/notifications', [
        \App\Http\Controllers\Application\Configurations\EmailSettingsController::class,
        'updateNotifications',
    ])->name('app.configurations.email.notifications.update');

    // VAT Settings
    Route::get('/vat', [
        \App\Http\Controllers\Application\Configurations\VatSettingsController::class,
        'show',
    ])->name('app.configurations.vat');

    Route::patch('/vat', [
        \App\Http\Controllers\Application\Configurations\VatSettingsController::class,
        'update',
    ])->name('app.configurations.vat.update');

    Route::patch('/vat/{vatRate}/toggle-active', [
        \App\Http\Controllers\Application\Configurations\VatSettingsController::class,
        'toggleActive',
    ])->name('app.configurations.vat.toggle-active');

    Route::post('/vat/custom-rate', [
        \App\Http\Controllers\Application\Configurations\VatSettingsController::class,
        'storeCustomRate',
    ])->name('app.configurations.vat.custom-rate.store');

    // Payment Settings
    Route::get('/payment', [
        \App\Http\Controllers\Application\Configurations\PaymentSettingsController::class,
        'show',
    ])->name('app.configurations.payment');

    Route::patch('/payment/{paymentMethod}/toggle-active', [
        \App\Http\Controllers\Application\Configurations\PaymentSettingsController::class,
        'toggleActive',
    ])->name('app.configurations.payment.toggle-active');

    Route::post('/payment/custom-method', [
        \App\Http\Controllers\Application\Configurations\PaymentSettingsController::class,
        'storeCustomMethod',
    ])->name('app.configurations.payment.custom-method.store');

    Route::patch('/payment/condition/{paymentCondition}/toggle-active', [
        \App\Http\Controllers\Application\Configurations\PaymentSettingsController::class,
        'toggleConditionActive',
    ])->name('app.configurations.payment.condition.toggle-active');

    Route::post('/payment/custom-condition', [
        \App\Http\Controllers\Application\Configurations\PaymentSettingsController::class,
        'storeCustomCondition',
    ])->name('app.configurations.payment.custom-condition.store');

    // GDPR Compliance Dashboard
    Route::get('/gdpr-compliance', [
        \App\Http\Controllers\Application\Configurations\GdprComplianceController::class,
        'index',
    ])->name('app.configurations.gdpr-compliance');

    Route::get('/gdpr-compliance/report', [
        \App\Http\Controllers\Application\Configurations\GdprComplianceController::class,
        'report',
    ])->name('app.configurations.gdpr-compliance.report');

    Route::post('/gdpr-compliance/preview', [
        \App\Http\Controllers\Application\Configurations\GdprComplianceController::class,
        'preview',
    ])->name('app.configurations.gdpr-compliance.preview');

    Route::post('/gdpr-compliance/anonymize', [
        \App\Http\Controllers\Application\Configurations\GdprComplianceController::class,
        'anonymize',
    ])->name('app.configurations.gdpr-compliance.anonymize');

});
