<?php

namespace App\Services\Customer;

use App\Models\CentralUser;
use App\Models\Customer\Customer;
use App\Models\Tenant;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CustomerService
{
    /**
     * Create a new customer with associated user account
     * Handles multi-tenant logic: reuses CentralUser if email exists
     */
    public function createWithUser(array $data, ?Tenant $tenant = null): Customer
    {
        $tenant = $tenant ?? tenant();

        return DB::transaction(function () use ($data, $tenant) {
            // 1. Find or create CentralUser (global user across all tenants)
            $centralUser = tenancy()->central(function () use ($data) {
                return CentralUser::firstOrCreate(
                    ['email' => $data['email']],
                    [
                        'global_id' => (string) Str::uuid(),
                        'first_name' => $data['first_name'],
                        'last_name' => $data['last_name'],
                        'email' => $data['email'],
                        'password' => Hash::make(Str::random(16)), // Random password, will be reset
                        'phone' => $data['phone'] ?? null,
                        'birth_date' => isset($data['birth_date']) ? Carbon::parse($data['birth_date'])->format('Y-m-d') : null,
                        'tax_code' => $data['tax_id_code'] ?? null,
                        'is_active' => true,
                    ]
                );
            });

            // 2. Attach tenant to CentralUser if not already attached
            tenancy()->central(function () use ($centralUser, $tenant) {
                if (! $centralUser->tenants()->where('tenant_id', $tenant->id)->exists()) {
                    $centralUser->tenants()->attach($tenant->id);
                }
            });

            // 3. Find or create tenant User (user might already exist if they're a customer in another structure)
            $user = User::firstOrCreate(
                ['global_id' => $centralUser->global_id],
                [
                    'first_name' => $data['first_name'],
                    'last_name' => $data['last_name'],
                    'email' => $data['email'],
                    'password' => $centralUser->password,
                    'phone' => $data['phone'] ?? null,
                    'birth_date' => isset($data['birth_date']) ? Carbon::parse($data['birth_date'])->format('Y-m-d') : null,
                    'tax_code' => $data['tax_id_code'] ?? null,
                    'is_active' => true,
                ]
            );

            // Assign 'user' role (customer role)
            // $user->assignRole('user'); // Uncomment when HasRoles is enabled

            // 4. Create Customer linked to User
            $customer = Customer::create([
                'user_id' => $user->id,
                'structure_id' => $data['structure_id'] ?? null,
                'uuid' => (string) Str::uuid(),
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'company_name' => $data['company_name'] ?? null,
                'birth_date' => isset($data['birth_date']) ? Carbon::parse($data['birth_date'])->format('Y-m-d') : null,
                'gender' => $data['gender'] ?? null,
                'birthplace' => $data['birthplace'] ?? null,
                'tax_id_code' => $data['tax_id_code'] ?? null,
                'tax_code' => $data['tax_code'] ?? null,
                'vat_number' => $data['vat_number'] ?? null,
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'street' => $data['street'] ?? null,
                'number' => $data['number'] ?? null,
                'city' => $data['city'] ?? null,
                'zip' => $data['zip'] ?? null,
                'province' => $data['province'] ?? null,
                'country' => $data['country'] ?? 'IT',
                // GDPR consents
                'gdpr_consent' => $data['gdpr_consent'] ?? false,
                'gdpr_consent_at' => $data['gdpr_consent'] ? now() : null,
                'marketing_consent' => $data['marketing_consent'] ?? false,
                'marketing_consent_at' => $data['marketing_consent'] ? now() : null,
                'photo_consent' => $data['photo_consent'] ?? false,
                'medical_data_consent' => $data['medical_data_consent'] ?? false,
                'data_retention_until' => $data['gdpr_consent'] ? now()->addYears(7) : null,
            ]);

            return $customer;
        });
    }

    /**
     * Calculate Italian Tax Code (Codice Fiscale)
     */
    public function calculateTaxCode(array $data): string
    {
        try {
            $calculator = new \Robertogallea\LaravelCodiceFiscale\CodiceFiscale;

            $codiceFiscale = $calculator->calculate(
                nome: $data['first_name'],
                cognome: $data['last_name'],
                sesso: $data['gender'] === 'F' ? 'F' : 'M',
                data_nascita: \Carbon\Carbon::parse($data['birth_date'])->format('d/m/Y'),
                comune_nascita: $data['birthplace']
            );

            return strtoupper($codiceFiscale);
        } catch (\Exception $e) {
            // Fallback to placeholder if calculation fails
            return strtoupper(
                substr($data['last_name'], 0, 3).
                substr($data['first_name'], 0, 3).
                substr($data['birth_date'], 2, 2).
                'X00X000X'
            );
        }
    }

    /**
     * Check if email is available for this tenant
     */
    public function isEmailAvailable(string $email): bool
    {
        return ! Customer::where('email', $email)->exists();
    }

    public function get(Customer $customer)
    {
        // Load all relationships efficiently to avoid N+1 queries
        $customer->load([
            'active_subscriptions' => function (HasMany $query) {
                $query->with([
                    'entity',
                    'price_list',
                    'sale_row' => ['entity'],
                    'suspensions' => function (HasMany $query) {
                        $query->orderBy('start_date', 'desc');
                    },
                    'extensions' => function (HasMany $query) {
                        $query->orderBy('extended_at', 'desc');
                    },
                ]);
            },
            'subscriptions' => function (HasMany $query) {
                $query->with([
                    'entity',
                    'price_list',
                    'sale_row' => ['entity'],
                    'suspensions' => function (HasMany $query) {
                        $query->orderBy('start_date', 'desc');
                    },
                    'extensions' => function (HasMany $query) {
                        $query->orderBy('extended_at', 'desc');
                    },
                ])->orderBy('start_date', 'desc');
            },
            'active_membership',
            'last_membership',
            'last_medical_certification',
            'active_membership_fee',
            // Load ALL sales with their relationships for sales_summary calculation
            'sales' => function (HasMany $query) {
                $query->with([
                    'payment_condition',
                    'financial_resource',
                    'promotion',
                    'rows' => function (HasMany $query) {
                        $query->with(['entity', 'price_list', 'vat_rate']);
                    },
                    'payments.payment_method',
                ])->orderBy('date', 'desc');
            },
            'files' => function (MorphMany $query) {
                $query->orderBy('created_at', 'desc');
            },
        ]);

        // Calculate sales_summary and customer_alerts using the already loaded relationships
        $customer->append([
            'sales_summary',
            'customer_alerts',
        ]);

        // Limit sales to last 10 for display in the table (after summary is calculated)
        $limitedSales = $customer->sales->take(10);
        $customer->setRelation('sales', $limitedSales);

        return $customer;
    }
}
