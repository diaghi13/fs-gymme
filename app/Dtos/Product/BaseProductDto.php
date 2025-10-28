<?php

namespace App\Dtos\Product;

use App\Dtos\BaseDto;
use App\Models\VatRate;
use App\Support\Color;

final class BaseProductDto extends BaseDto
{
    public ?int $id = null;
    public ?int $category_id = null;
    public string $name = '';
    public ?string $slug = null;
    public string $color = '#000000';
    public ?string $sku = null;
    public ?string $type = null;
    public ?string $unit_type = null;
    public bool $is_active = true;
    public ?bool $requires_trainer = null;
    public ?bool $saleable_in_subscription = null;
    public ?int $vat_rate_id = null;
    public ?string $selling_description = null;
    public ?string $description = null;
    public ?string $short_description = null;
    public ?string $image_path = null;
    public ?bool $is_bookable = null;
    public ?string $prerequisites = null;
    public ?array $settings = null;

    public ?VatRate $vat_rate = null;

    protected static function validationRules(): array
    {
        return [
            // Generali
            'category_id' => ['nullable', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'color' => ['required', 'string', 'max:7', function ($attribute, $value, $fail) {
                if (!Color::isValidHex($value)) {
                    $fail('The ' . $attribute . ' must be a valid hex color code.');
                }
            }],
            'sku' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'max:255'],
            'unit_type' => ['nullable', 'string', 'max:255'],
            'is_active' => ['required', 'boolean'],

            // Vendita
            'requires_trainer' => ['nullable', 'boolean'],
            'saleable_in_subscription' => ['nullable', 'boolean'],
            'vat_rate_id' => ['nullable', 'exists:vat_rates,id'],
            'selling_description' => ['nullable', 'string', 'max:255'],

            // Online
            'description' => ['nullable', 'string', 'max:2000'],
            'short_description' => ['nullable', 'string', 'max:250'],
            'image_path' => ['nullable', 'string', 'max:255'],
            'is_bookable' => ['nullable', 'boolean'],

            // Avanzate
            'prerequisites' => ['nullable', 'string', 'max:2000'],
            'settings' => ['nullable', 'array'],
        ];
    }

    public static function casts(): array
    {
        return [
            'id' => 'integer',
            'category_id' => 'integer',
            'name' => 'string',
            'slug' => 'string',
            'color' => 'string',
            'sku' => 'string',
            'type' => 'string',
            'unit_type' => 'string',
            'is_active' => 'boolean',
            'requires_trainer' => 'boolean',
            'saleable_in_subscription' => 'boolean',
            'vat_rate_id' => 'integer',
            'selling_description' => 'string',
            'description' => 'string',
            'short_description' => 'string',
            'image_path' => 'string',
            'is_bookable' => 'boolean',
            'prerequisites' => 'string',
            'settings' => 'array',
        ];
    }
}
