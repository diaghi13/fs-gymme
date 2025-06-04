<?php

use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {

    Route::resource('/price-lists', \App\Http\Controllers\PriceLists\PriceListController::class)
        ->except(['edit']);

    Route::match(['put', 'patch'],'/price-lists/{priceList}/sales', \App\Http\Controllers\PriceLists\PriceListSalesUpdate::class)
        ->name('price-lists.sales.update');

    Route::resource('/price-lists/folders', \App\Http\Controllers\PriceLists\FolderController::class)
        ->except(['index', 'edit'])
        ->names([
            'create' => 'price-lists.folders.create',
            'store' => 'price-lists.folders.store',
            'show' => 'price-lists.folders.show',
            'update' => 'price-lists.folders.update',
            'destroy' => 'price-lists.folders.destroy',
        ])
        ->parameters([
            //'folders' => 'folder',
        ]);

    Route::resource('/price-lists/articles', \App\Http\Controllers\PriceLists\ArticleController::class)
        ->except(['index', 'edit'])
        ->names([
            'create' => 'price-lists.articles.create',
            'store' => 'price-lists.articles.store',
            'show' => 'price-lists.articles.show',
            'update' => 'price-lists.articles.update',
            'destroy' => 'price-lists.articles.destroy',
        ])
        ->parameters([
            //'articles' => 'article',
        ]);

    Route::resource('/price-lists/memberships', \App\Http\Controllers\PriceLists\MembershipController::class)
        ->except(['index', 'edit'])
        ->names([
            'create' => 'price-lists.memberships.create',
            'store' => 'price-lists.memberships.store',
            'show' => 'price-lists.memberships.show',
            'update' => 'price-lists.memberships.update',
            'destroy' => 'price-lists.memberships.destroy',
        ]);

    Route::resource('/price-lists/subscriptions', \App\Http\Controllers\PriceLists\SubscriptionController::class)
        ->except(['index', 'edit'])
        ->names([
            'create' => 'price-lists.subscriptions.create',
            'store' => 'price-lists.subscriptions.store',
            'show' => 'price-lists.subscriptions.show',
            'update' => 'price-lists.subscriptions.update',
            'destroy' => 'price-lists.subscriptions.destroy',
        ]);

    Route::match(['put', 'patch'],'/price-lists/subscriptions/{subscription}/optional-content', \App\Http\Controllers\PriceLists\OptionalContentSubscriptionUpdateController::class)
        ->name('price-lists.subscriptions.optional-content.update');
});
