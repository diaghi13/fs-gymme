<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('sales/{customer?}', [\App\Http\Controllers\Sales\SaleController::class, 'create'])
        ->name('sales.create');
    Route::resource('sales', \App\Http\Controllers\Sales\SaleController::class)
        ->except(['edit', 'create'])
        ->names([
            'index' => 'sales.index',
            //'create' => 'sales.create',
            'store' => 'sales.store',
            'show' => 'sales.show',
            'update' => 'sales.update',
            'destroy' => 'sales.destroy',
        ]);

    Route::get('sales/{sale}/export-xml', \App\Http\Controllers\Sales\ExportXml::class)
    ->name('sales.export-xml');
});

require __DIR__ . '/products.php';
require __DIR__ . '/price-lists.php';
require __DIR__ . '/configurations.php';
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
