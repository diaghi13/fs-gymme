<?php

namespace App\Models;

// use App\Models\Traits\HasTenantScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Structure extends Model
{
    /** @use HasFactory<\Database\Factories\StructureFactory> */
    use HasFactory; // , HasTenantScope - disabled temporarily

    protected $fillable = [
        'name',
        'street',
        'number',
        'city',
        'zip_code',
        'province',
        'country',
    ];
}
