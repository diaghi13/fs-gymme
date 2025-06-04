<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('price-lists', function () {
    return \App\Models\PriceList\PriceList::all();
})->middleware('auth:sanctum')->name('api.v1.price-lists.index');

Route::get('price-lists/{priceList}', function (\App\Models\PriceList\PriceList $priceList) {
    $priceList->load('vat_rate');

    if ($priceList->type === \App\Enums\PriceListItemTypeEnum::SUBSCRIPTION->value) {
        $priceList->load([
            'standard_content' => [
                'price_listable' => [
                    'vat_rate',
                ],
            ],
            'optional_content' => [
                'price_listable' => [
                    'vat_rate',
                ],
            ],]);
    }

    return new \App\Http\Resources\PriceListResource($priceList);
})
    ->middleware(['auth:sanctum'])
    ->name('api.v1.price-lists.show');

Route::get('payment-conditions', function () {
    return \App\Models\Support\PaymentCondition::with(['installments'])->get();
})->middleware('auth:sanctum')
    ->name('api.v1.payment-conditions.index');

Route::get('payment-conditions/{paymentCondition}', function (\App\Models\Support\PaymentCondition $paymentCondition) {
    return $paymentCondition->load(['installments', 'payment_method']);
})->middleware('auth:sanctum')
    ->name('api.v1.payment-conditions.show');
