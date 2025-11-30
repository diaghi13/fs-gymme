<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Permission\Traits\HasRoles;
use Stancl\Tenancy\Contracts\SyncMaster;
use Stancl\Tenancy\Database\Concerns\CentralConnection;
use Stancl\Tenancy\Database\Concerns\ResourceSyncing;
use Stancl\Tenancy\Database\Models\TenantPivot;

class CentralUser extends User implements SyncMaster
{
    use CentralConnection, HasRoles, ResourceSyncing;

    public $table = 'users';

    protected static $logAttributes = ['first_name', 'last_name', 'email'];

    protected static $logOnlyDirty = true;

    protected static $logName = 'user';

    protected static function bootLogsActivity()
    {
        // Skip activity logging during tests
        if (app()->environment('testing')) {
            return;
        }

        parent::bootLogsActivity();
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(self::$logAttributes)
            ->logOnlyDirty()
            ->useLogName(self::$logName);
    }

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
        // 'company',
    ];

    public function getDescriptionForEvent(string $eventName): string
    {
        return "L'utente è stato {$eventName}";
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
