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
use Illuminate\Support\Facades\DB;
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
     * @param  array  $data  Tenant registration data
     * @param  bool  $isDemo  Whether this is a demo tenant
     * @param  string  $paymentMethod  Payment method (stripe, bank_transfer, manual)
     * @return Tenant The created tenant
     *
     * @throws \Exception If provisioning fails
     */
    public function provision(array $data, bool $isDemo = false, string $paymentMethod = 'stripe'): Tenant
    {
        return DB::transaction(function () use ($data, $isDemo, $paymentMethod) {
            // 1. Create tenant in central database
            $tenant = $this->createTenant($data['tenant'], $isDemo);

            // 2. Create and setup tenant database
            $this->setupTenantDatabase($tenant);

            // 3. Create central user
            $centralUser = $this->createCentralUser($data['user']);

            // 4. Associate user with tenant
            $this->associateUserWithTenant($centralUser, $tenant);

            // 5. Initialize tenant context and create tenant data
            $this->initializeTenantData($tenant, $data, $isDemo);

            // 6. Assign trial subscription plan if available
            $this->assignTrialPlan($tenant, $paymentMethod);

            return $tenant->fresh();
        });
    }

    /**
     * Create tenant in central database.
     */
    protected function createTenant(array $data, bool $isDemo = false): Tenant
    {
        $slug = $this->generateUniqueSlug($data['name']);

        $tenantData = [
            'name' => $data['name'],
            'slug' => $slug,
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'vat_number' => $data['vat_number'] ?? null,
            'tax_code' => $data['tax_code'] ?? null,
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'postal_code' => $data['postal_code'] ?? null,
            'country' => $data['country'] ?? 'IT',
            'pec_email' => $data['pec_email'] ?? null,
            'sdi_code' => $data['sdi_code'] ?? null,
            'is_active' => true,
            'is_demo' => $isDemo,
        ];

        // Set demo expiration if this is a demo
        if ($isDemo) {
            $demoDays = config('app.demo_duration_days', 15);
            $tenantData['demo_expires_at'] = now()->addDays($demoDays);
        }

        return Tenant::create($tenantData);
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
        return CentralUser::create([
            'global_id' => Str::uuid(),
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'email_verified_at' => now(), // Auto-verify for self-registration
        ]);
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
     * @param  string  $paymentMethod  Payment method chosen by tenant
     */
    protected function assignTrialPlan(Tenant $tenant, string $paymentMethod = 'stripe'): void
    {
        // Find a trial or free plan
        $trialPlan = SubscriptionPlan::where('is_trial', true)
            ->orWhere('price', 0)
            ->first();

        if (! $trialPlan) {
            // If no trial plan exists, find the cheapest plan or create a default one
            $trialPlan = SubscriptionPlan::orderBy('price', 'asc')->first();
        }

        if ($trialPlan) {
            $subscriptionData = [
                'is_trial' => true,
                'starts_at' => now(),
                'trial_ends_at' => now()->addDays(config('app.trial_days', 14)),
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
        $required = [
            'tenant.name',
            'tenant.email',
            'user.first_name',
            'user.last_name',
            'user.email',
            'user.password',
            'company.business_name',
            'company.tax_code',
            'company.vat_number',
            'structure.name',
            'structure.city',
        ];

        foreach ($required as $key) {
            if (! Arr::has($data, $key)) {
                throw new \InvalidArgumentException("Missing required field: {$key}");
            }
        }

        // Check if tenant with email already exists
        if (Tenant::where('email', Arr::get($data, 'tenant.email'))->exists()) {
            throw new \InvalidArgumentException('A tenant with this email already exists.');
        }

        // Check if user with email already exists
        if (CentralUser::where('email', Arr::get($data, 'user.email'))->exists()) {
            throw new \InvalidArgumentException('A user with this email already exists.');
        }
    }
}
