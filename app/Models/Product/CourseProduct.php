<?php

namespace App\Models\Product;

use App\Models\Scopes\StructureScope;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Parental\HasParent;

class CourseProduct extends Product
{
    /** @use HasFactory<\Database\Factories\Product\CourseProductFactory> */
    use HasFactory, HasParent;

    public function plannings()
    {
        return $this->hasMany(CourseProductPlanning::class);
    }

    public function planning()
    {
        return $this->plannings()->latest();
    }
}
