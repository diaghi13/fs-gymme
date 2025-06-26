<?php

use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth'])->group(function () {

    Route::resource('/price-lists', \App\Http\Controllers\App\PriceLists\PriceListController::class)
        ->except(['edit'])
        ->names([
            'index' => 'app.price-lists.index',
            'create' => 'app.price-lists.create',
            'store' => 'app.price-lists.store',
            'show' => 'app.price-lists.show',
            'update' => 'app.price-lists.update',
            'destroy' => 'app.price-lists.destroy',
        ]);

    Route::match(['put', 'patch'], '/price-lists/{priceList}/sales', \App\Http\Controllers\App\PriceLists\PriceListSalesUpdate::class)
        ->name('app.price-lists.sales.update');

    Route::resource('/price-lists/folders', \App\Http\Controllers\App\PriceLists\FolderController::class)
        ->except(['index', 'edit'])
        ->names([
            'create' => 'app.price-lists.folders.create',
            'store' => 'app.price-lists.folders.store',
            'show' => 'app.price-lists.folders.show',
            'update' => 'app.price-lists.folders.update',
            'destroy' => 'app.price-lists.folders.destroy',
        ])
        ->parameters([
            //'folders' => 'folder',
        ]);

    Route::resource('/price-lists/articles', \App\Http\Controllers\App\PriceLists\ArticleController::class)
        ->except(['index', 'edit'])
        ->names([
            'create' => 'app.price-lists.articles.create',
            'store' => 'app.price-lists.articles.store',
            'show' => 'app.price-lists.articles.show',
            'update' => 'app.price-lists.articles.update',
            'destroy' => 'app.price-lists.articles.destroy',
        ])
        ->parameters([
            //'articles' => 'article',
        ]);

    Route::resource('/price-lists/memberships', \App\Http\Controllers\App\PriceLists\MembershipController::class)
        ->except(['index', 'edit'])
        ->names([
            'create' => 'app.price-lists.memberships.create',
            'store' => 'app.price-lists.memberships.store',
            'show' => 'app.price-lists.memberships.show',
            'update' => 'app.price-lists.memberships.update',
            'destroy' => 'app.price-lists.memberships.destroy',
        ]);

    Route::resource('/price-lists/subscriptions', \App\Http\Controllers\App\PriceLists\SubscriptionController::class)
        ->except(['index', 'edit'])
        ->names([
            'create' => 'app.price-lists.subscriptions.create',
            'store' => 'app.price-lists.subscriptions.store',
            'show' => 'app.price-lists.subscriptions.show',
            'update' => 'app.price-lists.subscriptions.update',
            'destroy' => 'app.price-lists.subscriptions.destroy',
        ]);

    Route::match(['put', 'patch'], '/price-lists/subscriptions/{subscription}/optional-content', \App\Http\Controllers\App\PriceLists\OptionalContentSubscriptionUpdateController::class)
        ->name('price-lists.subscriptions.optional-content.update');
});
