<?php

use App\Models\Tenant;
use App\Services\Cache\TenantCacheService;
use Illuminate\Support\Facades\Cache;

beforeEach(function () {
    // Clear any existing cache before each test
    Cache::flush();
});

afterEach(function () {
    // End any active tenancy
    if (tenancy()->initialized) {
        $this->endTenancy();
    }

    // Clean up cache after each test
    Cache::flush();

    // Clean up any test tenant databases
    foreach (glob(database_path('gymme-tenant_*')) as $file) {
        if (is_file($file)) {
            @unlink($file);
        }
    }

    // Clear tenant records
    DB::table('tenants')->truncate();
});

test('cache is isolated between tenants', function () {
    // Create two tenants
    $tenant1 = $this->createTenantWithDatabase(['name' => 'Tenant 1']);
    $tenant2 = $this->createTenantWithDatabase(['name' => 'Tenant 2']);

    // Set cache for tenant 1
    $this->initializeTenancy($tenant1);
    Cache::put('test_key', 'value_tenant_1', 60);
    $tenant1Value = Cache::get('test_key');
    $this->endTenancy();

    // Set cache for tenant 2
    $this->initializeTenancy($tenant2);
    Cache::put('test_key', 'value_tenant_2', 60);
    $tenant2Value = Cache::get('test_key');
    $this->endTenancy();

    // Verify both tenants have different cached values
    expect($tenant1Value)->toBe('value_tenant_1')
        ->and($tenant2Value)->toBe('value_tenant_2');

    // Verify tenant 1 still has its value
    $this->initializeTenancy($tenant1);
    expect(Cache::get('test_key'))->toBe('value_tenant_1');
    $this->endTenancy();
});

test('TenantCacheService remember method works correctly', function () {
    $tenant = $this->createTenantWithDatabase(['name' => 'Test Tenant']);
    $this->initializeTenancy($tenant);

    $cacheService = app(TenantCacheService::class);

    // First call - should execute callback
    $callCount = 0;
    $value = $cacheService->remember('test_key', 60, function () use (&$callCount) {
        $callCount++;

        return 'cached_value';
    });

    expect($value)->toBe('cached_value')
        ->and($callCount)->toBe(1);

    // Second call - should use cached value
    $value = $cacheService->remember('test_key', 60, function () use (&$callCount) {
        $callCount++;

        return 'cached_value';
    });

    expect($value)->toBe('cached_value')
        ->and($callCount)->toBe(1); // Callback should not be executed again

    $this->endTenancy();
});

test('TenantCacheService flush only clears current tenant cache', function () {
    $tenant1 = $this->createTenantWithDatabase(['name' => 'Tenant 1']);
    $tenant2 = $this->createTenantWithDatabase(['name' => 'Tenant 2']);

    $cacheService = app(TenantCacheService::class);

    // Set cache for both tenants
    $this->initializeTenancy($tenant1);
    $cacheService->put('key1', 'value1', 60);
    $this->endTenancy();

    $this->initializeTenancy($tenant2);
    $cacheService->put('key2', 'value2', 60);
    $this->endTenancy();

    // Flush tenant1 cache
    $this->initializeTenancy($tenant1);
    $cacheService->flush();
    $this->endTenancy();

    // Verify tenant1 cache is cleared
    $this->initializeTenancy($tenant1);
    expect($cacheService->has('key1'))->toBeFalse();
    $this->endTenancy();

    // Verify tenant2 cache is still there
    $this->initializeTenancy($tenant2);
    expect($cacheService->has('key2'))->toBeTrue()
        ->and($cacheService->get('key2'))->toBe('value2');
    $this->endTenancy();
});

test('TenantCacheService can get cache statistics', function () {
    $tenant = $this->createTenantWithDatabase(['name' => 'Test Tenant']);
    $this->initializeTenancy($tenant);

    $cacheService = app(TenantCacheService::class);

    // Add some cache entries
    $cacheService->put('key1', 'value1', 60);
    $cacheService->put('key2', 'value2', 60);
    $cacheService->put('key3', 'value3', 60);

    $stats = $cacheService->getStats();

    expect($stats)
        ->toHaveKey('tenant_id')
        ->toHaveKey('key_count')
        ->toHaveKey('prefix')
        ->and($stats['tenant_id'])->toBe($tenant->id)
        ->and($stats['key_count'])->toBeGreaterThanOrEqual(3);

    $this->endTenancy();
});

test('TenantCacheService flushTenantCache can clear specific tenant cache from central context', function () {
    $tenant1 = $this->createTenantWithDatabase(['name' => 'Tenant 1']);
    $tenant2 = $this->createTenantWithDatabase(['name' => 'Tenant 2']);

    $cacheService = app(TenantCacheService::class);

    // Set cache for both tenants
    $this->initializeTenancy($tenant1);
    Cache::put('key1', 'value1', 60);
    $this->endTenancy();

    $this->initializeTenancy($tenant2);
    Cache::put('key2', 'value2', 60);
    $this->endTenancy();

    // Flush tenant1 cache from central context
    $cacheService->flushTenantCache($tenant1);

    // Verify tenant1 cache is cleared
    $this->initializeTenancy($tenant1);
    expect(Cache::has('key1'))->toBeFalse();
    $this->endTenancy();

    // Verify tenant2 cache is still there
    $this->initializeTenancy($tenant2);
    expect(Cache::has('key2'))->toBeTrue();
    $this->endTenancy();
});

test('cache facade calls are automatically tenant-scoped', function () {
    $tenant1 = $this->createTenantWithDatabase(['name' => 'Tenant 1']);
    $tenant2 = $this->createTenantWithDatabase(['name' => 'Tenant 2']);

    // Use Cache facade directly (not TenantCacheService)
    $this->initializeTenancy($tenant1);
    Cache::put('shared_key', 'tenant1_value', 60);
    $this->endTenancy();

    $this->initializeTenancy($tenant2);
    Cache::put('shared_key', 'tenant2_value', 60);
    $this->endTenancy();

    // Verify each tenant sees its own value
    $this->initializeTenancy($tenant1);
    expect(Cache::get('shared_key'))->toBe('tenant1_value');
    $this->endTenancy();

    $this->initializeTenancy($tenant2);
    expect(Cache::get('shared_key'))->toBe('tenant2_value');
    $this->endTenancy();
});

test('rememberForever caches permanently for tenant', function () {
    $tenant = $this->createTenantWithDatabase(['name' => 'Test Tenant']);
    $this->initializeTenancy($tenant);

    $cacheService = app(TenantCacheService::class);

    $callCount = 0;
    $value = $cacheService->rememberForever('permanent_key', function () use (&$callCount) {
        $callCount++;

        return 'permanent_value';
    });

    expect($value)->toBe('permanent_value')
        ->and($callCount)->toBe(1);

    // Value should still be cached
    $value = $cacheService->rememberForever('permanent_key', function () use (&$callCount) {
        $callCount++;

        return 'permanent_value';
    });

    expect($value)->toBe('permanent_value')
        ->and($callCount)->toBe(1); // Should not increment

    $this->endTenancy();
});

test('forget removes key from tenant cache', function () {
    $tenant = $this->createTenantWithDatabase(['name' => 'Test Tenant']);
    $this->initializeTenancy($tenant);

    $cacheService = app(TenantCacheService::class);

    $cacheService->put('temp_key', 'temp_value', 60);
    expect($cacheService->has('temp_key'))->toBeTrue();

    $cacheService->forget('temp_key');
    expect($cacheService->has('temp_key'))->toBeFalse();

    $this->endTenancy();
});

test('cache isolation works with complex data structures', function () {
    $tenant1 = $this->createTenantWithDatabase(['name' => 'Tenant 1']);
    $tenant2 = $this->createTenantWithDatabase(['name' => 'Tenant 2']);

    $data1 = [
        'users' => ['alice', 'bob'],
        'settings' => ['theme' => 'dark', 'lang' => 'en'],
    ];

    $data2 = [
        'users' => ['charlie', 'david'],
        'settings' => ['theme' => 'light', 'lang' => 'it'],
    ];

    $this->initializeTenancy($tenant1);
    Cache::put('complex_data', $data1, 60);
    $this->endTenancy();

    $this->initializeTenancy($tenant2);
    Cache::put('complex_data', $data2, 60);
    $this->endTenancy();

    // Verify each tenant gets its own data
    $this->initializeTenancy($tenant1);
    expect(Cache::get('complex_data'))->toBe($data1);
    $this->endTenancy();

    $this->initializeTenancy($tenant2);
    expect(Cache::get('complex_data'))->toBe($data2);
    $this->endTenancy();
});
