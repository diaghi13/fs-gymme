<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| User & Role Management Routes
|--------------------------------------------------------------------------
*/

// Users Management
Route::resource('users', \App\Http\Controllers\Application\Users\UserController::class)
    ->names([
        'index' => 'app.users.index',
        'create' => 'app.users.create',
        'store' => 'app.users.store',
        'show' => 'app.users.show',
        'edit' => 'app.users.edit',
        'update' => 'app.users.update',
        'destroy' => 'app.users.destroy',
    ]);

// User Role Management
Route::put('users/{user}/role', [\App\Http\Controllers\Application\Users\UserRoleController::class, 'update'])
    ->name('app.users.role.update');

// User Extra Permissions Management
Route::put('users/{user}/permissions', [\App\Http\Controllers\Application\Users\UserPermissionController::class, 'update'])
    ->name('app.users.permissions.update');

// Roles Management
Route::resource('roles', \App\Http\Controllers\Application\Roles\RoleController::class)
    ->names([
        'index' => 'app.roles.index',
        'create' => 'app.roles.create',
        'store' => 'app.roles.store',
        'show' => 'app.roles.show',
        'edit' => 'app.roles.edit',
        'update' => 'app.roles.update',
        'destroy' => 'app.roles.destroy',
    ]);
