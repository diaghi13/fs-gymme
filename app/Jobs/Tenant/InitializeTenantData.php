<?php

namespace App\Jobs\Tenant;

use App\Models\CentralUser;
use App\Models\Tenant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Stancl\Tenancy\Contracts\TenantWithDatabase;

/**
 * Initialize tenant data after database creation.
 *
 * This job runs as part of the tenant provisioning pipeline and handles:
 * - Company creation with fiscal data
 * - Structure creation (can be same as company)
 * - Admin user creation in tenant database
 * - Role assignment
 * - Demo data seeding (if demo tenant)
 * - System configuration seeding
 *
 * NOTE: Does NOT implement ShouldQueue because it runs inside JobPipeline
 * which handles queuing at the pipeline level, not individual job level.
 */
class InitializeTenantData
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public TenantWithDatabase $tenant
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        tenancy()->initialize($this->tenant);

        try {
            Log::info('[InitializeTenantData:46] Initializing tenant data', [
                'tenant_id' => $this->tenant->id,
                'is_demo' => $this->tenant->is_demo,
            ]);

            // Get registration data from tenant metadata
            $registrationData = $this->tenant->registration_data ?? [];
            Log::info('[InitializeTenantData:52] Registration data retrieved', [
                'tenant_id' => $this->tenant->id,
                'has_registration_data' => ! empty($registrationData),
                'data_field' => $this->tenant->registration_data,
            ]);

            // Associate central user with tenant (for async provisioning)
            // This needs to happen here because the tenant database must exist first
            if (! empty($registrationData['user']['email'])) {
                $this->attachCentralUserToTenant($registrationData['user']['email']);
            }

            if ($this->tenant->is_demo) {
                $this->initializeDemoTenant();
            } else {
                $this->initializePaidTenant($registrationData);
                // Run system configuration seeding for paid tenants only
                // Demo tenants get this from DemoSeeder
                $this->seedSystemConfiguration();
            }

            // Mark tenant provisioning as completed (ready to use)
            tenancy()->end(); // Exit tenant context to update central database
            $this->tenant->markProvisioningComplete();
            tenancy()->initialize($this->tenant); // Re-enter tenant context

            Log::info('Tenant provisioning completed successfully', [
                'tenant_id' => $this->tenant->id,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to initialize tenant data', [
                'tenant_id' => $this->tenant->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Mark provisioning as failed
            tenancy()->end();
            $this->tenant->markProvisioningFailed($e->getMessage());

            throw $e;
        } finally {
            tenancy()->end();
        }
    }

    /**
     * Initialize demo tenant with fake data.
     */
    protected function initializeDemoTenant(): void
    {
        // Note: Company data is stored in the central tenant table, not in tenant database
        // Create primary structure in the tenant database
        \DB::table('structures')->insert([
            'name' => $this->tenant->name,
            'street' => $this->tenant->address,
            'number' => null,
            'city' => $this->tenant->city,
            'zip_code' => $this->tenant->postal_code,
            'province' => $this->tenant->province,
            'country' => $this->tenant->country,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create a second demo structure for more realistic demo data
        \DB::table('structures')->insert([
            'name' => $this->tenant->name.' - Sede Secondaria',
            'street' => 'Via Secondaria '.rand(1, 100),
            'number' => (string) rand(1, 200),
            'city' => 'Roma',
            'zip_code' => '00100',
            'province' => 'RM',
            'country' => 'IT',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Admin user is created automatically by attachCentralUserToTenant()
        // No need to create it manually here

        // Seed demo data with examples
        $this->seedDemoData();
    }

    /**
     * Initialize paid tenant with real registration data.
     */
    protected function initializePaidTenant(array $data): void
    {
        if (empty($data)) {
            Log::warning('No registration data found for paid tenant', [
                'tenant_id' => $this->tenant->id,
            ]);

            return;
        }

        // Note: Company data is stored in the central tenant table, not in tenant database
        // Create structure (check if same as company)
        $structureData = $data['structure'] ?? [];
        $sameAsCompany = $structureData['same_as_company'] ?? false;

        if ($sameAsCompany) {
            // Use tenant (company) data for structure
            \DB::table('structures')->insert([
                'name' => $this->tenant->name,
                'street' => $this->tenant->address,
                'number' => null,
                'city' => $this->tenant->city,
                'zip_code' => $this->tenant->postal_code,
                'province' => $this->tenant->province,
                'country' => $this->tenant->country,
                'phone' => $this->tenant->phone,
                'email' => $this->tenant->email,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            // Use structure-specific data
            \DB::table('structures')->insert([
                'name' => $structureData['name'],
                'street' => $structureData['street'],
                'number' => $structureData['number'] ?? null,
                'city' => $structureData['city'],
                'zip_code' => $structureData['zip_code'],
                'province' => $structureData['province'] ?? null,
                'country' => $structureData['country'] ?? 'IT',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Admin user is created automatically by attachCentralUserToTenant()
        // No need to create it manually here
    }

    /**
     * Attach central user to tenant using Stancl's automatic syncing.
     * This creates the user in the tenant database and assigns the owner role.
     * This is needed for async provisioning where the tenant database must exist first.
     */
    protected function attachCentralUserToTenant(string $email): void
    {
        try {
            // Temporarily end tenancy to access central database
            tenancy()->end();

            // Find central user by email in central database
            $centralUser = CentralUser::where('email', $email)->first();

            if (! $centralUser) {
                Log::error('[InitializeTenantData:190] Central user not found for attach', [
                    'tenant_id' => $this->tenant->id,
                    'email' => $email,
                ]);

                // Re-initialize tenancy before returning
                tenancy()->initialize($this->tenant);

                return;
            }

            // Check if already attached (in central database)
            $alreadyAttached = $this->tenant->users()
                ->where('global_id', $centralUser->global_id)
                ->exists();

            if (! $alreadyAttached) {
                // Attach user to tenant - Stancl automatically copies user to tenant database
                $centralUser->tenants()->attach($this->tenant->id, [
                    'global_user_id' => $centralUser->global_id,
                ]);

                Log::info('[InitializeTenantData] Central user attached to tenant', [
                    'tenant_id' => $this->tenant->id,
                    'user_global_id' => $centralUser->global_id,
                    'email' => $email,
                ]);
            } else {
                Log::info('[InitializeTenantData] Central user already attached to tenant (skipping)', [
                    'tenant_id' => $this->tenant->id,
                    'user_global_id' => $centralUser->global_id,
                ]);
            }

            // Re-initialize tenancy to access tenant database
            tenancy()->initialize($this->tenant);

            // Assign owner role to the user in the tenant database
            $tenantUser = \App\Models\User::where('global_id', $centralUser->global_id)->first();

            if ($tenantUser) {
                $ownerRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'owner']);
                $tenantUser->assignRole($ownerRole);

                Log::info('[InitializeTenantData:236] Owner role assigned to tenant user', [
                    'tenant_id' => $this->tenant->id,
                    'user_id' => $tenantUser->id,
                    'global_id' => $centralUser->global_id,
                ]);
            } else {
                Log::error('[InitializeTenantData:243] Tenant user not found after attach', [
                    'tenant_id' => $this->tenant->id,
                    'global_id' => $centralUser->global_id,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('[InitializeTenantData:294] Failed to attach central user to tenant', [
                'tenant_id' => $this->tenant->id,
                'email' => $email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Seed demo data with examples (customers, products, sales, etc).
     * Uses the comprehensive DemoSeeder which includes system config + operational data.
     */
    protected function seedDemoData(): void
    {
        if (class_exists(\Database\Seeders\Tenant\DemoSeeder::class)) {
            Artisan::call('db:seed', [
                '--class' => 'Database\\Seeders\\Tenant\\DemoSeeder',
                '--force' => true,
            ]);

            Log::info('Demo data seeded successfully', [
                'tenant_id' => $this->tenant->id,
            ]);
        } else {
            Log::warning('DemoSeeder not found, skipping demo data', [
                'tenant_id' => $this->tenant->id,
            ]);
        }
    }

    /**
     * Seed system configuration (IVA, payment methods, document types, etc).
     * This runs for ALL tenants (demo and paid).
     */
    protected function seedSystemConfiguration(): void
    {
        // Run system seeders that setup default configurations
        $systemSeeders = [
            \Database\Seeders\Tenant\VatRateSeeder::class,
            \Database\Seeders\Tenant\PaymentMethodSeeder::class,
            \Database\Seeders\Tenant\PaymentConditionSeeder::class,
            \Database\Seeders\Tenant\FinancialResourceTypeSeeder::class,
            \Database\Seeders\Tenant\DocumentTypeSeeder::class,
        ];

        foreach ($systemSeeders as $seeder) {
            if (class_exists($seeder)) {
                Artisan::call('db:seed', [
                    '--class' => $seeder,
                    '--force' => true,
                ]);
            }
        }

        Log::info('System configuration seeded', [
            'tenant_id' => $this->tenant->id,
        ]);
    }
}
