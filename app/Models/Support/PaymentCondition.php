<?php

namespace App\Models\Support;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentCondition extends Model
{
    /** @use HasFactory<\Database\Factories\Support\PaymentConditionFactory> */
    use HasFactory;

    protected $fillable = [
        'description',
        'payment_method_id',
        'number_of_installments',
        'end_of_month',
        'visible',
        'active',
        'is_default',
        'is_system',
        'financial_resource_type_id',
    ];

    protected $casts = [
        'end_of_month' => 'boolean',
        'visible' => 'boolean',
        'active' => 'boolean',
        'is_default' => 'boolean',
        'is_system' => 'boolean',
    ];

    public function installments()
    {
        return $this->hasMany(PaymentConditionInstallment::class);
    }

    public function payment_method()
    {
        return $this->belongsTo(PaymentMethod::class, 'payment_method_id');
    }

    public function financial_resource_type()
    {
        return $this->belongsTo(FinancialResourceType::class);
    }
}
