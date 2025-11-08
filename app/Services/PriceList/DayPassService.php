<?php

namespace App\Services\PriceList;

use App\Dtos\PriceList\DayPassDto;
use App\Models\PriceList\DayPass;

class DayPassService
{
    public function store(DayPassDto $dto): DayPass
    {
        return DayPass::create([
            'structure_id' => auth()->user()->current_structure_id,
            'name' => $dto->name,
            'color' => $dto->color,
            'saleable' => $dto->saleable ?? true,
            'parent_id' => $dto->parent_id,
            'saleable_from' => $dto->saleable_from,
            'saleable_to' => $dto->saleable_to,
            'price' => $dto->price,
            'vat_rate_id' => $dto->vat_rate_id,
        ]);
    }

    public function update(DayPass $dayPass, DayPassDto $dto): DayPass
    {
        $dayPass->update([
            'name' => $dto->name,
            'color' => $dto->color,
            'saleable' => $dto->saleable ?? true,
            'parent_id' => $dto->parent_id,
            'saleable_from' => $dto->saleable_from,
            'saleable_to' => $dto->saleable_to,
            'price' => $dto->price,
            'vat_rate_id' => $dto->vat_rate_id,
        ]);

        return $dayPass->fresh();
    }

    public function destroy(DayPass $dayPass): void
    {
        $dayPass->delete();
    }
}
