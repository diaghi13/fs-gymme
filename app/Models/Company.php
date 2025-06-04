<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    /** @use HasFactory<\Database\Factories\CompanyFactory> */
    use HasFactory;

    protected $fillable = [
        'business_name',
        'tax_code',
        'vat_number',
        'street',
        'number',
        'city',
        'zip_code',
        'province',
        'country',
    ];
}
