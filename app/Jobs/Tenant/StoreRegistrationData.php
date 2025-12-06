<?php

namespace App\Jobs\Tenant;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Stancl\Tenancy\Contracts\TenantWithDatabase;

/**
 * Store registration data in tenant metadata.
 * This job runs after CreateDatabase and MigrateDatabase but before InitializeTenantData.
 */
class StoreRegistrationData implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public TenantWithDatabase $tenant
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Get registration data from tenant's custom property (set in TenantProvisioningService)
        $registrationData = $this->tenant->_registrationData ?? null;

        if ($registrationData) {
            // Save it to the database using setRegistrationData
            $this->tenant->setRegistrationData($registrationData);
        }
    }
}
