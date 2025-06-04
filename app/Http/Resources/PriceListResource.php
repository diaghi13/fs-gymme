<?php

namespace App\Http\Resources;

use App\Enums\PriceListItemTypeEnum;
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
                'months' => $this->months,
                'vat_rate_id' => $this->vat_rate_id,
                'vat_rate' => $this->vat_rate,
            ];
        }

        if ($this->type === PriceListItemTypeEnum::SUBSCRIPTION->value) {
            $data = [
                ...$data,
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
