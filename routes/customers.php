<?php

use Illuminate\Support\Facades\Route;

Route::resource('customers', \App\Http\Controllers\Customers\CustomerController::class)
    ->except(['edit'])
    ->names([
        'index' => 'customers.index',
        'create' => 'customers.create',
        'store' => 'customers.store',
        'show' => 'customers.show',
        'update' => 'customers.update',
        'destroy' => 'customers.destroy',
    ]);

Route::post('customers/{customer}/medical-certifications', [\App\Http\Controllers\Customers\MedicalCertificationController::class, 'store'])
    ->name('customers.medical-certifications.store');
Route::match(['put', 'patch'], 'customers/medical-certifications/{medicalCertification}', [\App\Http\Controllers\Customers\MedicalCertificationController::class, 'update'])
    ->name('customers.medical-certifications.update');
Route::delete('customers/medical-certifications/{medicalCertification}', [\App\Http\Controllers\Customers\MedicalCertificationController::class, 'destroy'])
    ->name('customers.medical-certifications.destroy');

Route::match(['put', 'patch'], 'customers/memberships/{customerSubscription}', [\App\Http\Controllers\Customers\MembershipController::class, 'update'])
    ->name('customers.memberships.update');
