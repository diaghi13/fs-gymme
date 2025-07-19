<?php

namespace App\Models\Product;

use App\Models\PriceList\SubscriptionContent;
use App\Models\Scopes\StructureScope;
use App\Models\VatRate;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class Product extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory,
        \Parental\HasChildren,
        \Illuminate\Database\Eloquent\SoftDeletes,
        \App\Models\Traits\HasStructure;

    protected $fillable = [
        'id',
        'structure_id',
        'name',
        'type',
        'color',
        'visible',
        'sale_in_subscription',
        'selling_description',
        'vat_rate_id',
    ];

    protected $casts = [
        'visible' => 'boolean',
        'sale_in_subscription' => 'boolean',
    ];

    public function vat_rate()
    {
        return $this->belongsTo(VatRate::class);
    }

    public function subscription_content(): MorphOne
    {
        return $this->morphOne(SubscriptionContent::class, 'price_listable');
    }

    public function sale_row(): MorphOne
    {
        return $this->morphOne(\App\Models\Sale\SaleRow::class, 'entitable');
    }
}
