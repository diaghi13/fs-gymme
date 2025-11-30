<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class CustomerSubscriptionUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['sometimes', 'string', 'in:subscription,entrance_card'],
            'price_list_id' => ['sometimes', 'exists:price_lists,id'],
            'entitable_type' => ['nullable', 'string'],
            'entitable_id' => ['nullable', 'integer'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'card_number' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
            'status' => ['sometimes', 'string', 'in:active,suspended,expired,cancelled'],
            'reason' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'type.in' => 'Il tipo di abbonamento deve essere "abbonamento" o "tessera ingressi".',
            'price_list_id.exists' => 'Il listino prezzi selezionato non esiste.',
            'start_date.date' => 'La data di inizio deve essere una data valida.',
            'end_date.date' => 'La data di fine deve essere una data valida.',
            'end_date.after_or_equal' => 'La data di fine deve essere successiva o uguale alla data di inizio.',
            'card_number.max' => 'Il numero di tessera non può superare i 50 caratteri.',
            'status.in' => 'Lo stato deve essere uno tra: attivo, sospeso, scaduto, cancellato.',
            'reason.max' => 'Il motivo non può superare i 500 caratteri.',
        ];
    }
}
