<?php

use App\Models\SubscriptionPlan;
use App\Models\Tenant;
use App\Services\Subscription\SubscriptionManagementService;
use Laravel\Cashier\Subscription;

beforeEach(function () {
    $this->service = app(SubscriptionManagementService::class);
});

it('can subscribe a tenant to a plan', function () {
    $tenant = Tenant::factory()->create();
    $plan = SubscriptionPlan::factory()->create([
        'stripe_price_id' => 'price_test_123',
        'trial_days' => 7,
    ]);

    // Mock Stripe
    $this->mock(\Stripe\Service\SubscriptionService::class);

    $tenant->createAsStripeCustomer();

    $paymentMethod = $tenant->createSetupIntent()->client_secret;

    expect($tenant->subscriptions()->count())->toBe(0);

    // Note: In a real test you would need to use Stripe test mode
    // This is a simplified version showing the structure
})->skip('Requires Stripe test mode setup');

it('deactivates previous subscriptions when subscribing to a new plan', function () {
    $tenant = Tenant::factory()->create();
    $oldPlan = SubscriptionPlan::factory()->create([
        'name' => 'Old Plan',
        'price' => 1000,
        'currency' => 'EUR',
        'interval' => 'monthly',
    ]);
    $newPlan = SubscriptionPlan::factory()->create([
        'name' => 'New Plan',
        'price' => 2000,
        'currency' => 'EUR',
        'interval' => 'monthly',
    ]);

    // Create existing subscription
    $tenant->subscription_planes()->attach($oldPlan->id, [
        'starts_at' => now()->subMonth(),
        'ends_at' => now()->addMonth(),
        'is_active' => true,
        'is_trial' => false,
        'status' => 'active',
    ]);

    expect($tenant->subscription_planes()->wherePivot('is_active', true)->count())->toBe(1);

    // Deactivate using the protected method via reflection
    $reflection = new ReflectionClass($this->service);
    $method = $reflection->getMethod('deactivateCurrentSubscription');
    $method->setAccessible(true);
    $method->invoke($this->service, $tenant);

    expect($tenant->fresh()->subscription_planes()->wherePivot('is_active', true)->count())->toBe(0);
});

it('can upgrade a subscription', function () {
    $tenant = Tenant::factory()->create();
    $currentPlan = SubscriptionPlan::factory()->create(['price' => 1000]);
    $newPlan = SubscriptionPlan::factory()->create([
        'price' => 2000,
        'stripe_price_id' => 'price_upgrade_test',
    ]);

    // This would require mocking Cashier and Stripe
    expect(true)->toBeTrue();
})->skip('Requires Stripe mock setup');

it('can downgrade a subscription', function () {
    $tenant = Tenant::factory()->create();
    $currentPlan = SubscriptionPlan::factory()->create(['price' => 2000]);
    $newPlan = SubscriptionPlan::factory()->create([
        'price' => 1000,
        'stripe_price_id' => 'price_downgrade_test',
    ]);

    // This would require mocking Cashier and Stripe
    expect(true)->toBeTrue();
})->skip('Requires Stripe mock setup');

it('can cancel a subscription', function () {
    $tenant = Tenant::factory()->create();
    $plan = SubscriptionPlan::factory()->create();

    // This would require mocking Cashier and Stripe
    expect(true)->toBeTrue();
})->skip('Requires Stripe mock setup');

it('can resume a cancelled subscription', function () {
    $tenant = Tenant::factory()->create();
    $plan = SubscriptionPlan::factory()->create();

    // This would require mocking Cashier and Stripe
    expect(true)->toBeTrue();
})->skip('Requires Stripe mock setup');

it('syncs subscription data to pivot table correctly', function () {
    $tenant = Tenant::factory()->create();
    $plan = SubscriptionPlan::factory()->create([
        'name' => 'Test Plan',
        'price' => 1000,
        'currency' => 'EUR',
        'interval' => 'monthly',
    ]);

    $stripeSubscription = (object) [
        'current_period_start' => now()->timestamp,
        'current_period_end' => now()->addMonth()->timestamp,
        'status' => 'active',
        'trial_end' => null,
    ];

    $reflection = new ReflectionClass($this->service);
    $method = $reflection->getMethod('syncSubscriptionToPivot');
    $method->setAccessible(true);
    $method->invoke($this->service, $tenant, $plan, $stripeSubscription);

    // Check directly from DB
    $pivotData = \DB::table('subscription_plan_tenant')
        ->where('tenant_id', $tenant->id)
        ->where('subscription_plan_id', $plan->id)
        ->first();

    expect($pivotData)->not->toBeNull()
        ->and((bool) $pivotData->is_active)->toBeTrue()
        ->and($pivotData->status)->toBe('active')
        ->and((bool) $pivotData->is_trial)->toBeFalse();
});
