<?php

namespace App\Models\Document;

use App\Models\Traits\HasStructure;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    /** @use HasFactory<\Database\Factories\Document\DocumentFactory> */
    use HasFactory, HasStructure, \Illuminate\Database\Eloquent\SoftDeletes;

    protected $fillable = [
        'structure_id',
        'customer_id',
        'sale_id',
        'document_type_electronic_invoice_id',
        'tipo_documento',
        'divisa',
        'invoice_number',
        'invoice_date',
        'due_date',
        'codice_destinatario',
        'billing_name',
        'billing_address',
        'billing_city',
        'billing_postal_code',
        'billing_country',
        'billing_vat_number',
        'billing_tax_code',
        'billing_sdi_code',
        'billing_pec',
        'subtotal',
        'tax_amount',
        'total_amount',
        'bollo',
        'ritenuta_acconto',
        'cassa_previdenziale',
        'arrotondamento',
        'fe_status',
        'fe_filename',
        'fe_sent_at',
        'fe_response',
        'payment_status',
        'payment_method',
        'payment_date',
        'notes',
        'order_reference',
        'ddt_reference',
        'attachment_xml',
        'attachment_pdf',
    ];
}
