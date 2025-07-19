<?php

namespace App\Models\Traits;

use App\Models\Structure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use function Pest\Laravel\put;

trait HasStructure
{
    public static function booted()
    {
        static::creating(function (Model $model) {
            if (!isset($model->structure_id) || empty($model->structure_id)) {
                if (auth()->check()) {
                    $model->structure_id = 1;
                } elseif (isset($model->structure_id)) {
                    $model->structure_id = 1; // Default structure ID
                }
            }
        });

        static::addGlobalScope(function (Builder $builder) {
            // Ensure the structure_id is set in the session

            if (auth()->check()) {
                $builder->where('structure_id', 1);
            } else {
                $builder->where('structure_id', 1); // Default structure ID
            }
        });
    }
}
