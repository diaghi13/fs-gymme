<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VatNature extends Model
{
    protected $fillable = [
        'code',
        'parent_code',
        'description',
        'usage_notes',
        'requires_document_reference',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'requires_document_reference' => 'boolean',
        ];
    }

    /**
     * Parent nature (e.g., N3 for N3.1)
     */
    public function parent()
    {
        return $this->belongsTo(VatNature::class, 'parent_code', 'code');
    }

    /**
     * Children natures (e.g., N3.1, N3.2 for N3)
     */
    public function children()
    {
        return $this->hasMany(VatNature::class, 'parent_code', 'code')->orderBy('order');
    }

    /**
     * Check if this is a parent nature (has no parent_code)
     */
    public function isParent(): bool
    {
        return $this->parent_code === null;
    }

    /**
     * Get full hierarchical code (e.g., "N3 - Non imponibili")
     */
    public function getFullLabelAttribute(): string
    {
        return "{$this->code} - {$this->description}";
    }
}
