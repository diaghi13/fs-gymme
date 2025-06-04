<?php

namespace App\Models\Support;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentType extends Model
{
    /** @use HasFactory<\Database\Factories\Support\DocumentTypeFactory> */
    use HasFactory;

    protected $fillable = [
        'id',
        'name',
        'description',
        'accountable',
        'order',
        'document_type_group_id',
    ];

    public function electronic_invoice()
    {
        return $this->hasMany(DocumentTypeElectronicInvoice::class);
    }

    public function document_type_group()
    {
        return $this->belongsTo(DocumentTypeGroup::class);
    }
}
