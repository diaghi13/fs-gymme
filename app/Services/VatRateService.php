<?php

namespace App\Services;

use App\Models\VatRate;
use Illuminate\Support\Collection;

class VatRateService
{
    public static function toOptions(): Collection
    {
        return VatRate::query()
            ->get()
            ->map(function ($vatRate) {
                return [
                    'value' => $vatRate->id,
                    'label' => $vatRate->code . ' - ' . $vatRate->description,
                ];
            });
    }
}
