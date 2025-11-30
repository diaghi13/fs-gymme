<?php

namespace App\Http\Requests\Products;

use Illuminate\Foundation\Http\FormRequest;

class BaseProductStoreRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'color' => 'required|string|max:7',
            'is_active' => 'required|boolean',
            'sale_in_subscription' => 'nullable|boolean',
            'selling_description' => 'nullable|string|max:255',
        ];
    }

    public function messages()
    {
        return [
            'name.required' => __('validation.required', ['attribute' => __('fields.name')]),
            'name.string' => __('validation.string', ['attribute' => __('fields.name')]),
            'name.max' => __('validation.max.string', ['attribute' => __('fields.name'), 'max' => 255]),
            'color.required' => __('validation.required', ['attribute' => __('fields.color')]),
            'color.string' => __('validation.string', ['attribute' => __('fields.color')]),
            'color.max' => __('validation.max.string', ['attribute' => __('fields.color'), 'max' => 7]),
            'is_active.required' => __('validation.required', ['attribute' => __('fields.is_active')]),
            'is_active.boolean' => __('validation.boolean', ['attribute' => __('fields.is_active')]),
        ];
    }
}
