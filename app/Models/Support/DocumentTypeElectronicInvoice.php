<?php

namespace App\Models\Support;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentTypeElectronicInvoice extends Model
{
    /** @use HasFactory<\Database\Factories\Support\DocumentTypeElectronicInvoiceFactory> */
    use HasFactory;

    protected $fillable = [
        'id',
        'code',
        'description',
        'document_type_id',
        'can_invoice_himself',
    ];

    public function document_type()
    {
        return $this->belongsTo(DocumentType::class);
    }

    public function getLabelAttribute()
    {
        return $this->code.' - '.$this->description;
    }
}
