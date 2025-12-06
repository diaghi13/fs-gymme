<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class TenantRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Public registration is allowed
    }

    public function rules(): array
    {
        $isDemo = $this->input('is_demo', false);

        // For demo registration, only user data is required
        if ($isDemo) {
            return [
                'is_demo' => ['required', 'boolean'],
                'user.first_name' => ['required', 'string', 'max:255'],
                'user.last_name' => ['required', 'string', 'max:255'],
                'user.email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
                'user.password' => ['required', 'confirmed', Password::defaults()],
                'terms_accepted' => ['required', 'accepted'],
            ];
        }

        // For paid registration, full data is required
        return [
            // User (owner) information
            'user.first_name' => ['required', 'string', 'max:255'],
            'user.last_name' => ['required', 'string', 'max:255'],
            'user.email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'user.password' => ['required', 'confirmed', Password::defaults()],

            // Company information
            'company.business_name' => ['required', 'string', 'max:255'],
            'company.tax_code' => ['required', 'string', 'max:50'],
            'company.vat_number' => ['required', 'string', 'max:50'],
            'company.street' => ['required', 'string', 'max:255'],
            'company.number' => ['nullable', 'string', 'max:20'],
            'company.city' => ['required', 'string', 'max:100'],
            'company.zip_code' => ['required', 'string', 'max:20'],
            'company.province' => ['nullable', 'string', 'max:50'],
            'company.country' => ['nullable', 'string', 'max:2'],
            'company.phone' => ['required', 'string', 'max:20'],
            'company.email' => ['required', 'email', 'max:255'],
            'company.pec_email' => ['required', 'email', 'max:255'],
            'company.sdi_code' => ['nullable', 'string', 'max:7'],

            // Structure information (conditional on same_as_company flag)
            'structure.same_as_company' => ['required', 'boolean'],
            'structure.name' => ['required_if:structure.same_as_company,false', 'nullable', 'string', 'max:255'],
            'structure.street' => ['required_if:structure.same_as_company,false', 'nullable', 'string', 'max:255'],
            'structure.number' => ['nullable', 'string', 'max:20'],
            'structure.city' => ['required_if:structure.same_as_company,false', 'nullable', 'string', 'max:100'],
            'structure.zip_code' => ['required_if:structure.same_as_company,false', 'nullable', 'string', 'max:20'],
            'structure.province' => ['nullable', 'string', 'max:50'],
            'structure.country' => ['nullable', 'string', 'max:2'],
            'structure.phone' => ['nullable', 'string', 'max:20'],
            'structure.email' => ['nullable', 'email', 'max:255'],

            // Terms acceptance
            'terms_accepted' => ['required', 'accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'user.first_name.required' => 'Il nome è obbligatorio.',
            'user.last_name.required' => 'Il cognome è obbligatorio.',
            'user.email.required' => 'L\'email è obbligatoria.',
            'user.email.email' => 'Inserisci un indirizzo email valido.',
            'user.email.unique' => 'Esiste già un utente con questa email.',
            'user.password.required' => 'La password è obbligatoria.',
            'user.password.confirmed' => 'Le password non corrispondono.',

            'company.business_name.required' => 'La ragione sociale è obbligatoria.',
            'company.tax_code.required' => 'Il codice fiscale è obbligatorio.',
            'company.vat_number.required' => 'La partita IVA è obbligatoria.',
            'company.street.required' => 'La via è obbligatoria.',
            'company.city.required' => 'La città è obbligatoria.',
            'company.zip_code.required' => 'Il CAP è obbligatorio.',
            'company.phone.required' => 'Il telefono è obbligatorio.',
            'company.email.required' => 'L\'email è obbligatoria.',
            'company.pec_email.required' => 'La PEC è obbligatoria.',

            'structure.same_as_company.required' => 'Indica se la struttura corrisponde alla sede legale.',
            'structure.name.required_if' => 'Il nome della struttura è obbligatorio.',
            'structure.street.required_if' => 'La via della struttura è obbligatoria.',
            'structure.city.required_if' => 'La città della struttura è obbligatoria.',
            'structure.zip_code.required_if' => 'Il CAP della struttura è obbligatorio.',

            'terms_accepted.required' => 'Devi accettare i termini e condizioni.',
            'terms_accepted.accepted' => 'Devi accettare i termini e condizioni per procedere.',
        ];
    }

    public function attributes(): array
    {
        return [
            'user.first_name' => 'nome',
            'user.last_name' => 'cognome',
            'user.email' => 'email',
            'user.password' => 'password',
            'company.business_name' => 'ragione sociale',
            'company.tax_code' => 'codice fiscale',
            'company.vat_number' => 'partita IVA',
            'company.phone' => 'telefono',
            'company.email' => 'email azienda',
            'company.pec_email' => 'PEC',
            'structure.name' => 'nome struttura',
        ];
    }
}
