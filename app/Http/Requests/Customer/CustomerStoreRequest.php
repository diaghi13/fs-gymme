<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class CustomerStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return tenancy()->central(fn () => $this->user()->can('create-customer'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Personal Info
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', 'string', 'in:M,F,other'],
            'birthplace' => ['nullable', 'string', 'max:255'],

            // Tax Info
            'tax_id_code' => ['required', 'string', 'max:16', 'regex:/^[A-Z0-9]+$/i'],
            'tax_code' => ['nullable', 'string', 'max:16'],
            'vat_number' => ['nullable', 'string', 'max:11', 'regex:/^[0-9]{11}$/'],

            // Contacts - email required and unique per tenant
            'email' => ['required', 'email', 'max:255', 'unique:customers,email'],
            'phone' => ['nullable', 'string', 'max:20'],

            // Address
            'street' => ['nullable', 'string', 'max:255'],
            'number' => ['nullable', 'string', 'max:10'],
            'city' => ['nullable', 'string', 'max:100'],
            'zip' => ['nullable', 'string', 'max:5', 'regex:/^[0-9]{5}$/'],
            'province' => ['nullable', 'string', 'max:2', 'regex:/^[A-Z]{2}$/i'],
            'country' => ['nullable', 'string', 'size:2', 'regex:/^[A-Z]{2}$/i'],

            // GDPR Consents
            'gdpr_consent' => ['nullable', 'boolean'],
            'marketing_consent' => ['nullable', 'boolean'],
            'photo_consent' => ['nullable', 'boolean'],
            'medical_data_consent' => ['nullable', 'boolean'],

            // Optional
            'structure_id' => ['nullable', 'exists:structures,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'Un cliente con questa email esiste già in questa struttura.',
            'tax_id_code.regex' => 'Il codice fiscale deve contenere solo lettere e numeri.',
            'vat_number.regex' => 'La partita IVA deve essere composta da 11 cifre.',
            'zip.regex' => 'Il CAP deve essere composto da 5 cifre.',
            'province.regex' => 'La provincia deve essere composta da 2 lettere (es: MI, RM).',
            'birth_date.before' => 'La data di nascita deve essere antecedente a oggi.',
        ];
    }
}
