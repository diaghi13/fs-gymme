<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;

class TenantProvisioningStatusController extends Controller
{
    /**
     * Check if tenant provisioning is complete.
     */
    public function __invoke(Tenant $tenant): JsonResponse
    {
        return response()->json([
            'is_ready' => $tenant->isProvisioningComplete(),
            'status' => $tenant->provisioning_status ?? 'pending',
            'tenant_id' => $tenant->id,
            'tenant_name' => $tenant->name,
            'error' => $tenant->provisioning_error ?? null,
        ]);
    }
}
