<?php

namespace App\Http\Requests\PriceList;

use App\Enums\SubscriptionContentType;
use Illuminate\Foundation\Http\FormRequest;

class StoreSubscriptionRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'integer', 'exists:price_lists,id'],
            'color' => ['required', 'string', 'max:7'],
            'saleable' => ['boolean'],

            // Subscription-level benefits
            'guest_passes_total' => ['nullable', 'integer', 'min:0'],
            'guest_passes_per_month' => ['nullable', 'integer', 'min:0'],
            'multi_location_access' => ['nullable', 'boolean'],

            // Standard content rules
            'standard_content' => ['nullable', 'array'],
            ...$this->getContentRules('standard_content'),

            // Optional content rules
            'optional_content' => ['nullable', 'array'],
            ...$this->getContentRules('optional_content'),
        ];
    }

    /**
     * Get validation rules for subscription content (reusable for both standard and optional)
     */
    protected function getContentRules(string $prefix): array
    {
        return [
            "{$prefix}.*.id" => ['nullable', 'integer'],
            "{$prefix}.*.price_listable_id" => ['required', 'integer'],
            "{$prefix}.*.price_listable_type" => [
                'required',
                'string',
                'in:'.implode(',', SubscriptionContentType::values()),
            ],
            "{$prefix}.*.is_optional" => ['nullable', 'boolean'],
            "{$prefix}.*.days_duration" => ['nullable', 'integer', 'min:0'],
            "{$prefix}.*.months_duration" => ['nullable', 'integer', 'min:0'],
            "{$prefix}.*.entrances" => ['nullable', 'integer', 'min:0'],
            "{$prefix}.*.price" => ['required', 'numeric', 'min:0'],
            "{$prefix}.*.vat_rate_id" => ['required', 'exists:vat_rates,id'],

            // Access rules
            "{$prefix}.*.unlimited_entries" => ['nullable', 'boolean'],
            "{$prefix}.*.total_entries" => ['nullable', 'integer', 'min:1'],
            "{$prefix}.*.daily_entries" => ['nullable', 'integer', 'min:1'],
            "{$prefix}.*.weekly_entries" => ['nullable', 'integer', 'min:1'],
            "{$prefix}.*.monthly_entries" => ['nullable', 'integer', 'min:1'],

            // Booking rules
            "{$prefix}.*.max_concurrent_bookings" => ['nullable', 'integer', 'min:1'],
            "{$prefix}.*.daily_bookings" => ['nullable', 'integer', 'min:1'],
            "{$prefix}.*.weekly_bookings" => ['nullable', 'integer', 'min:1'],
            "{$prefix}.*.advance_booking_days" => ['nullable', 'integer', 'min:0'],
            "{$prefix}.*.cancellation_hours" => ['nullable', 'integer', 'min:0'],

            // Validity rules
            "{$prefix}.*.validity_type" => ['nullable', 'string', 'in:duration,fixed_date,first_use'],
            "{$prefix}.*.validity_days" => ['nullable', 'integer', 'min:1'],
            "{$prefix}.*.validity_months" => ['nullable', 'integer', 'min:1'],
            "{$prefix}.*.valid_from" => ['nullable', 'date'],
            "{$prefix}.*.valid_to" => ['nullable', 'date', 'after:valid_from'],
            "{$prefix}.*.freeze_days_allowed" => ['nullable', 'integer', 'min:0'],
            "{$prefix}.*.freeze_cost_cents" => ['nullable', 'integer', 'min:0'],

            // Time restrictions
            "{$prefix}.*.has_time_restrictions" => ['nullable', 'boolean'],

            // Service access
            "{$prefix}.*.service_access_type" => ['nullable', 'string', 'in:all,included,excluded'],

            // Metadata
            "{$prefix}.*.sort_order" => ['nullable', 'integer', 'min:0'],
            "{$prefix}.*.settings" => ['nullable', 'array'],

            // Services relationship
            "{$prefix}.*.services" => ['nullable', 'array'],
            "{$prefix}.*.services.*.id" => ['required', 'exists:products,id'],
            "{$prefix}.*.services.*.usage_limit" => ['nullable', 'integer', 'min:1'],
            "{$prefix}.*.services.*.usage_period" => ['nullable', 'string', 'in:day,week,month'],

            // Time restrictions relationship
            "{$prefix}.*.time_restrictions" => ['nullable', 'array'],
            "{$prefix}.*.time_restrictions.*.days" => ['nullable', 'array'],
            "{$prefix}.*.time_restrictions.*.days.*" => ['string', 'in:monday,tuesday,wednesday,thursday,friday,saturday,sunday'],
            "{$prefix}.*.time_restrictions.*.start_time" => ['required_with:'.$prefix.'.*.time_restrictions.*.end_time', 'date_format:H:i'],
            "{$prefix}.*.time_restrictions.*.end_time" => ['required_with:'.$prefix.'.*.time_restrictions.*.start_time', 'date_format:H:i', 'after:'.$prefix.'.*.time_restrictions.*.start_time'],
            "{$prefix}.*.time_restrictions.*.restriction_type" => ['nullable', 'string', 'in:allowed,blocked'],
            "{$prefix}.*.time_restrictions.*.description" => ['nullable', 'string', 'max:255'],

            // Legacy fields (backward compatibility)
            "{$prefix}.*.daily_access" => ['nullable', 'integer', 'min:0'],
            "{$prefix}.*.weekly_access" => ['nullable', 'integer', 'min:0'],
            "{$prefix}.*.reservation_limit" => ['nullable', 'integer', 'min:0'],
            "{$prefix}.*.daily_reservation_limit" => ['nullable', 'integer', 'min:0'],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert empty string to null for parent_id (foreign key constraint)
        if ($this->has('parent_id') && $this->input('parent_id') === '') {
            $this->merge(['parent_id' => null]);
        }
    }
}
