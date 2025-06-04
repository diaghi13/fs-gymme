<?php

namespace App\Models\Support;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialResource extends Model
{
    /** @use HasFactory<\Database\Factories\Support\FinancialResourceFactory> */
    use HasFactory,
        \Illuminate\Database\Eloquent\SoftDeletes;

    protected $fillable = [
        'type',
        'name',
        'iban',
        'swift',
        'is_active',
        'default',
        'financial_resource_type_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'default' => 'boolean',
    ];

    public function financial_resource_type()
    {
        return $this->belongsTo(FinancialResourceType::class);
    }
}
