<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Stancl\Tenancy\Contracts\SyncMaster;
use Stancl\Tenancy\Database\Concerns\CentralConnection;
use Stancl\Tenancy\Database\Concerns\ResourceSyncing;
use Stancl\Tenancy\Database\Models\TenantPivot;
use function Pest\Laravel\get;

class CentralUser extends User implements SyncMaster
{
    use ResourceSyncing, CentralConnection, LogsActivity;

    public $table = 'users';

    protected static $logAttributes = ['first_name', 'last_name', 'email'];
    protected static $logOnlyDirty = true;
    protected static $logName = 'user';

    protected $fillable = [
        'global_id',
        'first_name',
        'last_name',
        'email',
        'password',

        'phone',
        'birth_date',
        'tax_code',
        'is_active',
        'last_login_at',

        'gdpr_consent',
        'gdpr_consent_at',
        'marketing_consent',
        'marketing_consent_at',
        'data_retention_until',

        'fcm_token',
        'app_version',
    ];

    protected $appends = [
        'company',
    ];

    public function getDescriptionForEvent(string $eventName): string
    {
        return "L'utente è stato {$eventName}";
    }

    public function getActivitylogOptions(): LogOptions
    {
        // TODO: Implement getActivitylogOptions() method.
        return LogOptions::defaults()
            ->logOnly(['first_name', 'last_name', 'email'])
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn (string $eventName) => "L'utente è stato {$eventName}");
    }

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

//    public function getCompanyAttribute()
//    {
//        // Return the first tenant
//        return $this->tenants()->first();
//    }

    public function company(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->tenants()->first()
        );
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
