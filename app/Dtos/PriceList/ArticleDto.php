<?php

namespace App\Dtos\PriceList;

use Spatie\LaravelData\Data;

class ArticleDto extends Data
{
    public function __construct(
        public ?int $id,
        public string $name,
        public ?string $color,
        public ?bool $saleable,
        public ?int $parent_id,
        public ?string $saleable_from,
        public ?string $saleable_to,
        public int $price,
        public int $vat_rate_id,
    ) {}

    public static function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:7'],
            'saleable' => ['nullable', 'boolean'],
            'parent_id' => ['nullable', 'integer', 'exists:price_lists,id'],
            'saleable_from' => ['nullable', 'date'],
            'saleable_to' => ['nullable', 'date', 'after_or_equal:saleable_from'],
            'price' => ['required', 'integer', 'min:0'],
            'vat_rate_id' => ['required', 'integer', 'exists:vat_rates,id'],
        ];
    }
}
