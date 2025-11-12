<?php

namespace App\Http\Resources;

use App\Enums\PriceListItemTypeEnum;
use App\Enums\PriceListType;
use App\Models\PriceList\SubscriptionContent;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PriceListResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'type' => $this->type,
            'name' => $this->name,
            'color' => $this->color,
            'saleable' => $this->saleable,
            'parent_id' => $this->parent_id,
            'saleable_from' => $this->saleable_from,
            'saleable_to' => $this->saleable_to,
            'price' => $this->price,
            'selling_description' => $this->selling_description,
        ];

        if ($this->type === PriceListItemTypeEnum::ARTICLE->value) {
            $data = [
                ...$data,
                'vat_rate_id' => $this->vat_rate_id,
                'vat_rate' => $this->vat_rate,
            ];
        }

        if ($this->type === PriceListItemTypeEnum::MEMBERSHIP->value) {
            $data = [
                ...$data,
                'months_duration' => $this->months_duration,
                'vat_rate_id' => $this->vat_rate_id,
                'vat_rate' => $this->vat_rate,
            ];
        }

        if ($this->type === 'token') {
            $data = [
                ...$data,
                'months_duration' => $this->months_duration,
                'validity_days' => $this->validity_days,
                'validity_months' => $this->validity_months,
                'token_quantity' => $this->token_quantity,
                'vat_rate_id' => $this->vat_rate_id,
                'vat_rate' => $this->vat_rate,
            ];
        }

        if ($this->type === 'day_pass') {
            $data = [
                ...$data,
                'vat_rate_id' => $this->vat_rate_id,
                'vat_rate' => $this->vat_rate,
            ];
        }

        if ($this->type === 'gift_card') {
            $data = [
                ...$data,
                'validity_months' => $this->validity_months,
                'vat_rate_id' => $this->vat_rate_id,
                'vat_rate' => $this->vat_rate,
            ];
        }

        if ($this->type === PriceListType::SUBSCRIPTION) {
            $data = [
                ...$data,
                // Subscription-level benefits
                'guest_passes_total' => $this->guest_passes_total,
                'guest_passes_per_month' => $this->guest_passes_per_month,
                'multi_location_access' => $this->multi_location_access,

                'standard_content' => $this->whenLoaded('standard_content', function () {
                    return $this->standard_content->map(function ($item) {
                        return $this->priceListContent($item);
                    });
                }),
                'optional_content' => $this->whenLoaded('optional_content', function () {
                    return $this->optional_content->map(function ($item) {
                        return $this->priceListContent($item);
                    });
                }),
            ];
        }

        return $data;
    }

    protected function priceListContent(SubscriptionContent $content)
    {
        return [
            'id' => $content->id,
            'days_duration' => $content->days_duration,
            'months_duration' => $content->months_duration,
            'entrance' => $content->entrance,
            'price' => $content->price,
            'vat_rate_id' => $content->price_listable->vat_rate_id,
            'vat_rate' => $content->price_listable->vat_rate,
            'is_optional' => $content->is_optional,

            // Access rules
            'unlimited_entries' => $content->unlimited_entries,
            'total_entries' => $content->total_entries,
            'daily_entries' => $content->daily_entries,
            'weekly_entries' => $content->weekly_entries,
            'monthly_entries' => $content->monthly_entries,

            // Booking rules
            'max_concurrent_bookings' => $content->max_concurrent_bookings,
            'daily_bookings' => $content->daily_bookings,
            'weekly_bookings' => $content->weekly_bookings,
            'advance_booking_days' => $content->advance_booking_days,
            'cancellation_hours' => $content->cancellation_hours,

            // Validity rules
            'validity_type' => $content->validity_type,
            'validity_days' => $content->validity_days,
            'validity_months' => $content->validity_months,
            'valid_from' => $content->valid_from,
            'valid_to' => $content->valid_to,
            'freeze_days_allowed' => $content->freeze_days_allowed,
            'freeze_cost_cents' => $content->freeze_cost_cents,

            // Time restrictions
            'has_time_restrictions' => $content->has_time_restrictions,
            'time_restrictions' => $content->time_restrictions,

            // Service access
            'service_access_type' => $content->service_access_type,
            'services' => $content->services,

            // Metadata
            'sort_order' => $content->sort_order,
            'settings' => $content->settings,

            // Legacy fields (deprecated - use new comprehensive fields above)
            'daily_access' => $content->daily_access,
            'weekly_access' => $content->weekly_access,
            'reservation_limit' => $content->reservation_limit,
            'daily_reservation_limit' => $content->daily_reservation_limit,

            'price_listable_type' => $content->price_listable_type,
            'price_listable_id' => $content->price_listable_id,
            'price_listable' => $content->price_listable,
        ];
    }
}
