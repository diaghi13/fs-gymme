<?php

namespace App\Services\PriceList;

use App\Dtos\PriceList\MembershipDto;
use App\Models\PriceList\Membership;

class MembershipService
{
    public function store(MembershipDto $dto): Membership
    {
        return Membership::create([
            'structure_id' => auth()->user()->current_structure_id,
            'name' => $dto->name,
            'color' => $dto->color,
            'saleable' => $dto->saleable ?? true,
            'parent_id' => $dto->parent_id,
            'saleable_from' => $dto->saleable_from,
            'saleable_to' => $dto->saleable_to,
            'price' => $dto->price,
            'vat_rate_id' => $dto->vat_rate_id,
            'months_duration' => $dto->months_duration,
        ]);
    }

    public function update(Membership $membership, MembershipDto $dto): Membership
    {
        $membership->update([
            'name' => $dto->name,
            'color' => $dto->color,
            'saleable' => $dto->saleable ?? true,
            'parent_id' => $dto->parent_id,
            'saleable_from' => $dto->saleable_from,
            'saleable_to' => $dto->saleable_to,
            'price' => $dto->price,
            'vat_rate_id' => $dto->vat_rate_id,
            'months_duration' => $dto->months_duration,
        ]);

        return $membership->fresh();
    }

    public function destroy(Membership $membership): void
    {
        $membership->delete();
    }
}
