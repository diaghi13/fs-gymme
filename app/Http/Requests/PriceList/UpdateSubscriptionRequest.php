<?php

namespace App\Http\Requests\PriceList;

class UpdateSubscriptionRequest extends StoreSubscriptionRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Update uses the same rules as store
        return parent::rules();
    }
}
