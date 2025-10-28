<?php

namespace App\Http\Requests\Products;

use App\Enums\ProductType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BaseProductUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Generali
            'category_id'               => ['nullable', 'exists:categories,id'],
            'name'                      => ['required', 'string', 'max:255', Rule::unique('products', 'name')->ignore($this->route('base_product'))],
            'slug'                      => ['required', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($this->route('base_product'))],
            'color'                     => ['required', 'string', 'max:7'],
            'sku'                       => ['nullable', 'string', 'max:255', Rule::unique('products', 'sku')->ignore($this->route('base_product'))],
            'type'                      => ['nullable', Rule::in(ProductType::cases())],
            'unit_type'                 => ['nullable', 'string', 'max:255'],
            'is_active'                 => ['required', 'boolean'],

            // Vendita
            'requires_trainer'          => ['nullable', 'boolean'],
            'saleable_in_subscription'  => ['nullable', 'boolean'],
            'vat_rate_id'               => ['nullable', 'exists:vat_rates,id'],
            'selling_description'       => ['nullable', 'string', 'max:255'],

            // Online
            'description'               => ['nullable', 'string', 'max:2000'],
            'short_description'         => ['nullable', 'string', 'max:250'],
            'image_path'                => ['nullable', 'string', 'max:255'],
            'is_bookable'               => ['nullable', 'boolean'],

            // Avanzate
            'prerequisites'             => ['nullable', 'string', 'max:2000'],
            'settings'                  => ['nullable', 'array'],
        ];
    }
}
