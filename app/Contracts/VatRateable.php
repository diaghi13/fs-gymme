<?php

namespace App\Contracts;

interface VatRateable
{
    public function vat_rate(): \Illuminate\Database\Eloquent\Relations\BelongsTo;
}
