<?php

namespace App\Models\Document;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentItem extends Model
{
    /** @use HasFactory<\Database\Factories\Document\DocumentItemFactory> */
    use HasFactory;

    protected $fillable = [
        'document_id',
        'product_id',
        'description',
        'quantity',
        'unit_price',
        'discount_percentage',
        'vat_rate',
        'subtotal',
        'nature',
    ];
}
