<?php

namespace App\Services\Tenant;

use App\Models\CentralUser;
use App\Models\Company;
use App\Models\Structure;
use App\Models\SubscriptionPlan;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Service for provisioning new tenants with all necessary setup.
 *
 * This service handles the complete tenant registration flow:
 * 1. Create tenant in central database
 * 2. Create tenant database
 * 3. Run migrations on tenant database
 * 4. Create central user
 * 5. Associate user with tenant
 * 6. Create initial tenant data (company, structure, admin user)
 * 7. Assign trial subscription plan (if available)
 */
class TenantProvisioningService
{
    /**
     * Provision a new tenant with all initial setup.
     *
     * This method creates the tenant and central user synchronously,
     * then delegates database setup and data initialization to the
     * async JobPipeline configured in TenancyServiceProvider.
     *
     * @param  array  $data  Tenant registration data
     * @param  bool  $isDemo  Whether this is a demo tenant
     * @param  string  $paymentMethod  Payment method (stripe, bank_transfer, manual)
     * @return Tenant The created tenant
     *
     * @throws \Exception If provisioning fails
     */
    public function provision(array $data, bool $isDemo = false, string $paymentMethod = 'stripe'): Tenant
    {
        return \DB::transaction(function () use ($data, $isDemo, $paymentMethod) {
            \Log::info('[TenantProvisioningService] Starting tenant provisioning', [
                'email' => $data['user']['email'],
                'is_demo' => $isDemo,
            ]);

            // 1. Create user in central database FIRST (before tenant creation)
            // This is critical because TenantCreated event fires JobPipeline immediately
            $centralUser = $this->createCentralUser($data['user']);
            $centralUser->assignRole(['admin', 'manager']); // Assign default roles

            \Log::info('[TenantProvisioningService] CentralUser created', [
                'global_id' => $centralUser->global_id,
                'email' => $centralUser->email,
            ]);

            // 2. Create tenant in central database with registration data
            // This triggers TenantCreated event which queues JobPipeline
            $tenant = $this->createTenant($data, $isDemo);

            // Mark provisioning as in progress
            $tenant->markProvisioningInProgress();

            // 3. DO NOT attach user here - it will be done in InitializeTenantData
            // Attaching here causes Stancl to try syncing to tenant DB which doesn't exist yet

            // 4. Create domain for tenant
            $this->createTenantDomain($tenant);

            \Log::info('[TenantProvisioningService] Tenant provisioning queued', [
                'tenant_id' => $tenant->id,
                'tenant_name' => $tenant->name,
                'user_global_id' => $centralUser->global_id,
            ]);

            // Note: The JobPipeline (TenancyServiceProvider) will handle:
            // - Database creation (Jobs\CreateDatabase)
            // - Migrations (Jobs\MigrateDatabase)
            // - Data initialization (InitializeTenantData job)
            // When shouldBeQueued = true, jobs start AFTER this transaction commits
            // This ensures CentralUser is available when InitializeTenantData runs

            return $tenant;
        });
    }

    /**
     * Create tenant in central database.
     */
    protected function createTenant(array $data, bool $isDemo = false): Tenant
    {
        // For demo: use fake realistic data
        // For paid: use company business_name
        if ($isDemo) {
            // Generate realistic demo name
            $demoNames = [
                'Palestra Fitness Demo',
                'Centro Sportivo Demo',
                'Gym Evolution Demo',
                'FitClub Demo',
                'Athletic Center Demo',
            ];
            $name = $demoNames[array_rand($demoNames)].' '.Str::random(4);
            $email = $data['user']['email'];
            $slug = $this->generateUniqueSlug($name);

            $demoDays = config('demo.duration_days', 14);

            $tenantData = [
                'name' => $name,
                'slug' => $slug,
                'email' => $email,
                'phone' => '+39 02 '.rand(1000000, 9999999),
                'vat_number' => '0'.rand(1000000, 9999999).'000',
                'tax_code' => 'DMO'.rand(10000, 99999).'00A',
                'address' => 'Via Demo '.rand(1, 100),
                'city' => 'Milano',
                'province' => 'MI',
                'postal_code' => '20100',
                'country' => 'IT',
                'pec_email' => 'demo.'.Str::random(8).'@pec.it',
                'sdi_code' => Str::upper(Str::random(7)),
                'is_active' => true,
                'is_demo' => true,
                'demo_expires_at' => now()->addDays($demoDays),
                'registration_data' => $data, // Stancl stores this in data JSON automatically
            ];
        } else {
            $name = $data['company']['business_name'];
            $email = $data['company']['email'];
            $slug = $this->generateUniqueSlug($name);

            $tenantData = [
                'name' => $name,
                'slug' => $slug,
                'email' => $email,
                'phone' => $data['company']['phone'] ?? null,
                'vat_number' => $data['company']['vat_number'] ?? null,
                'tax_code' => $data['company']['tax_code'] ?? null,
                'address' => ($data['company']['street'] ?? '').' '.($data['company']['number'] ?? ''),
                'city' => $data['company']['city'] ?? null,
                'province' => $data['company']['province'] ?? null,
                'postal_code' => $data['company']['zip_code'] ?? null,
                'country' => $data['company']['country'] ?? 'IT',
                'pec_email' => $data['company']['pec_email'] ?? null,
                'sdi_code' => $data['company']['sdi_code'] ?? null,
                'is_active' => true,
                'is_demo' => false,
                'registration_data' => $data, // Stancl stores this in data JSON automatically
            ];
        }

        return Tenant::create($tenantData);
    }

    /**
     * Create tenant domain.
     */
    protected function createTenantDomain(Tenant $tenant): void
    {
        // Get the central domain from tenancy config
        $centralDomain = config('tenancy.central_domains')[0] ?? 'localhost';

        $tenant->domains()->create([
            'domain' => $tenant->slug.'.'.$centralDomain,
        ]);
    }

    /**
     * Setup tenant database (create + migrate).
     */
    protected function setupTenantDatabase(Tenant $tenant): void
    {
        // Create the database
        $tenant->createDatabase();

        // Run migrations
        Artisan::call('tenants:migrate', [
            '--tenants' => [$tenant->id],
        ]);
    }

    /**
     * Create central user.
     */
    protected function createCentralUser(array $data): CentralUser
    {
        $user = CentralUser::create([
            'global_id' => Str::uuid(),
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            // 'email_verified_at' => now(), // Auto-verify for self-registration
        ]);

        // $user->assignRole(['admin', 'manager']); // Assign default 'user' role

        return $user;
    }

    /**
     * Associate user with tenant.
     */
    protected function associateUserWithTenant(CentralUser $user, Tenant $tenant): void
    {
        $tenant->users()->attach($user->global_id, [
            'global_user_id' => $user->global_id,
            'role' => 'owner', // Owner role for the first user
        ]);
    }

    /**
     * Initialize tenant-specific data (company, structure, admin user).
     */
    protected function initializeTenantData(Tenant $tenant, array $data, bool $isDemo = false): void
    {
        tenancy()->initialize($tenant);

        try {
            // Create company
            $company = Company::create([
                'business_name' => $data['company']['business_name'],
                'tax_code' => $data['company']['tax_code'],
                'vat_number' => $data['company']['vat_number'],
                'street' => $data['company']['street'],
                'number' => $data['company']['number'] ?? null,
                'city' => $data['company']['city'],
                'zip_code' => $data['company']['zip_code'],
                'province' => $data['company']['province'] ?? null,
                'country' => $data['company']['country'] ?? 'IT',
                'email' => $data['tenant']['email'],
                'phone' => $data['tenant']['phone'] ?? null,
                'pec_email' => $data['tenant']['pec_email'] ?? null,
                'sdi_code' => $data['tenant']['sdi_code'] ?? null,
            ]);

            // Create structure
            $structure = Structure::create([
                'name' => $data['structure']['name'],
                'street' => $data['structure']['street'],
                'number' => $data['structure']['number'] ?? null,
                'city' => $data['structure']['city'],
                'zip_code' => $data['structure']['zip_code'],
                'province' => $data['structure']['province'] ?? null,
                'country' => $data['structure']['country'] ?? 'IT',
                'phone' => $data['structure']['phone'] ?? $data['tenant']['phone'],
                'email' => $data['structure']['email'] ?? $data['tenant']['email'],
            ]);

            // Create tenant admin user
            $adminUser = User::create([
                'global_id' => $data['user']['global_id'] ?? CentralUser::where('email', $data['user']['email'])->first()->global_id,
                'first_name' => $data['user']['first_name'],
                'last_name' => $data['user']['last_name'],
                'email' => $data['user']['email'],
                'password' => Hash::make($data['user']['password']),
                'email_verified_at' => now(),
            ]);

            // Assign admin role if Spatie Permission is set up
            if (class_exists(\Spatie\Permission\Models\Role::class)) {
                $adminRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin']);
                $adminUser->assignRole($adminRole);
            }

            // If demo, seed with sample data
            if ($isDemo) {
                $this->seedDemoData($tenant);
            }
        } finally {
            tenancy()->end();
        }
    }

    /**
     * Seed demo tenant with sample data.
     */
    protected function seedDemoData(Tenant $tenant): void
    {
        // Call demo seeder if it exists
        if (class_exists(\Database\Seeders\DemoTenantSeeder::class)) {
            Artisan::call('db:seed', [
                '--class' => 'Database\\Seeders\\DemoTenantSeeder',
                '--force' => true,
            ]);
        }
    }

    /**
     * Assign trial subscription plan to tenant.
     *
     * Uses the trial_days configured in the plan itself, not from global config.
     * Each plan can have different trial periods.
     *
     * @param  string  $paymentMethod  Payment method chosen by tenant
     */
    protected function assignTrialPlan(Tenant $tenant, string $paymentMethod = 'stripe'): void
    {
        // Find a trial plan first, otherwise fallback to free or cheapest plan
        $trialPlan = SubscriptionPlan::where('is_trial_plan', true)
            ->where('is_active', true)
            ->first();

        if (! $trialPlan) {
            // Try to find a free plan
            $trialPlan = SubscriptionPlan::where('price', 0)
                ->where('is_active', true)
                ->first();
        }

        if (! $trialPlan) {
            // If no trial/free plan exists, find the cheapest active plan
            $trialPlan = SubscriptionPlan::where('is_active', true)
                ->orderBy('price', 'asc')
                ->first();
        }

        if ($trialPlan) {
            // Use plan-specific trial_days, fallback to 14 if not set
            $trialDays = $trialPlan->trial_days ?? 14;

            $subscriptionData = [
                'is_trial' => true,
                'starts_at' => now(),
                'trial_ends_at' => $trialDays > 0 ? now()->addDays($trialDays) : null,
                'payment_method' => $paymentMethod,
            ];

            // Set status based on payment method
            if ($paymentMethod === 'bank_transfer' || $paymentMethod === 'manual') {
                $subscriptionData['status'] = \App\Enums\SubscriptionStatus::PendingPayment->value;
                $subscriptionData['is_active'] = false; // Not active until payment confirmed
            } else {
                $subscriptionData['status'] = \App\Enums\SubscriptionStatus::Trial->value;
                $subscriptionData['is_active'] = true;
            }

            $tenant->subscription_planes()->attach($trialPlan->id, $subscriptionData);

            // Send bank transfer instructions if needed
            if ($paymentMethod === 'bank_transfer') {
                $this->sendBankTransferInstructions($tenant, $trialPlan);
            }
        }
    }

    /**
     * Send bank transfer instructions email.
     */
    protected function sendBankTransferInstructions(Tenant $tenant, SubscriptionPlan $plan): void
    {
        $subscription = $tenant->subscription_planes()->where('subscription_plan_id', $plan->id)->first();

        if ($subscription) {
            \Mail::to($tenant->email)->send(
                new \App\Mail\BankTransferInstructionsMail(
                    $tenant,
                    $plan,
                    (string) $subscription->pivot->id
                )
            );
        }
    }

    /**
     * Generate a unique slug from tenant name.
     */
    protected function generateUniqueSlug(string $name): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $counter = 1;

        while (Tenant::where('slug', $slug)->exists()) {
            $slug = $originalSlug.'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Validate tenant data before provisioning.
     *
     * @throws \InvalidArgumentException
     */
    public function validateProvisioningData(array $data): void
    {
        $isDemo = Arr::get($data, 'is_demo', false);

        // For demo registration, only user data is required
        if ($isDemo) {
            $required = [
                'user.first_name',
                'user.last_name',
                'user.email',
                'user.password',
            ];
        } else {
            // For paid registration, full data is required
            $required = [
                'user.first_name',
                'user.last_name',
                'user.email',
                'user.password',
                'company.business_name',
                'company.tax_code',
                'company.vat_number',
                'company.email',
                'company.phone',
                'company.pec_email',
            ];

            // Structure fields are required only if same_as_company is false
            if (! Arr::get($data, 'structure.same_as_company', false)) {
                $required = array_merge($required, [
                    'structure.name',
                    'structure.street',
                    'structure.city',
                    'structure.zip_code',
                ]);
            }
        }

        foreach ($required as $key) {
            if (! Arr::has($data, $key)) {
                throw new \InvalidArgumentException("Missing required field: {$key}");
            }
        }

        // Check if user with email already exists
        if (CentralUser::where('email', Arr::get($data, 'user.email'))->exists()) {
            throw new \InvalidArgumentException('A user with this email already exists.');
        }
    }
}
