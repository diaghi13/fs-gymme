<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth'])->prefix('/configurations')->group(function() {

    Route::get('/', function(\Illuminate\Http\Request $request) {
        $currentTenantId = $request->session()->get('current_tenant_id');

        return redirect()->route('app.configurations.company', [
            'tenant' => $currentTenantId,
        ]);
    })->name('app.configurations.index');

    Route::get('/company', [
        \App\Http\Controllers\Application\Configurations\CompanyConfigurationController::class,
        'show'
    ])->name('app.configurations.company');

    Route::patch('/company', [
        \App\Http\Controllers\Application\Configurations\CompanyConfigurationController::class,
        'update'
    ])->name('app.configurations.company');

    Route::get('/structure', [
        \App\Http\Controllers\Application\Configurations\StructureConfigurationController::class,
        'show'
    ])->name('app.configurations.structure');

    Route::patch('/structure', [
        \App\Http\Controllers\Application\Configurations\StructureConfigurationController::class,
        'update'
    ])->name('app.configurations.structure');

    Route::resource('/financial-resources', \App\Http\Controllers\Application\Configurations\FinancialResourceConfigurationController::class)
        ->only(['index', 'show', 'update', 'store'])
        ->names([
            'index' => 'app.configurations.financial-resources',
            'create' => 'app.configurations.financial-resources.create',
            'store' => 'app.configurations.financial-resources.store',
            'show' => 'app.configurations.financial-resources.show',
            'update' => 'app.configurations.financial-resources.update'
        ]);

    Route::match(['put', 'patch'], '/financial-resources/set-default/{financial_resource}', \App\Http\Controllers\Application\Configurations\FinancialResourcesSetDefaultController::class)
        ->name('app.configurations.financial-resources.set-default');

    Route::match(['put', 'patch'], '/financial-resources/toggle-active/{financial_resource}', \App\Http\Controllers\Application\Configurations\FinancialResourcesToggleActiveController::class)
        ->name('app.configurations.financial-resources.toggle-active');

});
