<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware([])->group(function () {

    Route::get('/', function () {
        return response()->json([
            'message' => 'This is your multi-tenant API. The id of the current tenant is '.tenant('id'),
        ]);
    });

    Route::get('/user', function (Request $request) {
        return $request->user();
    })->middleware('auth:sanctum');

    Route::get('price-lists', function () {
        return \App\Models\PriceList\PriceList::all();
    })
        // ->middleware('auth:sanctum')
        ->name('api.v1.price-lists.index');

    Route::get('price-lists/{priceList}', function (\App\Models\PriceList\PriceList $priceList) {
        $priceList->load('vat_rate');

        $type = $priceList->type instanceof \App\Enums\PriceListType
            ? $priceList->type->value
            : $priceList->type;

        if ($type === \App\Enums\PriceListItemTypeEnum::SUBSCRIPTION->value) {
            $priceList->load([
                'standard_content' => [
                    'vat_rate',
                    'price_listable' => [
                        'vat_rate',
                    ],
                ],
                'optional_content' => [
                    'vat_rate',
                    'price_listable' => [
                        'vat_rate',
                    ],
                ],
            ]);
        }

        // Ensure vat_rate is always included in response
        $priceList->makeVisible(['vat_rate']);

        return ['data' => $priceList];

        // return new \App\Http\Resources\PriceListResource($priceList);
    })
        // ->middleware(['auth:sanctum'])
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
                $query->where('first_name', 'like', '%'.$request->term.'%')
                    ->orWhere('last_name', 'like', '%'.$request->term.'%')
                    ->orWhere('email', 'like', '%'.$request->term.'%');
            })
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->limit(10)
            ->get(['id', 'first_name', 'last_name', 'email', 'birth_date']);
    })->middleware('auth:sanctum')
        ->name('api.v1.customers.index');

    // Customer utilities
    Route::post('customers/check-email', [\App\Http\Controllers\Application\Customers\CustomerController::class, 'checkEmail'])
        ->middleware('auth:sanctum')
        ->name('api.v1.customers.check-email');

    Route::post('customers/calculate-tax-code', [\App\Http\Controllers\Application\Customers\CustomerController::class, 'calculateTaxCode'])
        ->middleware('auth:sanctum')
        ->name('api.v1.customers.calculate-tax-code');

    // Customer Measurements
    Route::prefix('customers/{customer}/measurements')->middleware('auth:sanctum')->group(function () {
        Route::get('/', [\App\Http\Controllers\Application\Customers\CustomerMeasurementController::class, 'index'])
            ->name('api.v1.customers.measurements.index');
        Route::post('/', [\App\Http\Controllers\Application\Customers\CustomerMeasurementController::class, 'store'])
            ->name('api.v1.customers.measurements.store');
        Route::get('/{measurement}', [\App\Http\Controllers\Application\Customers\CustomerMeasurementController::class, 'show'])
            ->name('api.v1.customers.measurements.show');
        Route::put('/{measurement}', [\App\Http\Controllers\Application\Customers\CustomerMeasurementController::class, 'update'])
            ->name('api.v1.customers.measurements.update');
        Route::delete('/{measurement}', [\App\Http\Controllers\Application\Customers\CustomerMeasurementController::class, 'destroy'])
            ->name('api.v1.customers.measurements.destroy');
    });

    // Sports Registrations
    Route::prefix('customers/{customer}/sports-registrations')->middleware('auth:sanctum')->group(function () {
        Route::get('/', [\App\Http\Controllers\Application\Customers\SportsRegistrationController::class, 'index'])
            ->name('api.v1.customers.sports-registrations.index');
        Route::post('/', [\App\Http\Controllers\Application\Customers\SportsRegistrationController::class, 'store'])
            ->name('api.v1.customers.sports-registrations.store');
        Route::get('/{registration}', [\App\Http\Controllers\Application\Customers\SportsRegistrationController::class, 'show'])
            ->name('api.v1.customers.sports-registrations.show');
        Route::put('/{registration}', [\App\Http\Controllers\Application\Customers\SportsRegistrationController::class, 'update'])
            ->name('api.v1.customers.sports-registrations.update');
        Route::delete('/{registration}', [\App\Http\Controllers\Application\Customers\SportsRegistrationController::class, 'destroy'])
            ->name('api.v1.customers.sports-registrations.destroy');
    });

    // Membership Fees (read-only + update for corrections, created automatically from sales)
    Route::prefix('customers/{customer}/membership-fees')->middleware('auth:sanctum')->group(function () {
        Route::get('/', [\App\Http\Controllers\Application\Customers\MembershipFeeController::class, 'index'])
            ->name('api.v1.customers.membership-fees.index');
        Route::get('/{membershipFee}', [\App\Http\Controllers\Application\Customers\MembershipFeeController::class, 'show'])
            ->name('api.v1.customers.membership-fees.show');
        Route::put('/{membershipFee}', [\App\Http\Controllers\Application\Customers\MembershipFeeController::class, 'update'])
            ->name('api.v1.customers.membership-fees.update');
    });

    // Customer Subscription Suspensions
    Route::prefix('customer-subscriptions/{subscription}/suspensions')->middleware('auth:sanctum')->group(function () {
        Route::get('/', [\App\Http\Controllers\Application\Customers\CustomerSubscriptionSuspensionController::class, 'index'])
            ->name('api.v1.customer-subscriptions.suspensions.index');
        Route::post('/', [\App\Http\Controllers\Application\Customers\CustomerSubscriptionSuspensionController::class, 'store'])
            ->name('api.v1.customer-subscriptions.suspensions.store');
    });

    Route::match(['put', 'patch'], 'customer-subscriptions/suspensions/{suspension}', [\App\Http\Controllers\Application\Customers\CustomerSubscriptionSuspensionController::class, 'update'])
        ->middleware('auth:sanctum')
        ->name('api.v1.customer-subscriptions.suspensions.update');

    Route::delete('customer-subscriptions/suspensions/{suspension}', [\App\Http\Controllers\Application\Customers\CustomerSubscriptionSuspensionController::class, 'destroy'])
        ->middleware('auth:sanctum')
        ->name('api.v1.customer-subscriptions.suspensions.destroy');

    // Customer Subscription Extensions
    Route::prefix('customer-subscriptions/{subscription}/extensions')->middleware('auth:sanctum')->group(function () {
        Route::get('/', [\App\Http\Controllers\Application\Customers\CustomerSubscriptionExtensionController::class, 'index'])
            ->name('api.v1.customer-subscriptions.extensions.index');
        Route::post('/', [\App\Http\Controllers\Application\Customers\CustomerSubscriptionExtensionController::class, 'store'])
            ->name('api.v1.customer-subscriptions.extensions.store');
    });

    Route::match(['put', 'patch'], 'customer-subscriptions/extensions/{extension}', [\App\Http\Controllers\Application\Customers\CustomerSubscriptionExtensionController::class, 'update'])
        ->middleware('auth:sanctum')
        ->name('api.v1.customer-subscriptions.extensions.update');

    Route::delete('customer-subscriptions/extensions/{extension}', [\App\Http\Controllers\Application\Customers\CustomerSubscriptionExtensionController::class, 'destroy'])
        ->middleware('auth:sanctum')
        ->name('api.v1.customer-subscriptions.extensions.destroy');

    // Customer Subscriptions CRUD
    Route::prefix('customers/{customer}/subscriptions')->middleware('auth:sanctum')->group(function () {
        Route::get('/', [\App\Http\Controllers\Application\Customers\CustomerSubscriptionController::class, 'index'])
            ->name('api.v1.customers.subscriptions.index');
        Route::post('/', [\App\Http\Controllers\Application\Customers\CustomerSubscriptionController::class, 'store'])
            ->name('api.v1.customers.subscriptions.store');
    });

    Route::match(['put', 'patch'], 'customer-subscriptions/{subscription}', [\App\Http\Controllers\Application\Customers\CustomerSubscriptionController::class, 'update'])
        ->middleware('auth:sanctum')
        ->name('api.v1.customer-subscriptions.update');

    Route::delete('customer-subscriptions/{subscription}', [\App\Http\Controllers\Application\Customers\CustomerSubscriptionController::class, 'destroy'])
        ->middleware('auth:sanctum')
        ->name('api.v1.customer-subscriptions.destroy');

    Route::get('customer-subscriptions/{subscription}/history', [\App\Http\Controllers\Application\Customers\CustomerSubscriptionController::class, 'history'])
        ->middleware('auth:sanctum')
        ->name('api.v1.customer-subscriptions.history');

    Route::get('price-lists/available', [\App\Http\Controllers\Application\Customers\CustomerSubscriptionController::class, 'getAvailablePriceLists'])
        ->middleware('auth:sanctum')
        ->name('api.v1.price-lists.available');

    // File Management
    Route::prefix('files')->middleware('auth:sanctum')->group(function () {
        Route::get('/', [\App\Http\Controllers\Application\FileController::class, 'index'])
            ->name('api.v1.files.index');
        Route::post('/', [\App\Http\Controllers\Application\FileController::class, 'store'])
            ->name('api.v1.files.store');
        Route::get('/{file}', [\App\Http\Controllers\Application\FileController::class, 'show'])
            ->name('api.v1.files.show');
        Route::get('/{file}/download', [\App\Http\Controllers\Application\FileController::class, 'download'])
            ->name('api.v1.files.download');
        Route::put('/{file}', [\App\Http\Controllers\Application\FileController::class, 'update'])
            ->name('api.v1.files.update');
        Route::delete('/{file}', [\App\Http\Controllers\Application\FileController::class, 'destroy'])
            ->name('api.v1.files.destroy');
    });

    Route::post('/subscribe', [\App\Http\Controllers\Central\SubscriptionPlan\SubscribeController::class, 'subscribe'])->name('subscription-plan.subscribe');

    // Subscription Management
    Route::post('/subscription/change-plan', [\App\Http\Controllers\Central\SubscriptionPlan\ManageSubscriptionController::class, 'changePlan'])->name('subscription.change-plan');
    Route::post('/subscription/cancel', [\App\Http\Controllers\Central\SubscriptionPlan\ManageSubscriptionController::class, 'cancel'])->name('subscription.cancel');
    Route::post('/subscription/cancel-now', [\App\Http\Controllers\Central\SubscriptionPlan\ManageSubscriptionController::class, 'cancelNow'])->name('subscription.cancel-now');
    Route::post('/subscription/resume', [\App\Http\Controllers\Central\SubscriptionPlan\ManageSubscriptionController::class, 'resume'])->name('subscription.resume');

    // Dashboard Stats
    Route::get('/dashboard/electronic-invoice-stats', function () {
        try {
            // Calculate total amount from accepted invoices
            $acceptedSales = \App\Models\Sale\Sale::with(['rows.vat_rate', 'payments'])
                ->whereHas('electronic_invoice', function ($query) {
                    $query->where('sdi_status', 'accepted');
                })
                ->get();

            $totalAmount = $acceptedSales->sum(function ($sale) {
                return $sale->sale_summary['final_total'] ?? 0;
            });

            $stats = [
                'month_count' => \App\Models\Sale\ElectronicInvoice::whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count(),
                'pending_count' => \App\Models\Sale\ElectronicInvoice::whereIn('sdi_status', ['generated', 'sent'])
                    ->count(),
                'rejected_count' => \App\Models\Sale\ElectronicInvoice::where('sdi_status', 'rejected')
                    ->count(),
                'accepted_count' => \App\Models\Sale\ElectronicInvoice::where('sdi_status', 'accepted')
                    ->count(),
                'total_amount' => round($totalAmount, 2),
            ];

            return response()->json($stats);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Dashboard FE stats error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'month_count' => 0,
                'pending_count' => 0,
                'rejected_count' => 0,
                'accepted_count' => 0,
                'total_amount' => 0,
            ], 200);
        }
    })->middleware('auth:sanctum')->name('api.dashboard.electronic-invoice-stats');

});
