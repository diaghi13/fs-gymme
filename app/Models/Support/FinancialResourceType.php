<?php

namespace App\Models\Support;

use Illuminate\Database\Eloquent\Model;

class FinancialResourceType extends Model
{
    protected $fillable = [
        'name',
    ];

    public function financial_resources()
    {
        return $this->hasMany(FinancialResource::class);
    }
}
