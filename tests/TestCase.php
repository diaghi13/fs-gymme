<?php

namespace Tests;

use App\Models\CentralUser;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;

abstract class TestCase extends BaseTestCase
{
    /**
     * Define database migrations paths to exclude tenant migrations from automatic loading.
     */
    protected function defineDatabaseMigrations(): void
    {
        // Load only central migrations, not tenant migrations
        // Tenant migrations will be run manually when initializing tenants in tests
        $this->loadMigrationsFrom(database_path('migrations'));
    }

    /**
     * Create a tenant with its database and optionally add a user.
     * Manually creates the database to have full control during tests.
     */
    protected function createTenantWithDatabase(array $attributes = [], ?CentralUser $user = null): Tenant
    {
        // Temporarily disable only TenantCreated event to have manual control over DB creation
        Event::fake([\Stancl\Tenancy\Events\TenantCreated::class]);

        // Create tenant without triggering TenantCreated event
        $tenant = Tenant::factory()->create($attributes);

        // For SQLite, create the database file (for MySQL this would be CREATE DATABASE)
        $dbPath = database_path('gymme-tenant_'.$tenant->id.'.sqlite');
        touch($dbPath);

        // Initialize tenant context
        tenancy()->initialize($tenant);

        // Run migrations for the tenant
        $this->artisan('migrate', [
            '--path' => 'database/migrations/tenant',
            '--force' => true,
        ]);

        // End tenant context
        tenancy()->end();

        // Add user to tenant if provided
        if ($user) {
            DB::table('tenant_users')->insert([
                'tenant_id' => $tenant->id,
                'global_user_id' => $user->global_id,
            ]);
        }

        return $tenant;
    }

    /**
     * Initialize tenancy context for a specific tenant.
     */
    protected function initializeTenancy(Tenant $tenant): void
    {
        // Disconnect any existing tenant connection to ensure clean state
        DB::disconnect('tenant');

        tenancy()->initialize($tenant);
    }

    /**
     * End tenancy context.
     */
    protected function endTenancy(): void
    {
        tenancy()->end();

        // Disconnect tenant connection to ensure clean state
        DB::disconnect('tenant');
    }

    /**
     * Create a user in both central and tenant database.
     */
    protected function createUserForTenant(Tenant $tenant, array $attributes = []): CentralUser
    {
        // Create central user
        $centralUser = CentralUser::factory()->create($attributes);

        // Add to tenant
        DB::connection('central')->table('tenant_users')->insert([
            'tenant_id' => $tenant->id,
            'global_user_id' => $centralUser->global_id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Sync to tenant database
        $this->initializeTenancy($tenant);
        \App\Models\User::create([
            'global_id' => $centralUser->global_id,
            'first_name' => $centralUser->first_name,
            'last_name' => $centralUser->last_name,
            'email' => $centralUser->email,
            'password' => $centralUser->password,
        ]);
        $this->endTenancy();

        return $centralUser;
    }

    /**
     * Assert that a table exists in the tenant database.
     */
    protected function assertTenantTableExists(string $table): void
    {
        $this->assertTrue(
            \Illuminate\Support\Facades\Schema::hasTable($table),
            "Table {$table} does not exist in tenant database"
        );
    }

    /**
     * Assert that data exists only in the current tenant database.
     */
    protected function assertTenantDatabaseHas(string $table, array $data): void
    {
        $this->assertDatabaseHas($table, $data);
    }

    /**
     * Assert that data does not exist in the current tenant database.
     */
    protected function assertTenantDatabaseMissing(string $table, array $data): void
    {
        $this->assertDatabaseMissing($table, $data);
    }
}
