<?php

namespace App\Models\Support;

use App\Models\Traits\HasStructure;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DataRetentionPolicy extends Model
{
    use HasFactory, HasStructure;

    protected $fillable = [
        'structure_id',
        'fiscal_retention_years',
        'marketing_retention_months',
        'customer_inactive_retention_months',
        'auto_delete_after_retention',
        'auto_anonymize_after_retention',
        'last_cleanup_at',
        'last_cleanup_records_count',
        'notify_before_cleanup',
        'notify_days_before',
    ];

    protected function casts(): array
    {
        return [
            'fiscal_retention_years' => 'integer',
            'marketing_retention_months' => 'integer',
            'customer_inactive_retention_months' => 'integer',
            'auto_delete_after_retention' => 'boolean',
            'auto_anonymize_after_retention' => 'boolean',
            'last_cleanup_at' => 'datetime',
            'last_cleanup_records_count' => 'integer',
            'notify_before_cleanup' => 'boolean',
            'notify_days_before' => 'integer',
        ];
    }

    public function getFiscalRetentionDate(): \Carbon\Carbon
    {
        return now()->subYears($this->fiscal_retention_years);
    }

    public function getMarketingRetentionDate(): ?\Carbon\Carbon
    {
        if (! $this->marketing_retention_months) {
            return null;
        }

        return now()->subMonths($this->marketing_retention_months);
    }

    public function getCustomerInactiveRetentionDate(): \Carbon\Carbon
    {
        return now()->subMonths($this->customer_inactive_retention_months);
    }
}
