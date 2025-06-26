<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Stancl\Tenancy\Contracts\SyncMaster;
use Stancl\Tenancy\Database\Concerns\CentralConnection;
use Stancl\Tenancy\Database\Concerns\ResourceSyncing;
use Stancl\Tenancy\Database\Models\TenantPivot;

class CentralUser extends User implements SyncMaster
{
    use ResourceSyncing, CentralConnection;

    protected $guarded = [];

    public $table = 'users';

    protected $with = [
        'tenants',
        'roles' => [
            'permissions',
        ],
        'permissions',
    ];

    public function tenants(): BelongsToMany
    {
        return $this->belongsToMany(
            Tenant::class,
            'tenant_users',
            'global_user_id',
            'tenant_id',
            'global_id'
        )
            ->using(TenantPivot::class);
    }

    public function getTenantModelName(): string
    {
        return User::class;
    }

    public function getGlobalIdentifierKey()
    {
        return $this->getAttribute($this->getGlobalIdentifierKeyName());
    }

    public function getGlobalIdentifierKeyName(): string
    {
        return 'global_id';
    }

    public function getCentralModelName(): string
    {
        return static::class;
    }

    public function getSyncedAttributeNames(): array
    {
        return [
            'first_name',
            'last_name',
            'password',
            'email',
        ];
    }
}
