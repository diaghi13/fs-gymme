<?php

namespace App\Models\Support;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicalCertification extends Model
{
    /** @use HasFactory<\Database\Factories\Support\MedicalCertificationFactory> */
    use HasFactory;

    protected $fillable = [
        'medical_certifiable_type',
        'medical_certifiable_id',
        'certification_date',
        'valid_until',
        'notes',
    ];

    protected $casts = [
        'certification_date' => 'date',
        'valid_until' => 'date',
    ];

    public function medicalCertifiable()
    {
        return $this->morphTo('medical_certifiable', 'medical_certifiable_type', 'medical_certifiable_id');
    }
}
