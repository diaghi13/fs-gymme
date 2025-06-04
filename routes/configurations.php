<?php

use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('/configurations')->group(function() {

    Route::get('/', function() {
        return redirect()->route('configurations.company');
    })->name('configurations.index');

    Route::get('/company', [
        \App\Http\Controllers\Configurations\CompanyConfigurationController::class,
        'show'
    ])->name('configurations.company');

    Route::patch('/company', [
        \App\Http\Controllers\Configurations\CompanyConfigurationController::class,
        'update'
    ])->name('configurations.company');

    Route::get('/structure', [
        \App\Http\Controllers\Configurations\StructureConfigurationController::class,
        'show'
    ])->name('configurations.structure');

    Route::patch('/structure', [
        \App\Http\Controllers\Configurations\StructureConfigurationController::class,
        'update'
    ])->name('configurations.structure');

    Route::resource('/financial-resources', \App\Http\Controllers\Configurations\FinancialResourceConfigurationController::class)
        ->only(['index', 'show', 'update', 'store'])
        ->names([
            'index' => 'configurations.financial-resources',
            'create' => 'configurations.financial-resources.create',
            'store' => 'configurations.financial-resources.store',
            'show' => 'configurations.financial-resources.show',
            'update' => 'configurations.financial-resources.update'
        ]);

    Route::match(['put', 'patch'], '/financial-resources/set-default/{financial_resource}', \App\Http\Controllers\Configurations\FinancialResourcesSetDefaultController::class)
        ->name('configurations.financial-resources.set-default');

    Route::match(['put', 'patch'], '/financial-resources/toggle-active/{financial_resource}', \App\Http\Controllers\Configurations\FinancialResourcesToggleActiveController::class)
        ->name('configurations.financial-resources.toggle-active');

});
