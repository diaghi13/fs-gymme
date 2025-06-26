<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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

    Route::get('dashboard', function () {
//        tenancy()->central(function () {
//            $role = Role::create(['name' => 'super-admin']);
//            $permission = Permission::create(['name' => 'manage sales']);
//
//            $role->givePermissionTo($permission);
//
//            $user = auth()->user();
//
//            if ($user) {
//                $user->assignRole($role);
//            }
//        });

        return Inertia::render('dashboard');
    })->name('app.dashboard');

    Route::resource('sales', \App\Http\Controllers\App\Sales\SaleController::class)
        ->except(['edit'])
        ->names([
            'index' => 'app.sales.index',
            'create' => 'app.sales.create',
            'store' => 'app.sales.store',
            'show' => 'app.sales.show',
            'update' => 'app.sales.update',
            'destroy' => 'app.sales.destroy',
        ]);

    Route::get('sales/{sale}/export-xml', \App\Http\Controllers\App\Sales\ExportXml::class)
        ->name('app.sales.export-xml');

});

require __DIR__ . '/products.php';
require __DIR__ . '/price-lists.php';
require __DIR__ . '/configurations.php';
require __DIR__ . '/settings.php';
require __DIR__ . '/customers.php';
