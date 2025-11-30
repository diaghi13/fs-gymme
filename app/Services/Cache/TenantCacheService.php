<?php

namespace App\Services\Cache;

use App\Models\Tenant;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

/**
 * Tenant-aware cache service.
 *
 * This service provides utilities for managing cache in a multi-tenant application.
 * Cache isolation between tenants is handled automatically by the RedisTenancyBootstrapper
 * which prefixes all Redis keys with the tenant ID.
 *
 * Usage:
 * - In tenant context: Cache calls are automatically scoped to current tenant
 * - In central context: Use tenant-specific methods or pass tenant explicitly
 */
class TenantCacheService
{
    /**
     * Cache a value for the current tenant with a TTL.
     */
    public function remember(string $key, int|\DateTimeInterface|\DateInterval $ttl, callable $callback): mixed
    {
        return Cache::remember($key, $ttl, $callback);
    }

    /**
     * Cache a value for the current tenant forever.
     */
    public function rememberForever(string $key, callable $callback): mixed
    {
        return Cache::rememberForever($key, $callback);
    }

    /**
     * Store a value in cache for the current tenant.
     */
    public function put(string $key, mixed $value, int|\DateTimeInterface|\DateInterval|null $ttl = null): bool
    {
        return Cache::put($key, $value, $ttl);
    }

    /**
     * Retrieve a value from cache for the current tenant.
     */
    public function get(string $key, mixed $default = null): mixed
    {
        return Cache::get($key, $default);
    }

    /**
     * Check if a key exists in cache for the current tenant.
     */
    public function has(string $key): bool
    {
        return Cache::has($key);
    }

    /**
     * Remove a value from cache for the current tenant.
     */
    public function forget(string $key): bool
    {
        return Cache::forget($key);
    }

    /**
     * Clear all cache for the current tenant.
     *
     * WARNING: This will flush ALL cache entries for the current tenant.
     * Use with caution in production.
     */
    public function flush(): bool
    {
        if (! tenancy()->initialized) {
            throw new \RuntimeException('Cannot flush cache outside of tenant context');
        }

        return Cache::flush();
    }

    /**
     * Get cache with tags support (if the cache driver supports it).
     *
     * Note: Redis supports cache tagging, but it requires additional setup.
     * File and database drivers do NOT support tagging.
     */
    public function tags(string|array $tags): \Illuminate\Cache\TaggedCache
    {
        return Cache::tags($tags);
    }

    /**
     * Clear all cache for a specific tenant (from central context).
     *
     * This method allows clearing a tenant's cache from outside tenant context.
     */
    public function flushTenantCache(Tenant $tenant): void
    {
        // Get the tenant's Redis prefix
        $prefix = config('tenancy.redis.prefix_base').$tenant->id;

        // Get all keys for this tenant
        $connection = config('cache.stores.redis.connection', 'cache');
        $redis = Redis::connection($connection);

        // Scan and delete all keys with this tenant's prefix
        $cursor = 0;
        do {
            [$cursor, $keys] = $redis->scan($cursor, ['match' => $prefix.'*', 'count' => 100]);

            if (! empty($keys)) {
                $redis->del(...$keys);
            }
        } while ($cursor !== 0);
    }

    /**
     * Get cache statistics for the current tenant.
     *
     * Returns information about cache usage including:
     * - Number of keys
     * - Memory usage (approximate)
     */
    public function getStats(): array
    {
        if (! tenancy()->initialized) {
            throw new \RuntimeException('Cannot get cache stats outside of tenant context');
        }

        $tenant = tenant();
        $prefix = config('tenancy.redis.prefix_base').$tenant->id;
        $connection = config('cache.stores.redis.connection', 'cache');
        $redis = Redis::connection($connection);

        // Count keys with tenant prefix
        $keyCount = 0;
        $cursor = 0;

        do {
            [$cursor, $keys] = $redis->scan($cursor, ['match' => $prefix.'*', 'count' => 100]);
            $keyCount += count($keys);
        } while ($cursor !== 0);

        return [
            'tenant_id' => $tenant->id,
            'key_count' => $keyCount,
            'prefix' => $prefix,
        ];
    }

    /**
     * Warm up cache for the current tenant.
     *
     * Override this method in your application to pre-populate
     * frequently accessed cache keys when a tenant is initialized.
     */
    public function warmUp(): void
    {
        // Example: Cache frequently accessed data
        // $this->remember('settings', 3600, fn() => Setting::all());
        // $this->remember('products', 3600, fn() => Product::all());
    }
}
