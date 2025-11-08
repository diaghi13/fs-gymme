<?php

namespace App\Models\Traits;

use App\Models\Scopes\StructureScope;
use App\Models\Structure;
use Illuminate\Database\Eloquent\Model;

trait HasStructure
{
    /**
     * Boot the HasStructure trait for a model.
     */
    public static function bootHasStructure(): void
    {
        // Add global scope to filter by structure
        static::addGlobalScope(new StructureScope);

        // Auto-set structure_id on creation if not set
        static::creating(function (Model $model) {
            if (! isset($model->structure_id) || empty($model->structure_id)) {
                // Use structure from session if available
                if (session()->has('current_structure_id')) {
                    $model->structure_id = session()->get('current_structure_id');
                } else {
                    // Fallback to first structure
                    $model->structure_id = Structure::first()?->id ?? 1;
                }
            }
        });
    }

    /**
     * Get the structure that owns the model.
     */
    public function structure()
    {
        return $this->belongsTo(Structure::class);
    }
}
