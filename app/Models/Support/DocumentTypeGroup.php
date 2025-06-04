<?php

namespace App\Models\Support;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentTypeGroup extends Model
{
    /** @use HasFactory<\Database\Factories\Support\DocumentTypeGroupFactory> */
    use HasFactory;

    protected $guarded = [];

    public function document_types()
    {
        return $this->hasMany(DocumentType::class);
    }
}
