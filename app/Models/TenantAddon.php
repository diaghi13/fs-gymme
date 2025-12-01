<?php

namespace App\Models;

use App\Casts\MoneyCast;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TenantAddon extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'plan_feature_id',
        'quota_limit',
        'price_cents',
        'starts_at',
        'ends_at',
        'is_active',
        'stripe_subscription_item_id',
        'payment_method',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'quota_limit' => 'integer',
            'price_cents' => MoneyCast::class,
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * The tenant that owns this addon.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * The feature this addon provides.
     */
    public function planFeature(): BelongsTo
    {
        return $this->belongsTo(PlanFeature::class);
    }

    /**
     * Scope: Only active addons.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('ends_at')
                    ->orWhere('ends_at', '>', now());
            });
    }

    /**
     * Scope: Only expired addons.
     */
    public function scopeExpired($query)
    {
        return $query->where('is_active', false)
            ->orWhere('ends_at', '<=', now());
    }

    /**
     * Scope: By payment method.
     */
    public function scopeByPaymentMethod($query, string $method)
    {
        return $query->where('payment_method', $method);
    }

    /**
     * Check if addon is currently active.
     */
    public function isActive(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        if ($this->ends_at && $this->ends_at->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Check if addon has expired.
     */
    public function hasExpired(): bool
    {
        return $this->ends_at && $this->ends_at->isPast();
    }

    /**
     * Cancel the addon.
     */
    public function cancel(): void
    {
        $this->update([
            'is_active' => false,
            'ends_at' => now(),
            'status' => 'cancelled',
        ]);
    }
}
