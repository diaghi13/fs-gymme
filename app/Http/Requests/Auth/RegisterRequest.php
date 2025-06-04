<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
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
            'user.first_name' => 'required|string|max:255',
            'user.last_name' => 'required|string|max:255',
            'user.email' => 'required|string|lowercase|email|max:255|unique:users,email',
            'user.password' => 'required|string|min:8|confirmed',

            'company.business_name' => 'required|string|max:255',
            'company.tax_code' => 'required|string|max:255',
            'company.vat_number' => 'required|string|max:255',
            'company.street' => 'required|string|max:255',
            'company.number' => 'required|string|max:255',
            'company.city' => 'required|string|max:255',
            'company.zip_code' => 'required|string|max:255',
            'company.province' => 'required|string|max:255',
            'company.country' => 'required|string|max:255',

            'structure.name' => 'required|string|max:255',
            'structure.street' => 'required|string|max:255',
            'structure.number' => 'required|string|max:255',
            'structure.city' => 'required|string|max:255',
            'structure.zip_code' => 'required|string|max:255',
            'structure.province' => 'required|string|max:255',
            'structure.country' => 'required|string|max:255',
        ];
    }
}
