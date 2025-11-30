<?php

namespace App\Http\Requests\Sales;

use Illuminate\Foundation\Http\FormRequest;

class StoreSaleRequest extends FormRequest
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
            // NOTE: Frontend invia document_type_electronic_invoice_id con nome 'document_type_id'
            // Vedi docs/SALES_DOCUMENT_TYPE_REFACTORING.md per refactoring pianificato
            'document_type_id' => ['required', 'integer', 'exists:document_type_electronic_invoices,id'],
            'progressive_number' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date'],
            'year' => ['required', 'integer', 'min:2000', 'max:2100'],
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'payment_condition_id' => ['required', 'integer', 'exists:payment_conditions,id'],
            'financial_resource_id' => ['required', 'integer', 'exists:financial_resources,id'],
            'promotion_id' => ['nullable', 'integer', 'exists:promotions,id'],
            'discount_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'discount_absolute' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'in:draft,completed,cancelled,saved'],
            'tax_included' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string', 'max:1000'],

            'sale_rows' => ['required', 'array', 'min:1'],
            'sale_rows.*.price_list_id' => ['required', 'integer', 'exists:price_lists,id'],
            'sale_rows.*.quantity' => ['required', 'numeric', 'min:1'],
            'sale_rows.*.unit_price' => ['required', 'numeric', 'min:0'],
            'sale_rows.*.percentage_discount' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'sale_rows.*.absolute_discount' => ['nullable', 'numeric', 'min:0'],
            'sale_rows.*.start_date' => ['nullable', 'date'],
            'sale_rows.*.subscription_selected_content' => ['nullable', 'array'],
            'sale_rows.*.subscription_selected_content.*.id' => ['required', 'integer', 'exists:subscription_contents,id'],

            'payments' => ['required', 'array', 'min:1'],
            'payments.*.due_date' => ['required', 'date'],
            'payments.*.amount' => ['required', 'numeric', 'min:0'],
            'payments.*.payment_method_id' => ['required', 'integer', 'exists:payment_methods,id'],
            'payments.*.payed_at' => ['nullable', 'date'],
        ];
    }

    /**
     * Get custom error messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'document_type_id.required' => 'Il tipo documento è obbligatorio.',
            'document_type_id.exists' => 'Il tipo documento selezionato non è valido.',
            'progressive_number.required' => 'Il numero progressivo è obbligatorio.',
            'date.required' => 'La data è obbligatoria.',
            'year.required' => 'L\'anno è obbligatorio.',
            'customer_id.required' => 'Il cliente è obbligatorio.',
            'customer_id.exists' => 'Il cliente selezionato non esiste.',
            'payment_condition_id.required' => 'La condizione di pagamento è obbligatoria.',
            'payment_condition_id.exists' => 'La condizione di pagamento selezionata non è valida.',
            'financial_resource_id.required' => 'La risorsa finanziaria è obbligatoria.',
            'financial_resource_id.exists' => 'La risorsa finanziaria selezionata non è valida.',
            'status.required' => 'Lo stato è obbligatorio.',
            'status.in' => 'Lo stato selezionato non è valido.',
            'sale_rows.required' => 'Devi aggiungere almeno un prodotto.',
            'sale_rows.min' => 'Devi aggiungere almeno un prodotto.',
            'payments.required' => 'Devi aggiungere almeno un pagamento.',
            'payments.min' => 'Devi aggiungere almeno un pagamento.',
        ];
    }
}
