<?php

namespace App\Services\Features;

use App\Models\Tenant;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Service for provisioning electronic invoicing accounts.
 *
 * Handles:
 * - Creating electronic invoicing API accounts
 * - Configuring tenant credentials
 * - Activating feature when upgrading to Gold/Platinum
 *
 * This is a placeholder implementation - integrate with your actual
 * electronic invoicing provider (e.g., Aruba, Infocert, etc.)
 */
class ElectronicInvoicingProvisioningService
{
    /**
     * Provision electronic invoicing for a tenant.
     *
     * Called when:
     * - Tenant purchases electronic invoicing addon
     * - Tenant upgrades to Gold/Platinum plan
     *
     * @return array{success: bool, credentials: array|null, error: string|null}
     */
    public function provision(Tenant $tenant): array
    {
        Log::info('Provisioning electronic invoicing', [
            'tenant_id' => $tenant->id,
            'tenant_name' => $tenant->name,
        ]);

        try {
            // TODO: Integrate with your electronic invoicing provider API
            // Example implementation below:

            $credentials = $this->createProviderAccount($tenant);

            if (! $credentials) {
                return [
                    'success' => false,
                    'credentials' => null,
                    'error' => 'Failed to create electronic invoicing account',
                ];
            }

            // Store credentials in tenant settings
            $this->storeCredentials($tenant, $credentials);

            // Initialize tenant database for electronic invoicing
            $this->initializeTenantElectronicInvoicing($tenant);

            Log::info('Electronic invoicing provisioned successfully', [
                'tenant_id' => $tenant->id,
            ]);

            return [
                'success' => true,
                'credentials' => $credentials,
                'error' => null,
            ];
        } catch (\Exception $e) {
            Log::error('Failed to provision electronic invoicing', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'credentials' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Create account with Fattura Elettronica API provider.
     *
     * Uses the multi-azienda API to create a new company account.
     * Documentation: https://fattura-elettronica-api.it/documentazione2.0/#multi_aziende
     *
     * @return array|null Array with credentials or null on failure
     */
    protected function createProviderAccount(Tenant $tenant): ?array
    {
        $endpoint = config('services.fattura_elettronica_api.endpoint', 'https://fattura-elettronica-api.it/ws2.0/prod');
        $username = config('services.fattura_elettronica_api.username');
        $password = config('services.fattura_elettronica_api.password');

        if (! $username || ! $password) {
            Log::warning('Fattura Elettronica API credentials not configured');

            // Return mock for development if not configured
            return [
                'api_key' => $username ?: 'mock_username',
                'api_secret' => $password ?: 'mock_password',
                'account_id' => 'mock_'.uniqid(),
                'provider' => 'fattura_elettronica_api_mock',
            ];
        }

        // Prepare company data according to API spec
        $companyData = [
            'ragione_sociale' => $tenant->name,
            'piva' => $tenant->vat_number,
            'cfis' => $tenant->tax_code,
            'indirizzo' => $tenant->address,
            'cap' => $tenant->postal_code,
            'citta' => $tenant->city,
            'provincia' => $this->extractProvince($tenant->address),
            'paese' => $tenant->country ?: 'IT',
            'telefono_amministrazione' => $tenant->phone,
            'email_amministrazione' => $tenant->email,
            'abilita_ricezione' => 1, // Enable receiving invoices
        ];

        // Add optional fields if available
        if ($tenant->pec_email) {
            $companyData['pec'] = $tenant->pec_email;
        }

        try {
            $response = Http::withBasicAuth($username, $password)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post($endpoint.'/aziende', $companyData);

            if ($response->successful()) {
                $data = $response->json();

                // Store the Bearer token if provided in response headers
                $bearerToken = $response->header('X-auth-token');
                $tokenExpires = $response->header('X-auth-expires');

                return [
                    'api_key' => $username, // Basic auth username
                    'api_secret' => $password, // Basic auth password
                    'bearer_token' => $bearerToken,
                    'token_expires' => $tokenExpires,
                    'account_id' => $data['id'] ?? null,
                    'provider' => 'fattura_elettronica_api',
                    'provider_data' => $data, // Full company data from provider
                ];
            }

            Log::error('Failed to create Fattura Elettronica API account', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Exception creating Fattura Elettronica API account', [
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Extract province code from address or city.
     * Returns null if not found.
     */
    protected function extractProvince(?string $address): ?string
    {
        if (! $address) {
            return null;
        }

        // Try to extract 2-letter province code (e.g., "RM", "MI", "TO")
        // This is a simple heuristic - adjust based on your data
        if (preg_match('/\b([A-Z]{2})\b/', strtoupper($address), $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Store electronic invoicing credentials in tenant settings.
     */
    protected function storeCredentials(Tenant $tenant, array $credentials): void
    {
        tenancy()->initialize($tenant);

        try {
            // Store encrypted credentials in tenant settings
            if (class_exists(\App\Models\TenantSetting::class)) {
                \App\Models\TenantSetting::set('electronic_invoicing_api_key', encrypt($credentials['api_key']));
                \App\Models\TenantSetting::set('electronic_invoicing_api_secret', encrypt($credentials['api_secret']));
                \App\Models\TenantSetting::set('electronic_invoicing_account_id', $credentials['account_id']);
                \App\Models\TenantSetting::set('electronic_invoicing_provider', $credentials['provider']);

                // Store bearer token if available
                if (isset($credentials['bearer_token'])) {
                    \App\Models\TenantSetting::set('electronic_invoicing_bearer_token', encrypt($credentials['bearer_token']));
                    \App\Models\TenantSetting::set('electronic_invoicing_token_expires', $credentials['token_expires']);
                }

                // Store full provider data for reference
                if (isset($credentials['provider_data'])) {
                    \App\Models\TenantSetting::set('electronic_invoicing_provider_data', json_encode($credentials['provider_data']));
                }

                \App\Models\TenantSetting::set('electronic_invoicing_enabled', true);
            }
        } finally {
            tenancy()->end();
        }
    }

    /**
     * Initialize tenant database for electronic invoicing.
     *
     * Creates necessary tables/data if not already present.
     */
    protected function initializeTenantElectronicInvoicing(Tenant $tenant): void
    {
        tenancy()->initialize($tenant);

        try {
            // Run any necessary setup for electronic invoicing
            // For example:
            // - Ensure electronic_invoices table exists
            // - Create default settings
            // - Initialize counters

            // This is handled by migrations, so usually nothing needed here
            // unless you have specific initialization logic
        } finally {
            tenancy()->end();
        }
    }

    /**
     * Deprovision electronic invoicing for a tenant.
     *
     * Called when:
     * - Tenant cancels electronic invoicing addon
     * - Tenant downgrades from Gold/Platinum
     */
    public function deprovision(Tenant $tenant): array
    {
        Log::info('Deprovisioning electronic invoicing', [
            'tenant_id' => $tenant->id,
        ]);

        try {
            // TODO: Call provider API to deactivate account
            // Keep credentials for historical data access

            tenancy()->initialize($tenant);

            try {
                if (class_exists(\App\Models\TenantSetting::class)) {
                    \App\Models\TenantSetting::set('electronic_invoicing_enabled', false);
                }
            } finally {
                tenancy()->end();
            }

            Log::info('Electronic invoicing deprovisioned successfully', [
                'tenant_id' => $tenant->id,
            ]);

            return [
                'success' => true,
                'error' => null,
            ];
        } catch (\Exception $e) {
            Log::error('Failed to deprovision electronic invoicing', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Check if electronic invoicing is provisioned for tenant.
     */
    public function isProvisioned(Tenant $tenant): bool
    {
        tenancy()->initialize($tenant);

        try {
            if (class_exists(\App\Models\TenantSetting::class)) {
                return (bool) \App\Models\TenantSetting::get('electronic_invoicing_enabled', false);
            }

            return false;
        } finally {
            tenancy()->end();
        }
    }
}
