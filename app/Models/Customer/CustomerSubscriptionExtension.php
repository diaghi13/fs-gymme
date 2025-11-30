<?php

namespace App\Models\Customer;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerSubscriptionExtension extends Model
{
    protected $fillable = [
        'customer_subscription_id',
        'days_extended',
        'reason',
        'extended_at',
        'new_end_date',
        'created_by',
    ];

    protected $casts = [
        'extended_at' => 'date',
        'new_end_date' => 'date',
        'days_extended' => 'integer',
    ];

    public function customerSubscription(): BelongsTo
    {
        return $this->belongsTo(CustomerSubscription::class);
    }

    public function created_by(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }
}
