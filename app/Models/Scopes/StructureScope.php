<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class StructureScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $builder->where('structure_id', 1);

//        if (auth()->check() && auth()->user()->structure_id) {
//            $builder->where('structure_id', 1);
//        } else {
//            $builder->whereNull('structure_id');
//        }
    }
}
