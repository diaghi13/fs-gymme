<?php

use App\Models\CentralUser;
use App\Models\SubscriptionPlan;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\DB;

beforeEach(function () {
    // Create a user
    $this->centralUser = CentralUser::factory()->create([
        'email' => 'test@example.com',
    ]);

    // Create tenant for testing with user
    $this->tenant = $this->createTenantWithDatabase(['name' => 'Test Tenant'], $this->centralUser);

    // Sync user to tenant database
    $this->initializeTenancy($this->tenant);
    User::create([
        'global_id' => $this->centralUser->global_id,
        'first_name' => $this->centralUser->first_name,
        'last_name' => $this->centralUser->last_name,
        'email' => $this->centralUser->email,
        'password' => $this->centralUser->password,
    ]);
    $this->endTenancy();
});

afterEach(function () {
    // End any active tenancy
    if (tenancy()->initialized) {
        $this->endTenancy();
    }

    // Clean up tenant database files after each test
    foreach (glob(database_path('gymme-tenant_*')) as $file) {
        if (is_file($file)) {
            @unlink($file);
        }
    }

    // Clear tenant records from central database
    DB::table('tenants')->truncate();
    DB::table('tenant_users')->truncate();
});

test('authenticated user can access tenant routes', function () {
    // Act as the user
    $this->actingAs($this->centralUser);

    // Access tenant dashboard
    $response = $this->get(route('app.dashboard', ['tenant' => $this->tenant->id]));

    // Should be successful (or redirect, depending on subscription plan middleware)
    expect($response->status())->toBeIn([200, 302]);
});

test('unauthenticated user cannot access tenant routes', function () {
    // Try to access tenant dashboard without authentication
    $response = $this->get(route('app.dashboard', ['tenant' => $this->tenant->id]));

    // Should redirect to login
    $response->assertRedirect(route('login'));
});

test('user cannot access tenant they do not belong to', function () {
    // Create another tenant
    $otherTenant = Tenant::factory()->create(['name' => 'Other Tenant']);
    tenancy()->initialize($otherTenant);
    $this->artisan('tenants:migrate', ['--tenants' => [$otherTenant->id]]);
    tenancy()->end();

    // Act as the user who belongs to tenant1
    $this->actingAs($this->centralUser);

    // Try to access other tenant's dashboard
    $response = $this->get(route('app.dashboard', ['tenant' => $otherTenant->id]));

    // Should be forbidden
    $response->assertForbidden();
});

test('user can access multiple tenants if associated', function () {
    // Create second tenant using helper
    $tenant2 = $this->createTenantWithDatabase(['name' => 'Tenant 2'], $this->centralUser);

    // Sync user to tenant 2 database
    $this->initializeTenancy($tenant2);
    User::create([
        'global_id' => $this->centralUser->global_id,
        'first_name' => $this->centralUser->first_name,
        'last_name' => $this->centralUser->last_name,
        'email' => $this->centralUser->email,
        'password' => $this->centralUser->password,
    ]);
    $this->endTenancy();

    // Act as the user
    $this->actingAs($this->centralUser);

    // Should be able to access both tenants
    $response1 = $this->get(route('app.dashboard', ['tenant' => $this->tenant->id]));
    $response2 = $this->get(route('app.dashboard', ['tenant' => $tenant2->id]));

    expect($response1->status())->toBeIn([200, 302]);
    expect($response2->status())->toBeIn([200, 302]);
});

test('tenant context is set correctly in middleware', function () {
    // Act as the user
    $this->actingAs($this->centralUser);

    // Make request to tenant route
    $this->get(route('app.dashboard', ['tenant' => $this->tenant->id]));

    // Verify tenant is in session
    expect(session('current_tenant_id'))->toBe($this->tenant->id);
});

test('HasActiveSubscriptionPlan middleware blocks access when no subscription', function () {
    // Make sure tenant has no active subscription
    DB::table('subscription_plan_tenant')
        ->where('tenant_id', $this->tenant->id)
        ->delete();

    // Act as the user
    $this->actingAs($this->centralUser);

    // Try to access tenant dashboard
    $response = $this->get(route('app.dashboard', ['tenant' => $this->tenant->id]));

    // Should redirect or block (depending on middleware configuration)
    // The middleware redirects to a subscription plan page or blocks access
    expect($response->status())->toBeIn([302, 403]);
});

test('HasActiveSubscriptionPlan middleware allows access when subscription is active', function () {
    // Create subscription plan
    $plan = SubscriptionPlan::factory()->create([
        'name' => 'Basic Plan',
        'is_active' => true,
        'price' => 1000, // 10.00 EUR
    ]);

    // Associate tenant with active subscription
    DB::table('subscription_plan_tenant')->insert([
        'tenant_id' => $this->tenant->id,
        'subscription_plan_id' => $plan->id,
        'is_active' => true,
        'starts_at' => now(),
        'ends_at' => now()->addMonth(),
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    // Act as the user
    $this->actingAs($this->centralUser);

    // Access tenant dashboard
    $response = $this->get(route('app.dashboard', ['tenant' => $this->tenant->id]));

    // Should be successful
    $response->assertSuccessful();
});

test('super admin can access any tenant', function () {
    // Create a super admin user
    $superAdmin = CentralUser::factory()->create(['email' => 'admin@example.com']);

    // Assign super-admin role (assuming you have a roles system)
    DB::table('model_has_roles')->insert([
        'role_id' => DB::table('roles')->where('name', 'super-admin')->value('id') ?? 1,
        'model_type' => get_class($superAdmin),
        'model_id' => $superAdmin->id,
    ]);

    // Create another tenant that super admin is NOT associated with
    $otherTenant = Tenant::factory()->create(['name' => 'Other Tenant']);
    tenancy()->initialize($otherTenant);
    $this->artisan('tenants:migrate', ['--tenants' => [$otherTenant->id]]);
    tenancy()->end();

    // Act as super admin
    $this->actingAs($superAdmin);

    // Super admin should be able to access any tenant
    $response = $this->get(route('app.dashboard', ['tenant' => $otherTenant->id]));

    // Should be successful or redirect (but not forbidden)
    expect($response->status())->not->toBe(403);
});

test('tenant context changes when switching between tenants', function () {
    // Create second tenant using helper
    $tenant2 = $this->createTenantWithDatabase(['name' => 'Tenant 2'], $this->centralUser);

    // Sync user to tenant 2 database
    $this->initializeTenancy($tenant2);
    User::create([
        'global_id' => $this->centralUser->global_id,
        'first_name' => $this->centralUser->first_name,
        'last_name' => $this->centralUser->last_name,
        'email' => $this->centralUser->email,
        'password' => $this->centralUser->password,
    ]);
    $this->endTenancy();

    // Act as the user
    $this->actingAs($this->centralUser);

    // Access tenant 1
    $this->get(route('app.dashboard', ['tenant' => $this->tenant->id]));
    $tenant1Session = session('current_tenant_id');

    // Access tenant 2
    $this->get(route('app.dashboard', ['tenant' => $tenant2->id]));
    $tenant2Session = session('current_tenant_id');

    // Verify sessions are different
    expect($tenant1Session)->toBe($this->tenant->id);
    expect($tenant2Session)->toBe($tenant2->id);
    expect($tenant1Session)->not->toBe($tenant2Session);
});
