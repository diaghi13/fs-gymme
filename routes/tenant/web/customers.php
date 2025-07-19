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
});
