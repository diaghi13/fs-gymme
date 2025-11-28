<?php

use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth'])->group(function () {

    Route::resource('customers', \App\Http\Controllers\Application\Customers\CustomerController::class)
        ->except(['edit'])
        ->names([
            'index' => 'app.customers.index',
            'create' => 'app.customers.create',
            'store' => 'app.customers.store',
            'show' => 'app.customers.show',
            'update' => 'app.customers.update',
            'destroy' => 'app.customers.destroy',
        ]);

    Route::post('customers/{customer}/medical-certifications', [\App\Http\Controllers\Application\Customers\MedicalCertificationController::class, 'store'])
        ->name('app.customers.medical-certifications.store');
    Route::match(['put', 'patch'], 'customers/medical-certifications/{medicalCertification}', [\App\Http\Controllers\Application\Customers\MedicalCertificationController::class, 'update'])
        ->name('app.customers.medical-certifications.update');
    Route::delete('customers/medical-certifications/{medicalCertification}', [\App\Http\Controllers\Application\Customers\MedicalCertificationController::class, 'destroy'])
        ->name('app.customers.medical-certifications.destroy');

    Route::match(['put', 'patch'], 'customers/memberships/{customerSubscription}', [\App\Http\Controllers\Application\Customers\MembershipController::class, 'update'])
        ->name('app.customers.memberships.update');

    // Avatar upload
    Route::post('customers/{customer}/avatar', [\App\Http\Controllers\Application\Customers\CustomerController::class, 'uploadAvatar'])
        ->name('app.customers.avatar.upload');

    // Payment routes
    Route::post('customers/{customer}/sales/{sale}/payments', [\App\Http\Controllers\Application\Customers\PaymentController::class, 'store'])
        ->name('app.customer-sale-payments.store');
    Route::match(['put', 'patch'], 'customers/{customer}/sales/{sale}/payments/{payment}', [\App\Http\Controllers\Application\Customers\PaymentController::class, 'update'])
        ->name('app.customer-sale-payments.update');

    // Trainer Assignment routes
    Route::post('customers/{customer}/trainers', [\App\Http\Controllers\Application\Customers\TrainerAssignmentController::class, 'store'])
        ->name('app.customers.trainers.store');
    Route::put('customers/{customer}/trainers/{trainer}', [\App\Http\Controllers\Application\Customers\TrainerAssignmentController::class, 'update'])
        ->name('app.customers.trainers.update');
    Route::delete('customers/{customer}/trainers/{trainer}', [\App\Http\Controllers\Application\Customers\TrainerAssignmentController::class, 'destroy'])
        ->name('app.customers.trainers.destroy');
});
