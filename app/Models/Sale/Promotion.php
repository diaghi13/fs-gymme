<?php

namespace App\Models\Sale;

use App\Models\Scopes\StructureScope;
use App\Models\Traits\HasStructure;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    /** @use HasFactory<\Database\Factories\Support\PromotionFactory> */
    use HasFactory, HasStructure;
}
