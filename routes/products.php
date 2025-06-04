<?php

use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {

    /* Products controllers */
    Route::resource('/base-products', \App\Http\Controllers\Products\BaseProductController::class)
        ->except(['edit']);

    Route::post('/base-products/{product}/schedules', [\App\Http\Controllers\Products\BaseProductScheduleController::class, 'store'])
        ->name('base-products.schedules.store');

    Route::resource('/base-products/schedules', \App\Http\Controllers\Products\BaseProductScheduleController::class)
        ->only(['update', 'destroy'])
        ->names([
            'update' => 'base-products.schedules.update',
            'destroy' => 'base-products.schedules.destroy',
        ]);

    Route::patch('base-products/{product}/sales', \App\Http\Controllers\Products\BaseProductSaleUpdate::class)
        ->name('base-products.sales.update');

    Route::resource('/course-products', \App\Http\Controllers\Products\CourseProductController::class)
        ->except(['edit']);

    Route::patch('course-products/{product}/sales', \App\Http\Controllers\Products\CourseProductSaleUpdate::class)
        ->name('course-products.sales.update');

});
