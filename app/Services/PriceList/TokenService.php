<?php

namespace App\Services\PriceList;

use App\Dtos\PriceList\TokenDto;
use App\Models\PriceList\Token;

class TokenService
{
    public function store(TokenDto $dto): Token
    {
        return Token::create([
            'structure_id' => auth()->user()->current_structure_id,
            'name' => $dto->name,
            'color' => $dto->color,
            'saleable' => $dto->saleable ?? true,
            'parent_id' => $dto->parent_id,
            'saleable_from' => $dto->saleable_from,
            'saleable_to' => $dto->saleable_to,
            'price' => $dto->price,
            'vat_rate_id' => $dto->vat_rate_id,
            'entrances' => $dto->entrances,
            'validity_days' => $dto->validity_days,
        ]);
    }

    public function update(Token $token, TokenDto $dto): Token
    {
        $token->update([
            'name' => $dto->name,
            'color' => $dto->color,
            'saleable' => $dto->saleable ?? true,
            'parent_id' => $dto->parent_id,
            'saleable_from' => $dto->saleable_from,
            'saleable_to' => $dto->saleable_to,
            'price' => $dto->price,
            'vat_rate_id' => $dto->vat_rate_id,
            'entrances' => $dto->entrances,
            'validity_days' => $dto->validity_days,
        ]);

        return $token->fresh();
    }

    public function destroy(Token $token): void
    {
        $token->delete();
    }
}
