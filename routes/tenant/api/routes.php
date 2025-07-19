<?php

use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Route;
use Laravel\Cashier\Exceptions\IncompletePayment;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

Route::middleware([])->group(function () {

    Route::get('/', function () {
        return response()->json([
            'message' => 'This is your multi-tenant API. The id of the current tenant is ' . tenant('id'),
        ]);
    });

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

    Route::get('customers', function (\Illuminate\Http\Request $request) {
        return \App\Models\Customer\Customer::query()
            ->when($request->has('term'), function ($query) use ($request) {
                $query->where('first_name', 'like', '%' . $request->term . '%')
                    ->orWhere('last_name', 'like', '%' . $request->term . '%')
                    ->orWhere('email', 'like', '%' . $request->term . '%');
            })
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->limit(10)
            ->get(['id', 'first_name', 'last_name', 'email', 'birth_date']);
    })->middleware('auth:sanctum')
        ->name('api.v1.customers.index');

    Route::post('/subscribe', [\App\Http\Controllers\Central\SubscriptionPlan\SubscribeController::class, 'subscribe'])->name('subscription-plan.subscribe');

});
