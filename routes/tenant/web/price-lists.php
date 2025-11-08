<?php

use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth'])->group(function () {

    Route::resource('/price-lists', \App\Http\Controllers\Application\PriceLists\PriceListController::class)
        ->except(['edit'])
        ->names([
            'index' => 'app.price-lists.index',
            'create' => 'app.price-lists.create',
            'store' => 'app.price-lists.store',
            'show' => 'app.price-lists.show',
            'update' => 'app.price-lists.update',
            'destroy' => 'app.price-lists.destroy',
        ]);

    Route::match(['put', 'patch'], '/price-lists/{priceList}/sales', \App\Http\Controllers\Application\PriceLists\PriceListSalesUpdate::class)
        ->name('app.price-lists.sales.update');

    Route::resource('/price-lists/folders', \App\Http\Controllers\Application\PriceLists\FolderController::class)
        ->except(['index', 'edit'])
        ->names([
            'create' => 'app.price-lists.folders.create',
            'store' => 'app.price-lists.folders.store',
            'show' => 'app.price-lists.folders.show',
            'update' => 'app.price-lists.folders.update',
            'destroy' => 'app.price-lists.folders.destroy',
        ])
        ->parameters([
            // 'folders' => 'folder',
        ]);

    Route::resource('/price-lists/articles', \App\Http\Controllers\Application\PriceLists\ArticleController::class)
        ->except(['index', 'edit'])
        ->names([
            'create' => 'app.price-lists.articles.create',
            'store' => 'app.price-lists.articles.store',
            'show' => 'app.price-lists.articles.show',
            'update' => 'app.price-lists.articles.update',
            'destroy' => 'app.price-lists.articles.destroy',
        ])
        ->parameters([
            // 'articles' => 'article',
        ]);

    Route::resource('/price-lists/memberships', \App\Http\Controllers\Application\PriceLists\MembershipController::class)
        ->except(['index', 'edit'])
        ->names([
            'create' => 'app.price-lists.memberships.create',
            'store' => 'app.price-lists.memberships.store',
            'show' => 'app.price-lists.memberships.show',
            'update' => 'app.price-lists.memberships.update',
            'destroy' => 'app.price-lists.memberships.destroy',
        ]);

    Route::resource('/price-lists/subscriptions', \App\Http\Controllers\Application\PriceLists\SubscriptionController::class)
        ->except(['index', 'edit'])
        ->names([
            'create' => 'app.price-lists.subscriptions.create',
            'store' => 'app.price-lists.subscriptions.store',
            'show' => 'app.price-lists.subscriptions.show',
            'update' => 'app.price-lists.subscriptions.update',
            'destroy' => 'app.price-lists.subscriptions.destroy',
        ]);

    Route::match(['put', 'patch'], '/price-lists/subscriptions/{subscription}/optional-content', \App\Http\Controllers\Application\PriceLists\OptionalContentSubscriptionUpdateController::class)
        ->name('app.price-lists.subscriptions.optional-content.update');

    Route::resource('/price-lists/day-passes', \App\Http\Controllers\Application\PriceLists\DayPassController::class)
        ->except(['index', 'edit'])
        ->names([
            'create' => 'app.price-lists.day-passes.create',
            'store' => 'app.price-lists.day-passes.store',
            'show' => 'app.price-lists.day-passes.show',
            'update' => 'app.price-lists.day-passes.update',
            'destroy' => 'app.price-lists.day-passes.destroy',
        ]);

    Route::resource('/price-lists/tokens', \App\Http\Controllers\Application\PriceLists\TokenController::class)
        ->except(['index', 'edit'])
        ->names([
            'create' => 'app.price-lists.tokens.create',
            'store' => 'app.price-lists.tokens.store',
            'show' => 'app.price-lists.tokens.show',
            'update' => 'app.price-lists.tokens.update',
            'destroy' => 'app.price-lists.tokens.destroy',
        ]);

    Route::resource('/price-lists/gift-cards', \App\Http\Controllers\Application\PriceLists\GiftCardController::class)
        ->except(['index', 'edit'])
        ->names([
            'create' => 'app.price-lists.gift-cards.create',
            'store' => 'app.price-lists.gift-cards.store',
            'show' => 'app.price-lists.gift-cards.show',
            'update' => 'app.price-lists.gift-cards.update',
            'destroy' => 'app.price-lists.gift-cards.destroy',
        ]);
});
