<?php

namespace App\Services\PriceList;

use App\Dtos\PriceList\ArticleDto;
use App\Models\PriceList\Article;

class ArticleService
{
    public function store(ArticleDto $dto): Article
    {
        return Article::create([
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

    public function update(Article $article, ArticleDto $dto): Article
    {
        $article->update([
            'name' => $dto->name,
            'color' => $dto->color,
            'saleable' => $dto->saleable ?? true,
            'parent_id' => $dto->parent_id,
            'saleable_from' => $dto->saleable_from,
            'saleable_to' => $dto->saleable_to,
            'price' => $dto->price,
            'vat_rate_id' => $dto->vat_rate_id,
        ]);

        return $article->fresh();
    }

    public function destroy(Article $article): void
    {
        $article->delete();
    }
}
