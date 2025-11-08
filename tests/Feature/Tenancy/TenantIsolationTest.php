<?php

use App\Models\CentralUser;
use App\Models\Product\BaseProduct;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\DB;

beforeEach(function () {
    // Create two separate tenants for isolation testing using the helper method
    // This ensures migrations run without seeding
    $this->tenant1 = $this->createTenantWithDatabase(['name' => 'Tenant 1']);
    $this->tenant2 = $this->createTenantWithDatabase(['name' => 'Tenant 2']);

    // Create a structure in each tenant for products to use
    $this->initializeTenancy($this->tenant1);
    $this->structure1 = \App\Models\Structure::create(['name' => 'Structure 1', 'address' => 'Address 1']);
    $this->endTenancy();

    $this->initializeTenancy($this->tenant2);
    $this->structure2 = \App\Models\Structure::create(['name' => 'Structure 2', 'address' => 'Address 2']);
    $this->endTenancy();
});

test('tenants have separate databases', function () {
    expect($this->tenant1->id)->not->toBe($this->tenant2->id);

    // Verify each tenant has its own database
    $this->initializeTenancy($this->tenant1);
    $db1 = DB::connection()->getDatabaseName();
    $this->endTenancy();

    $this->initializeTenancy($this->tenant2);
    $db2 = DB::connection()->getDatabaseName();
    $this->endTenancy();

    expect($db1)->not->toBe($db2);
    expect($db1)->toContain($this->tenant1->id);
    expect($db2)->toContain($this->tenant2->id);
});

test('products created in tenant1 are not visible in tenant2', function () {
    // Create product in tenant 1
    $this->initializeTenancy($this->tenant1);
    $product1 = BaseProduct::factory()->create(['name' => 'Tenant 1 Product', 'structure_id' => $this->structure1->id]);
    $this->endTenancy();

    // Switch to tenant 2
    $this->initializeTenancy($this->tenant2);
    $productsInTenant2 = BaseProduct::all();
    $this->endTenancy();

    // Tenant 2 should not see tenant 1's products
    expect($productsInTenant2)->toHaveCount(0);
});

test('users created in tenant1 database are not visible in tenant2 database', function () {
    // Create user in tenant 1 database
    $this->initializeTenancy($this->tenant1);
    User::create([
        'global_id' => 'test-global-id-1',
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'john@tenant1.com',
        'password' => bcrypt('password'),
    ]);
    $usersInTenant1 = User::count();
    $this->endTenancy();

    // Switch to tenant 2
    $this->initializeTenancy($this->tenant2);
    $usersInTenant2 = User::count();
    $userFromTenant1 = User::where('email', 'john@tenant1.com')->first();
    $this->endTenancy();

    expect($usersInTenant1)->toBe(1);
    expect($usersInTenant2)->toBe(0);
    expect($userFromTenant1)->toBeNull();
});

test('queries in tenant1 do not affect tenant2', function () {
    // Create products in both tenants
    $this->initializeTenancy($this->tenant1);
    BaseProduct::factory()->count(3)->create(['structure_id' => $this->structure1->id]);
    $countTenant1Before = BaseProduct::count();
    $this->endTenancy();

    $this->initializeTenancy($this->tenant2);
    BaseProduct::factory()->count(2)->create(['structure_id' => $this->structure2->id]);
    $countTenant2Before = BaseProduct::count();
    $this->endTenancy();

    // Delete all products in tenant 1
    $this->initializeTenancy($this->tenant1);
    BaseProduct::query()->delete();
    $countTenant1After = BaseProduct::count();
    $this->endTenancy();

    // Check tenant 2 still has its products
    $this->initializeTenancy($this->tenant2);
    $countTenant2After = BaseProduct::count();
    $this->endTenancy();

    expect($countTenant1Before)->toBe(3);
    expect($countTenant2Before)->toBe(2);
    expect($countTenant1After)->toBe(0);
    expect($countTenant2After)->toBe(2); // Unchanged
});

test('switching tenants changes the database connection', function () {
    // Initialize tenant 1
    $this->initializeTenancy($this->tenant1);
    $connection1 = DB::connection()->getDatabaseName();
    BaseProduct::factory()->create(['name' => 'Product in Tenant 1', 'structure_id' => $this->structure1->id]);
    $product1Name = BaseProduct::first()->name;
    $this->endTenancy();

    // Switch to tenant 2
    $this->initializeTenancy($this->tenant2);
    $connection2 = DB::connection()->getDatabaseName();
    BaseProduct::factory()->create(['name' => 'Product in Tenant 2', 'structure_id' => $this->structure2->id]);
    $product2Name = BaseProduct::first()->name;
    $productCount = BaseProduct::count();
    $this->endTenancy();

    expect($connection1)->not->toBe($connection2);
    expect($product1Name)->toBe('Product in Tenant 1');
    expect($product2Name)->toBe('Product in Tenant 2');
    expect($productCount)->toBe(1); // Should only see tenant 2's product
});

test('ending tenancy restores default database connection', function () {
    // Get default database name before tenant initialization
    $defaultDb = DB::connection()->getDatabaseName();

    // Initialize tenant
    $this->initializeTenancy($this->tenant1);
    $tenantDb = DB::connection()->getDatabaseName();
    $this->endTenancy();

    // After ending, should be back to default
    $currentDb = DB::connection()->getDatabaseName();

    expect($tenantDb)->not->toBe($defaultDb);
    expect($tenantDb)->toContain($this->tenant1->id);
    expect($currentDb)->toBe($defaultDb);
});

test('central user associations remain separate from tenant user data', function () {
    // Create central user
    $centralUser = CentralUser::factory()->create([
        'email' => 'user@example.com',
    ]);

    // Associate with tenant 1
    DB::table('tenant_users')->insert([
        'tenant_id' => $this->tenant1->id,
        'global_user_id' => $centralUser->global_id,
    ]);

    // Sync to tenant 1 database
    $this->initializeTenancy($this->tenant1);
    User::create([
        'global_id' => $centralUser->global_id,
        'first_name' => $centralUser->first_name,
        'last_name' => $centralUser->last_name,
        'email' => $centralUser->email,
        'password' => $centralUser->password,
    ]);
    $tenant1HasUser = User::where('global_id', $centralUser->global_id)->exists();
    $this->endTenancy();

    // Check tenant 2 does not have this user
    $this->initializeTenancy($this->tenant2);
    $tenant2HasUser = User::where('global_id', $centralUser->global_id)->exists();
    $this->endTenancy();

    // Check central database has the association
    $centralHasAssociation = DB::table('tenant_users')
        ->where('tenant_id', $this->tenant1->id)
        ->where('global_user_id', $centralUser->global_id)
        ->exists();

    expect($tenant1HasUser)->toBeTrue();
    expect($tenant2HasUser)->toBeFalse();
    expect($centralHasAssociation)->toBeTrue();
});
