<?php

use App\Models\Customer\Customer;
use App\Models\Product\BaseProduct;
use App\Models\Structure;
use App\Models\Tenant;
use App\Models\User;

beforeEach(function () {
    // Create tenant for structure isolation testing
    $this->tenant = $this->createTenantWithDatabase(['name' => 'Test Tenant']);

    // Initialize tenancy and create structures and a user
    $this->initializeTenancy($this->tenant);

    $this->structure1 = Structure::create(['name' => 'Structure 1', 'address' => 'Address 1']);
    $this->structure2 = Structure::create(['name' => 'Structure 2', 'address' => 'Address 2']);

    // Create a user for authentication
    $this->user = User::create([
        'global_id' => 'test-global-id',
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'john@example.com',
        'password' => bcrypt('password'),
    ]);

    $this->endTenancy();
});

afterEach(function () {
    // Clean up tenant database
    if (isset($this->tenant)) {
        $this->tenant->delete();
    }
});

test('structure scope filters customers by current structure in session', function () {
    $this->initializeTenancy($this->tenant);

    // Create customers in different structures
    $customer1 = Customer::factory()->create([
        'first_name' => 'Customer',
        'last_name' => 'One',
        'structure_id' => $this->structure1->id,
    ]);

    $customer2 = Customer::factory()->create([
        'first_name' => 'Customer',
        'last_name' => 'Two',
        'structure_id' => $this->structure2->id,
    ]);

    // Set structure 1 in session
    session(['current_structure_id' => $this->structure1->id]);

    // Query should only return structure 1 customers
    $customers = Customer::all();

    expect($customers)->toHaveCount(1);
    expect($customers->first()->id)->toBe($customer1->id);
    expect($customers->first()->structure_id)->toBe($this->structure1->id);

    $this->endTenancy();
});

test('switching structure in session changes query results', function () {
    $this->initializeTenancy($this->tenant);

    // Create customers in different structures
    Customer::factory()->count(3)->create(['structure_id' => $this->structure1->id]);
    Customer::factory()->count(2)->create(['structure_id' => $this->structure2->id]);

    // Set structure 1 in session
    session(['current_structure_id' => $this->structure1->id]);
    $structure1Count = Customer::count();

    // Switch to structure 2
    session(['current_structure_id' => $this->structure2->id]);
    $structure2Count = Customer::count();

    expect($structure1Count)->toBe(3);
    expect($structure2Count)->toBe(2);

    $this->endTenancy();
});

test('structure_id is auto-set on customer creation from session', function () {
    $this->initializeTenancy($this->tenant);

    // Set structure in session
    session(['current_structure_id' => $this->structure1->id]);

    // Create customer without specifying structure_id
    $customer = Customer::factory()->create([
        'first_name' => 'Test',
        'last_name' => 'Customer',
    ]);

    expect($customer->structure_id)->toBe($this->structure1->id);

    $this->endTenancy();
});

test('structure_id is auto-set on product creation from session', function () {
    $this->initializeTenancy($this->tenant);

    // Set structure in session
    session(['current_structure_id' => $this->structure2->id]);

    // Create product without specifying structure_id
    $product = BaseProduct::factory()->create([
        'name' => 'Test Product',
    ]);

    expect($product->structure_id)->toBe($this->structure2->id);

    $this->endTenancy();
});

test('products are filtered by current structure', function () {
    $this->initializeTenancy($this->tenant);

    // Create products in different structures
    $product1 = BaseProduct::factory()->create([
        'name' => 'Product 1',
        'structure_id' => $this->structure1->id,
    ]);

    $product2 = BaseProduct::factory()->create([
        'name' => 'Product 2',
        'structure_id' => $this->structure2->id,
    ]);

    // Set structure 1 in session
    session(['current_structure_id' => $this->structure1->id]);

    $products = BaseProduct::all();

    expect($products)->toHaveCount(1);
    expect($products->first()->id)->toBe($product1->id);
    expect($products->first()->name)->toBe('Product 1');

    $this->endTenancy();
});

test('structure relationship is accessible on models', function () {
    $this->initializeTenancy($this->tenant);

    session(['current_structure_id' => $this->structure1->id]);

    $customer = Customer::factory()->create([
        'first_name' => 'Test',
        'last_name' => 'Customer',
        'structure_id' => $this->structure1->id,
    ]);

    expect($customer->structure)->not->toBeNull();
    expect($customer->structure->id)->toBe($this->structure1->id);
    expect($customer->structure->name)->toBe('Structure 1');

    $this->endTenancy();
});

test('can bypass structure scope with withoutGlobalScopes', function () {
    $this->initializeTenancy($this->tenant);

    // Create customers in different structures
    Customer::factory()->count(3)->create(['structure_id' => $this->structure1->id]);
    Customer::factory()->count(2)->create(['structure_id' => $this->structure2->id]);

    // Set structure in session
    session(['current_structure_id' => $this->structure1->id]);

    // With scope: should only see structure 1 customers
    $scopedCustomers = Customer::all();
    expect($scopedCustomers)->toHaveCount(3);

    // Without scopes: should see all customers
    $allCustomers = Customer::withoutGlobalScopes()->get();
    expect($allCustomers)->toHaveCount(5);

    $this->endTenancy();
});

test('explicitly setting structure_id overrides session value', function () {
    $this->initializeTenancy($this->tenant);

    // Set structure 1 in session
    session(['current_structure_id' => $this->structure1->id]);

    // Create customer with explicit structure_id
    $customer = Customer::factory()->create([
        'first_name' => 'Test',
        'last_name' => 'Customer',
        'structure_id' => $this->structure2->id,
    ]);

    // Should use explicit value, not session
    expect($customer->structure_id)->toBe($this->structure2->id);

    $this->endTenancy();
});
