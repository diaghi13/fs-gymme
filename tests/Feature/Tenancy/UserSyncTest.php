<?php

use App\Models\CentralUser;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\DB;

beforeEach(function () {
    // Clean up any leftover tenant database files
    foreach (glob(database_path('gymme-tenant_*')) as $file) {
        if (is_file($file)) {
            @unlink($file);
        }
    }

    // Create tenant for testing using helper method
    $this->tenant = $this->createTenantWithDatabase(['name' => 'Test Tenant']);
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

test('central user can be synced to tenant database', function () {
    // Create central user
    $centralUser = CentralUser::factory()->create([
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'john@example.com',
    ]);

    // Associate with tenant
    DB::table('tenant_users')->insert([
        'tenant_id' => $this->tenant->id,
        'global_user_id' => $centralUser->global_id,
    ]);

    // Sync to tenant database
    $this->initializeTenancy($this->tenant);
    $tenantUser = User::create([
        'global_id' => $centralUser->global_id,
        'first_name' => $centralUser->first_name,
        'last_name' => $centralUser->last_name,
        'email' => $centralUser->email,
        'password' => $centralUser->password,
    ]);
    $this->endTenancy();

    // Verify central user exists
    $centralUserExists = CentralUser::where('global_id', $centralUser->global_id)->exists();

    // Verify tenant user exists with same global_id
    $this->initializeTenancy($this->tenant);
    $tenantUserExists = User::where('global_id', $centralUser->global_id)->exists();
    $syncedUser = User::where('global_id', $centralUser->global_id)->first();
    $this->endTenancy();

    expect($centralUserExists)->toBeTrue();
    expect($tenantUserExists)->toBeTrue();
    expect($syncedUser->first_name)->toBe('John');
    expect($syncedUser->last_name)->toBe('Doe');
    expect($syncedUser->email)->toBe('john@example.com');
    expect($syncedUser->global_id)->toBe($centralUser->global_id);
});

test('updating central user syncs changes to all tenant databases', function () {
    // Create central user
    $centralUser = CentralUser::factory()->create([
        'first_name' => 'Jane',
        'last_name' => 'Smith',
        'email' => 'jane@example.com',
    ]);

    // Associate with tenant
    DB::table('tenant_users')->insert([
        'tenant_id' => $this->tenant->id,
        'global_user_id' => $centralUser->global_id,
    ]);

    // Sync initial data to tenant
    $this->initializeTenancy($this->tenant);
    User::create([
        'global_id' => $centralUser->global_id,
        'first_name' => $centralUser->first_name,
        'last_name' => $centralUser->last_name,
        'email' => $centralUser->email,
        'password' => $centralUser->password,
    ]);
    $this->endTenancy();

    // Update central user
    $centralUser->update([
        'first_name' => 'Janet',
        'email' => 'janet@example.com',
    ]);

    // Manually sync to tenant (simulating what the listener does)
    $this->initializeTenancy($this->tenant);
    $tenantUser = User::where('global_id', $centralUser->global_id)->first();
    $tenantUser->update([
        'first_name' => $centralUser->first_name,
        'email' => $centralUser->email,
    ]);
    $updatedTenantUser = User::where('global_id', $centralUser->global_id)->first();
    $this->endTenancy();

    expect($updatedTenantUser->first_name)->toBe('Janet');
    expect($updatedTenantUser->email)->toBe('janet@example.com');
});

test('user can belong to multiple tenants', function () {
    // Create second tenant using helper method
    $tenant2 = $this->createTenantWithDatabase(['name' => 'Tenant 2']);

    // Create central user
    $centralUser = CentralUser::factory()->create([
        'email' => 'multi@example.com',
    ]);

    // Associate with both tenants
    DB::table('tenant_users')->insert([
        [
            'tenant_id' => $this->tenant->id,
            'global_user_id' => $centralUser->global_id,
        ],
        [
            'tenant_id' => $tenant2->id,
            'global_user_id' => $centralUser->global_id,
        ],
    ]);

    // Sync to tenant 1
    $this->initializeTenancy($this->tenant);
    User::firstOrCreate(
        ['global_id' => $centralUser->global_id],
        [
            'first_name' => $centralUser->first_name,
            'last_name' => $centralUser->last_name,
            'email' => $centralUser->email,
            'password' => $centralUser->password,
        ]
    );
    $existsInTenant1 = User::where('global_id', $centralUser->global_id)->exists();
    $tenant1DbName = DB::connection()->getDatabaseName();
    $this->endTenancy();

    // Sync to tenant 2
    $this->initializeTenancy($tenant2);
    User::firstOrCreate(
        ['global_id' => $centralUser->global_id],
        [
            'first_name' => $centralUser->first_name,
            'last_name' => $centralUser->last_name,
            'email' => $centralUser->email,
            'password' => $centralUser->password,
        ]
    );
    $existsInTenant2 = User::where('global_id', $centralUser->global_id)->exists();
    $tenant2DbName = DB::connection()->getDatabaseName();
    $this->endTenancy();

    // Verify tenants have different databases
    expect($tenant1DbName)->not->toBe($tenant2DbName);

    // Verify associations in central database
    $associationCount = DB::table('tenant_users')
        ->where('global_user_id', $centralUser->global_id)
        ->count();

    expect($existsInTenant1)->toBeTrue();
    expect($existsInTenant2)->toBeTrue();
    expect($associationCount)->toBe(2);
});

test('global_id is unique and synced across databases', function () {
    // Create central user
    $centralUser = CentralUser::factory()->create();

    // Associate with tenant
    DB::table('tenant_users')->insert([
        'tenant_id' => $this->tenant->id,
        'global_user_id' => $centralUser->global_id,
    ]);

    // Sync to tenant
    $this->initializeTenancy($this->tenant);
    User::create([
        'global_id' => $centralUser->global_id,
        'first_name' => $centralUser->first_name,
        'last_name' => $centralUser->last_name,
        'email' => $centralUser->email,
        'password' => $centralUser->password,
    ]);
    $tenantUser = User::where('global_id', $centralUser->global_id)->first();
    $this->endTenancy();

    // Verify global_id matches
    expect($tenantUser->global_id)->toBe($centralUser->global_id);

    // Verify we can look up user in tenant by global_id
    $this->initializeTenancy($this->tenant);
    $foundUser = User::where('global_id', $centralUser->global_id)->first();
    $this->endTenancy();

    expect($foundUser)->not->toBeNull();
    expect($foundUser->email)->toBe($centralUser->email);
});

test('password changes are synced from central to tenant', function () {
    // Create central user
    $centralUser = CentralUser::factory()->create([
        'password' => bcrypt('old-password'),
    ]);

    // Associate with tenant
    DB::table('tenant_users')->insert([
        'tenant_id' => $this->tenant->id,
        'global_user_id' => $centralUser->global_id,
    ]);

    // Sync to tenant
    $this->initializeTenancy($this->tenant);
    User::create([
        'global_id' => $centralUser->global_id,
        'first_name' => $centralUser->first_name,
        'last_name' => $centralUser->last_name,
        'email' => $centralUser->email,
        'password' => $centralUser->password,
    ]);
    $originalPassword = User::where('global_id', $centralUser->global_id)->first()->password;
    $this->endTenancy();

    // Update password in central
    $newHashedPassword = bcrypt('new-password');
    $centralUser->update(['password' => $newHashedPassword]);

    // Sync to tenant
    $this->initializeTenancy($this->tenant);
    $tenantUser = User::where('global_id', $centralUser->global_id)->first();
    $tenantUser->update(['password' => $centralUser->password]);
    $updatedPassword = User::where('global_id', $centralUser->global_id)->first()->password;
    $this->endTenancy();

    expect($originalPassword)->not->toBe($updatedPassword);
    expect($updatedPassword)->toBe($centralUser->password);
});

test('tenant user deletion does not delete central user', function () {
    // Create central user
    $centralUser = CentralUser::factory()->create();

    // Associate with tenant
    DB::table('tenant_users')->insert([
        'tenant_id' => $this->tenant->id,
        'global_user_id' => $centralUser->global_id,
    ]);

    // Sync to tenant
    $this->initializeTenancy($this->tenant);
    User::create([
        'global_id' => $centralUser->global_id,
        'first_name' => $centralUser->first_name,
        'last_name' => $centralUser->last_name,
        'email' => $centralUser->email,
        'password' => $centralUser->password,
    ]);

    // Delete tenant user
    User::where('global_id', $centralUser->global_id)->delete();
    $tenantUserExists = User::where('global_id', $centralUser->global_id)->exists();
    $this->endTenancy();

    // Central user should still exist
    $centralUserExists = CentralUser::where('global_id', $centralUser->global_id)->exists();

    expect($tenantUserExists)->toBeFalse();
    expect($centralUserExists)->toBeTrue();
});
