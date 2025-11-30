<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Customer\Customer;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Stancl\Tenancy\Contracts\Syncable;
use Stancl\Tenancy\Database\Concerns\ResourceSyncing;

class User extends Authenticatable implements Syncable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasRoles, Notifiable, ResourceSyncing;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
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

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Temporarily disabled - may cause serialization issues
    // protected $appends = [
    //     'name',
    // ];

    protected $guard_name = 'web';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function getNameAttribute()
    {
        return $this->first_name.' '.$this->last_name;
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
        return CentralUser::class;
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

    public function customer()
    {
        return $this->hasOne(Customer::class, 'user_id', 'id');
    }

    /**
     * Get customers assigned to this trainer
     */
    public function assigned_customers()
    {
        return $this->belongsToMany(
            Customer::class,
            'customer_trainer',
            'trainer_id',
            'customer_id'
        )
            ->withPivot(['assigned_at', 'is_active', 'notes'])
            ->withTimestamps()
            ->wherePivot('is_active', true);
    }

    /**
     * Scope to filter only trainers
     */
    public function scopeIsTrainer($query)
    {
        return $query->whereHas('roles', function ($q) {
            $q->where('name', 'trainer');
        });
    }

    /**
     * Check if user has trainer role
     */
    public function isTrainer(): bool
    {
        return $this->hasRole('trainer');
    }

    /**
     * Check if user is owner
     */
    public function isOwner(): bool
    {
        return $this->hasRole('owner');
    }

    /**
     * Check if user is manager
     */
    public function isManager(): bool
    {
        return $this->hasRole('manager');
    }

    /**
     * Check if user can manage other users
     */
    public function canManageUsers(): bool
    {
        return $this->can('users.manage');
    }

    /**
     * Check if user can manage settings
     */
    public function canManageSettings(): bool
    {
        return $this->can('settings.manage_general');
    }
}
