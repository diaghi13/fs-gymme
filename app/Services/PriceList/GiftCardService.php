<?php

namespace App\Services\PriceList;

use App\Dtos\PriceList\GiftCardDto;
use App\Models\PriceList\GiftCard;

class GiftCardService
{
    public function store(GiftCardDto $dto): GiftCard
    {
        return GiftCard::create([
            'structure_id' => auth()->user()->current_structure_id,
            'name' => $dto->name,
            'color' => $dto->color,
            'saleable' => $dto->saleable ?? true,
            'parent_id' => $dto->parent_id,
            'saleable_from' => $dto->saleable_from,
            'saleable_to' => $dto->saleable_to,
            'price' => $dto->price,
            'vat_rate_id' => $dto->vat_rate_id,
            'validity_months' => $dto->validity_months,
        ]);
    }

    public function update(GiftCard $giftCard, GiftCardDto $dto): GiftCard
    {
        $giftCard->update([
            'name' => $dto->name,
            'color' => $dto->color,
            'saleable' => $dto->saleable ?? true,
            'parent_id' => $dto->parent_id,
            'saleable_from' => $dto->saleable_from,
            'saleable_to' => $dto->saleable_to,
            'price' => $dto->price,
            'vat_rate_id' => $dto->vat_rate_id,
            'validity_months' => $dto->validity_months,
        ]);

        return $giftCard->fresh();
    }

    public function destroy(GiftCard $giftCard): void
    {
        $giftCard->delete();
    }
}
