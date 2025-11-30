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
        $structureId = null;

        // Priority 1: Try to get from session (primary source)
        if (session()->has('current_structure_id')) {
            $structureId = session()->get('current_structure_id');
        }
        // Priority 2: Fallback to cookie (if session not available)
        elseif (request()->hasCookie('current_structure_id')) {
            $structureId = request()->cookie('current_structure_id');
        }

        // Apply scope if we found a structure_id
        if ($structureId !== null) {
            $builder->where($model->getTable().'.structure_id', $structureId);
        }
    }
}
