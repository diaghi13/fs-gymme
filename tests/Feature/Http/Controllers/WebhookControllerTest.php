<?php

use App\Models\SubscriptionPlan;
use App\Models\Tenant;

it('handles customer subscription created webhook', function () {
    $tenant = Tenant::factory()->create([
        'stripe_id' => 'cus_test123',
    ]);

    $plan = SubscriptionPlan::factory()->create([
        'name' => 'Test Plan',
        'stripe_price_id' => 'price_test123',
        'price' => 1000,
        'currency' => 'EUR',
        'interval' => 'monthly',
    ]);

    $payload = [
        'data' => [
            'object' => [
                'customer' => 'cus_test123',
                'items' => [
                    'data' => [
                        [
                            'price' => [
                                'id' => 'price_test123',
                            ],
                        ],
                    ],
                ],
                'current_period_start' => now()->timestamp,
                'current_period_end' => now()->addMonth()->timestamp,
                'status' => 'active',
                'trial_end' => null,
            ],
        ],
    ];

    $controller = app(\App\Http\Controllers\Central\WebhookController::class);
    $controller->handleCustomerSubscriptionCreated($payload);

    $tenant->refresh();
    $activePlan = $tenant->active_subscription_plan;

    expect($activePlan)->not->toBeNull()
        ->and($activePlan->id)->toBe($plan->id)
        ->and($activePlan->pivot->is_active)->toBeTrue()
        ->and($activePlan->pivot->status)->toBe('active');
});

it('handles customer subscription updated webhook', function () {
    $tenant = Tenant::factory()->create([
        'stripe_id' => 'cus_test123',
    ]);

    $plan = SubscriptionPlan::factory()->create([
        'name' => 'Test Plan',
        'stripe_price_id' => 'price_test123',
        'price' => 1000,
        'currency' => 'EUR',
        'interval' => 'monthly',
    ]);

    // Create initial subscription
    $tenant->subscription_planes()->attach($plan->id, [
        'starts_at' => now()->subMonth(),
        'ends_at' => now(),
        'is_active' => true,
        'is_trial' => false,
        'status' => 'active',
    ]);

    $payload = [
        'data' => [
            'object' => [
                'customer' => 'cus_test123',
                'items' => [
                    'data' => [
                        [
                            'price' => [
                                'id' => 'price_test123',
                            ],
                        ],
                    ],
                ],
                'current_period_start' => now()->timestamp,
                'current_period_end' => now()->addMonth()->timestamp,
                'status' => 'active',
                'trial_end' => null,
            ],
        ],
    ];

    $controller = app(\App\Http\Controllers\Central\WebhookController::class);
    $controller->handleCustomerSubscriptionUpdated($payload);

    $tenant->refresh();
    $activePlan = $tenant->active_subscription_plan;

    expect($activePlan)->not->toBeNull()
        ->and($activePlan->pivot->ends_at->isAfter(now()))->toBeTrue();
});

it('handles customer subscription deleted webhook', function () {
    $tenant = Tenant::factory()->create([
        'stripe_id' => 'cus_test123',
    ]);

    $plan = SubscriptionPlan::factory()->create([
        'name' => 'Test Plan',
        'stripe_price_id' => 'price_test123',
        'price' => 1000,
        'currency' => 'EUR',
        'interval' => 'monthly',
    ]);

    $tenant->subscription_planes()->attach($plan->id, [
        'starts_at' => now()->subMonth(),
        'ends_at' => now()->addMonth(),
        'is_active' => true,
        'is_trial' => false,
        'status' => 'active',
    ]);

    $payload = [
        'data' => [
            'object' => [
                'customer' => 'cus_test123',
                'items' => [
                    'data' => [
                        [
                            'price' => [
                                'id' => 'price_test123',
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ];

    $controller = app(\App\Http\Controllers\Central\WebhookController::class);
    $controller->handleCustomerSubscriptionDeleted($payload);

    // Check directly from DB
    $pivotData = \DB::table('subscription_plan_tenant')
        ->where('tenant_id', $tenant->id)
        ->where('subscription_plan_id', $plan->id)
        ->first();

    expect($pivotData)->not->toBeNull()
        ->and((bool) $pivotData->is_active)->toBeFalse()
        ->and($pivotData->status)->toBe('cancelled');
});

it('ignores webhook for non-existent tenant', function () {
    $plan = SubscriptionPlan::factory()->create([
        'name' => 'Test Plan',
        'stripe_price_id' => 'price_test123',
        'price' => 1000,
        'currency' => 'EUR',
        'interval' => 'monthly',
    ]);

    $payload = [
        'data' => [
            'object' => [
                'customer' => 'cus_nonexistent',
                'items' => [
                    'data' => [
                        [
                            'price' => [
                                'id' => 'price_test123',
                            ],
                        ],
                    ],
                ],
                'current_period_start' => now()->timestamp,
                'current_period_end' => now()->addMonth()->timestamp,
                'status' => 'active',
                'trial_end' => null,
            ],
        ],
    ];

    $controller = app(\App\Http\Controllers\Central\WebhookController::class);

    // Should not throw exception
    $controller->handleCustomerSubscriptionCreated($payload);

    expect(true)->toBeTrue();
});
