<?php

namespace App\Dtos\PriceList;

use Spatie\LaravelData\Attributes\Validation\AfterOrEqual;
use Spatie\LaravelData\Attributes\Validation\Between;
use Spatie\LaravelData\Attributes\Validation\Exists;
use Spatie\LaravelData\Attributes\Validation\Integer;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Min;
use Spatie\LaravelData\Attributes\Validation\Nullable;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Attributes\Validation\StringType;
use Spatie\LaravelData\Data;

class TokenDto extends Data
{
    public function __construct(
        #[Required, StringType, Max(255)]
        public string $name,

        #[Nullable, StringType, Max(7)]
        public ?string $color,

        #[Nullable]
        public ?bool $saleable,

        #[Nullable, Integer, Exists('price_lists', 'id')]
        public ?int $parent_id,

        #[Nullable]
        public ?string $saleable_from,

        #[Nullable, AfterOrEqual('saleable_from')]
        public ?string $saleable_to,

        #[Required, Integer, Min(0)]
        public int $price,

        #[Required, Integer, Exists('vat_rates', 'id')]
        public int $vat_rate_id,

        #[Required, Integer, Between(1, 1000)]
        public int $entrances,

        #[Nullable, Integer, Between(1, 3650)]
        public ?int $validity_days,
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
            'entrances' => ['required', 'integer', 'between:1,1000'],
            'validity_days' => ['nullable', 'integer', 'between:1,3650'],
        ];
    }
}
