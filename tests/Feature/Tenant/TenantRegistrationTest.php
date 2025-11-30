<?php

use App\Models\CentralUser;
use App\Models\Company;
use App\Models\Structure;
use App\Models\Tenant;
use App\Models\User;
use App\Services\Tenant\TenantProvisioningService;
use Illuminate\Support\Facades\Hash;

beforeEach(function () {
    // Clean up any existing data
    DB::table('tenants')->truncate();
    DB::table('users')->truncate();

    // Clean up any test tenant databases
    foreach (glob(database_path('gymme-tenant_*')) as $file) {
        if (is_file($file)) {
            @unlink($file);
        }
    }
});

afterEach(function () {
    // End any active tenancy
    if (tenancy()->initialized) {
        $this->endTenancy();
    }

    // Clean up tenant databases
    foreach (glob(database_path('gymme-tenant_*')) as $file) {
        if (is_file($file)) {
            @unlink($file);
        }
    }

    // Clear records
    DB::table('tenants')->truncate();
    DB::table('users')->truncate();
});

test('tenant registration page can be rendered', function () {
    $response = $this->get(route('tenant.register'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('central/tenant-registration'));
});

test('tenant can be registered with complete data', function () {
    $registrationData = [
        'tenant' => [
            'name' => 'Test Gym',
            'email' => 'gym@test.com',
            'phone' => '+39 123 456 7890',
            'vat_number' => 'IT12345678901',
            'tax_code' => 'TSTGYM12345678',
            'address' => 'Via Test 123',
            'city' => 'Milano',
            'postal_code' => '20100',
            'country' => 'IT',
        ],
        'user' => [
            'first_name' => 'Mario',
            'last_name' => 'Rossi',
            'email' => 'mario.rossi@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ],
        'company' => [
            'business_name' => 'Test Gym SRL',
            'tax_code' => 'TSTGYM12345678',
            'vat_number' => 'IT12345678901',
            'street' => 'Via Test',
            'number' => '123',
            'city' => 'Milano',
            'zip_code' => '20100',
            'province' => 'MI',
            'country' => 'IT',
        ],
        'structure' => [
            'name' => 'Sede Principale',
            'street' => 'Via Test',
            'number' => '123',
            'city' => 'Milano',
            'zip_code' => '20100',
            'province' => 'MI',
            'country' => 'IT',
            'phone' => '+39 123 456 7890',
            'email' => 'gym@test.com',
        ],
        'terms_accepted' => true,
    ];

    $response = $this->post(route('tenant.register.store'), $registrationData);

    $response->assertRedirect();

    // Assert tenant was created
    $tenant = Tenant::where('email', 'gym@test.com')->first();
    expect($tenant)->not->toBeNull()
        ->and($tenant->name)->toBe('Test Gym')
        ->and($tenant->is_active)->toBeTrue();

    // Assert central user was created
    $centralUser = CentralUser::where('email', 'mario.rossi@test.com')->first();
    expect($centralUser)->not->toBeNull()
        ->and($centralUser->first_name)->toBe('Mario')
        ->and($centralUser->last_name)->toBe('Rossi');

    // Assert user is associated with tenant
    expect($tenant->users()->where('global_user_id', $centralUser->global_id)->exists())->toBeTrue();

    // Assert tenant database was created and has data
    $this->initializeTenancy($tenant);

    $company = Company::first();
    expect($company)->not->toBeNull()
        ->and($company->business_name)->toBe('Test Gym SRL');

    $structure = Structure::first();
    expect($structure)->not->toBeNull()
        ->and($structure->name)->toBe('Sede Principale');

    $tenantUser = User::where('email', 'mario.rossi@test.com')->first();
    expect($tenantUser)->not->toBeNull()
        ->and($tenantUser->global_id)->toBe($centralUser->global_id);

    $this->endTenancy();
});

test('tenant registration requires all mandatory fields', function () {
    $response = $this->post(route('tenant.register.store'), []);

    $response->assertSessionHasErrors([
        'tenant.name',
        'tenant.email',
        'user.first_name',
        'user.last_name',
        'user.email',
        'user.password',
        'company.business_name',
        'company.tax_code',
        'company.vat_number',
        'company.street',
        'company.city',
        'company.zip_code',
        'structure.name',
        'structure.street',
        'structure.city',
        'structure.zip_code',
        'terms_accepted',
    ]);
});

test('tenant email must be unique', function () {
    // Create existing tenant
    Tenant::create([
        'name' => 'Existing Gym',
        'email' => 'existing@test.com',
        'is_active' => true,
    ]);

    $registrationData = [
        'tenant' => ['name' => 'New Gym', 'email' => 'existing@test.com'],
        'user' => [
            'first_name' => 'Mario',
            'last_name' => 'Rossi',
            'email' => 'newuser@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ],
        'company' => [
            'business_name' => 'Test',
            'tax_code' => 'TEST123',
            'vat_number' => 'IT123',
            'street' => 'Via Test',
            'city' => 'Milano',
            'zip_code' => '20100',
        ],
        'structure' => [
            'name' => 'Test',
            'street' => 'Via Test',
            'city' => 'Milano',
            'zip_code' => '20100',
        ],
        'terms_accepted' => true,
    ];

    $response = $this->post(route('tenant.register.store'), $registrationData);

    $response->assertSessionHasErrors('tenant.email');
});

test('user email must be unique', function () {
    // Create existing user
    CentralUser::create([
        'global_id' => \Illuminate\Support\Str::uuid(),
        'first_name' => 'Existing',
        'last_name' => 'User',
        'email' => 'existing@test.com',
        'password' => Hash::make('password'),
    ]);

    $registrationData = [
        'tenant' => ['name' => 'New Gym', 'email' => 'newgym@test.com'],
        'user' => [
            'first_name' => 'Mario',
            'last_name' => 'Rossi',
            'email' => 'existing@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ],
        'company' => [
            'business_name' => 'Test',
            'tax_code' => 'TEST123',
            'vat_number' => 'IT123',
            'street' => 'Via Test',
            'city' => 'Milano',
            'zip_code' => '20100',
        ],
        'structure' => [
            'name' => 'Test',
            'street' => 'Via Test',
            'city' => 'Milano',
            'zip_code' => '20100',
        ],
        'terms_accepted' => true,
    ];

    $response = $this->post(route('tenant.register.store'), $registrationData);

    $response->assertSessionHasErrors('user.email');
});

test('password must be confirmed', function () {
    $registrationData = [
        'tenant' => ['name' => 'Test Gym', 'email' => 'gym@test.com'],
        'user' => [
            'first_name' => 'Mario',
            'last_name' => 'Rossi',
            'email' => 'mario@test.com',
            'password' => 'password123',
            'password_confirmation' => 'different_password',
        ],
        'company' => [
            'business_name' => 'Test',
            'tax_code' => 'TEST123',
            'vat_number' => 'IT123',
            'street' => 'Via Test',
            'city' => 'Milano',
            'zip_code' => '20100',
        ],
        'structure' => [
            'name' => 'Test',
            'street' => 'Via Test',
            'city' => 'Milano',
            'zip_code' => '20100',
        ],
        'terms_accepted' => true,
    ];

    $response = $this->post(route('tenant.register.store'), $registrationData);

    $response->assertSessionHasErrors('user.password');
});

test('terms must be accepted', function () {
    $registrationData = [
        'tenant' => ['name' => 'Test Gym', 'email' => 'gym@test.com'],
        'user' => [
            'first_name' => 'Mario',
            'last_name' => 'Rossi',
            'email' => 'mario@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ],
        'company' => [
            'business_name' => 'Test',
            'tax_code' => 'TEST123',
            'vat_number' => 'IT123',
            'street' => 'Via Test',
            'city' => 'Milano',
            'zip_code' => '20100',
        ],
        'structure' => [
            'name' => 'Test',
            'street' => 'Via Test',
            'city' => 'Milano',
            'zip_code' => '20100',
        ],
        'terms_accepted' => false,
    ];

    $response = $this->post(route('tenant.register.store'), $registrationData);

    $response->assertSessionHasErrors('terms_accepted');
});

test('user is automatically logged in after registration', function () {
    $registrationData = [
        'tenant' => [
            'name' => 'Test Gym',
            'email' => 'gym@test.com',
        ],
        'user' => [
            'first_name' => 'Mario',
            'last_name' => 'Rossi',
            'email' => 'mario.rossi@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ],
        'company' => [
            'business_name' => 'Test Gym SRL',
            'tax_code' => 'TEST123',
            'vat_number' => 'IT123',
            'street' => 'Via Test',
            'city' => 'Milano',
            'zip_code' => '20100',
        ],
        'structure' => [
            'name' => 'Sede Principale',
            'street' => 'Via Test',
            'city' => 'Milano',
            'zip_code' => '20100',
        ],
        'terms_accepted' => true,
    ];

    $response = $this->post(route('tenant.register.store'), $registrationData);

    $this->assertAuthenticated();

    $user = auth()->user();
    expect($user->email)->toBe('mario.rossi@test.com');
});

test('TenantProvisioningService generates unique slug', function () {
    $service = app(TenantProvisioningService::class);

    // Create tenant with a name
    Tenant::create([
        'name' => 'Test Gym',
        'slug' => 'test-gym',
        'email' => 'test1@test.com',
        'is_active' => true,
    ]);

    // Try to create another tenant with same name
    $data = [
        'tenant' => [
            'name' => 'Test Gym',
            'email' => 'test2@test.com',
        ],
        'user' => [
            'first_name' => 'Mario',
            'last_name' => 'Rossi',
            'email' => 'mario@test.com',
            'password' => 'password123',
        ],
        'company' => [
            'business_name' => 'Test',
            'tax_code' => 'TEST123',
            'vat_number' => 'IT123',
            'street' => 'Via Test',
            'city' => 'Milano',
            'zip_code' => '20100',
        ],
        'structure' => [
            'name' => 'Test',
            'street' => 'Via Test',
            'city' => 'Milano',
            'zip_code' => '20100',
        ],
    ];

    $tenant = $service->provision($data);

    // Slug should be unique
    expect($tenant->slug)->not->toBe('test-gym')
        ->and($tenant->slug)->toMatch('/test-gym-\d+/');
});
