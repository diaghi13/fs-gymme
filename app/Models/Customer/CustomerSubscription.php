<?php

namespace App\Models\Customer;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class CustomerSubscription extends Model
{
    /** @use HasFactory<\Database\Factories\Customer\CustomerSubscriptionFactory> */
    use HasFactory;

    use LogsActivity;

    protected $fillable = [
        'customer_id',
        'sale_row_id',
        'type',
        'price_list_id',
        'entitable_type',
        'entitable_id',
        'start_date',
        'end_date',
        'card_number',
        'notes',
        'status',
        'suspended_days',
        'extended_days',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'suspended_days' => 'integer',
        'extended_days' => 'integer',
    ];

    protected $appends = [
        'effective_end_date',
    ];

    public function customer()
    {
        return $this->belongsTo(\App\Models\Customer\Customer::class);
    }

    public function sale_row()
    {
        return $this->belongsTo(\App\Models\Sale\SaleRow::class);
    }

    public function price_list()
    {
        return $this->belongsTo(\App\Models\PriceList\PriceList::class);
    }

    public function entity()
    {
        return $this->morphTo('entity', 'entitable_type', 'entitable_id');
    }

    public function scopeActive(Builder $query)
    {
        return $query->where('start_date', '<=', now('Europe/Rome'))
            ->where(function ($query) {
                $query->whereNull('end_date')
                    ->orWhere('end_date', '>=', now('Europe/Rome'));
            });
    }

    public function scopeOfType(Builder $query, string $type)
    {
        return $query->where('type', $type);
    }

    public function suspensions()
    {
        return $this->hasMany(CustomerSubscriptionSuspension::class)->orderBy('start_date', 'desc');
    }

    public function extensions()
    {
        return $this->hasMany(CustomerSubscriptionExtension::class)->orderBy('extended_at', 'desc');
    }

    public function getEffectiveEndDateAttribute(): ?\Illuminate\Support\Carbon
    {
        $endDate = $this->end_date ? \Illuminate\Support\Carbon::parse($this->end_date) : null;

        if (! $endDate) {
            return null;
        }

        // Add suspended days
        $endDate->addDays($this->suspended_days ?? 0);

        // Add extended days
        $endDate->addDays($this->extended_days ?? 0);

        return $endDate;
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('customer_subscription')
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
