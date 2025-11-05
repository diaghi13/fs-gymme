<?php

use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth'])->group(function () {

    /* Products controllers */
    Route::resource('/base-products', \App\Http\Controllers\Application\Products\BaseProductController::class)
        ->except(['edit'])
        ->names([
            'index' => 'app.base-products.index',
            'create' => 'app.base-products.create',
            'store' => 'app.base-products.store',
            'show' => 'app.base-products.show',
            'update' => 'app.base-products.update',
            'destroy' => 'app.base-products.destroy',
        ]);

    Route::post('/base-products/{product}/schedules', [\App\Http\Controllers\Application\Products\BaseProductScheduleController::class, 'store'])
        ->name('app.base-products.schedules.store');

    Route::resource('/base-products/schedules', \App\Http\Controllers\Application\Products\BaseProductScheduleController::class)
        ->only(['update', 'destroy'])
        ->names([
            'update' => 'app.base-products.schedules.update',
            'destroy' => 'app.base-products.schedules.destroy',
        ]);

    Route::patch('base-products/{product}/sales', \App\Http\Controllers\Application\Products\BaseProductSaleUpdate::class)
        ->name('app.base-products.sales.update');

    Route::resource('/course-products', \App\Http\Controllers\Application\Products\CourseProductController::class)
        ->except(['edit'])
        ->names([
            'index' => 'app.course-products.index',
            'create' => 'app.course-products.create',
            'store' => 'app.course-products.store',
            'show' => 'app.course-products.show',
            'update' => 'app.course-products.update',
            'destroy' => 'app.course-products.destroy',
        ]);

    Route::patch('course-products/{product}/sales', \App\Http\Controllers\Application\Products\CourseProductSaleUpdate::class)
        ->name('app.course-products.sales.update');

    // Course Product Plannings (nested resource)
    Route::post('course-products/{course_product}/plannings', [\App\Http\Controllers\Application\Products\CourseProductPlanningController::class, 'store'])
        ->name('app.course-products.plannings.store');

    Route::put('course-products/{course_product}/plannings/{planning}', [\App\Http\Controllers\Application\Products\CourseProductPlanningController::class, 'update'])
        ->name('app.course-products.plannings.update');

    Route::delete('course-products/{course_product}/plannings/{planning}', [\App\Http\Controllers\Application\Products\CourseProductPlanningController::class, 'destroy'])
        ->name('app.course-products.plannings.destroy');

    Route::resource('/bookable-services', \App\Http\Controllers\Application\Products\BookableServiceController::class)
        ->except(['edit'])
        ->names([
            'index' => 'app.bookable-services.index',
            'create' => 'app.bookable-services.create',
            'store' => 'app.bookable-services.store',
            'show' => 'app.bookable-services.show',
            'update' => 'app.bookable-services.update',
            'destroy' => 'app.bookable-services.destroy',
        ]);

});
