<?php

namespace App\Http\Requests\Central;

use Illuminate\Foundation\Http\FormRequest;

class SubscriptionPlanRequest extends FormRequest
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
        $subscriptionPlanId = $this->route('subscription_plan')?->id;

        return [
            'name' => 'required|string|max:255',
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                \Illuminate\Validation\Rule::unique('subscription_plans')->ignore($subscriptionPlanId),
            ],
            'description' => 'nullable|string|max:1000',
            'price' => 'required|integer|min:0', // Store as cents
            'currency' => 'required|string|max:10',
            'interval' => 'required|string|in:monthly,yearly,weekly,daily',
            'trial_days' => 'nullable|integer|min:0|max:365',
            'tier' => 'nullable|string|in:base,gold,platinum',
            'is_trial_plan' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
            'stripe_price_id' => 'nullable|string|max:255',

            // Features
            'features' => 'nullable|array',
            'features.*.feature_id' => 'required|exists:plan_features,id',
            'features.*.is_included' => 'required|boolean',
            'features.*.quota_limit' => 'nullable|integer|min:0',
            'features.*.price_cents' => 'nullable|integer|min:0',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'nome',
            'slug' => 'slug',
            'description' => 'descrizione',
            'price' => 'prezzo',
            'currency' => 'valuta',
            'interval' => 'intervallo',
            'trial_days' => 'giorni di prova',
            'tier' => 'livello',
            'is_trial_plan' => 'piano di prova',
            'is_active' => 'attivo',
            'sort_order' => 'ordine',
            'stripe_price_id' => 'ID prezzo Stripe',
        ];
    }

    /**
     * Get custom error messages.
     */
    public function messages(): array
    {
        return [
            'slug.regex' => 'Lo slug può contenere solo lettere minuscole, numeri e trattini.',
            'slug.unique' => 'Questo slug è già utilizzato.',
            'price.integer' => 'Il prezzo deve essere un numero intero (in centesimi).',
            'trial_days.max' => 'I giorni di prova non possono superare 365.',
            'tier.in' => 'Il livello deve essere: base, gold o platinum.',
            'interval.in' => 'L\'intervallo deve essere: monthly, yearly, weekly o daily.',
        ];
    }
}
