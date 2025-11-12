<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\CentralConnection;

/**
 * Lookup table to map Fattura Elettronica API external_id to tenant_id
 * This allows webhooks to quickly find which tenant owns an invoice
 * without iterating through all tenant databases
 */
class ElectronicInvoiceLookup extends Model
{
    use CentralConnection;

    protected $fillable = [
        'external_id',
        'tenant_id',
    ];

    /**
     * Get the tenant that owns this electronic invoice
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'id');
    }

    /**
     * Find tenant ID by external ID (Fattura Elettronica API ID)
     */
    public static function findTenantByExternalId(string $externalId): ?string
    {
        return self::where('external_id', $externalId)->value('tenant_id');
    }
}
