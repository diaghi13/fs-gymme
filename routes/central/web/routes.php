<?php

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['verified'])->group(function () {
    Route::get('profile', function () {
        return Inertia::render('Profile', [
            'user' => auth()->user(),
        ]);
    })->name('central.profile');
});

Route::middleware(['verified', 'auth', 'role:super-admin'])->group(function () {
    Route::get('dashboard', \App\Http\Controllers\Central\Dashboard::class)
        ->name('central.dashboard');

    Route::resource('tenants', \App\Http\Controllers\Central\TenantController::class)
        ->only(['index', 'create', 'store', 'edit', 'update'])
        ->names('central.tenants');

    Route::resource('users', \App\Http\Controllers\Central\UserController::class)
        ->only(['index', 'create', 'store', 'edit', 'update'])
        ->names('central.users');
});

require __DIR__ . '/auth.php';
