<?php

namespace App\Services\PriceList;

use App\Enums\PriceListItemTypeEnum;
use App\Models\PriceList\Article;
use App\Models\PriceList\Membership;
use App\Models\PriceList\PriceList;
use App\Models\PriceList\Subscription;
use App\Models\Product\BaseProduct;
use App\Models\Product\CourseProduct;
use App\Services\VatRateService;
use Illuminate\Support\Facades\DB;

class SubscriptionPriceListService
{
    public function store(array $data)
    {
        return DB::transaction(function () use ($data) {
            $subscription = Subscription::create([
                'name' => $data['name'],
                'parent_id' => $data['parent_id'],
                'color' => $data['color'],
                'saleable' => $data['saleable'],
            ]);

            foreach ($data['standard_content'] as $content) {
                $subscription->standard_content()->create([
                    'price_listable_id' => $content['price_listable_id'],
                    'price_listable_type' => $content['price_listable_type'],
                    'days_duration' => $content['days_duration'] ?? null,
                    'months_duration' => $content['months_duration'] ?? null,
                    'price' => $content['price'],
                    'vat_rate_id' => $content['vat_rate_id'],
                    'entrances' => $content['entrances'] ?? null,
                    'daily_access' => $content['daily_access'] ?? null,
                    'weekly_access' => $content['weekly_access'] ?? null,
                    'reservation_limit' => $content['reservation_limit'] ?? null,
                    'daily_reservation_limit' => $content['daily_reservation_limit'] ?? null,
                    'is_optional' => $content['is_optional'] ?? false,
                ]);
            }

            return $subscription;
        });
    }

    public function update(array $data, Subscription $subscription)
    {
        return DB::transaction(function () use ($data, $subscription) {
            $subscription->update([
                'name' => $data['name'],
                'parent_id' => $data['parent_id'],
                'color' => $data['color'],
                'saleable' => $data['saleable'],
            ]);

            $oldContentIds = $subscription->standard_content()->pluck('id')->toArray();
            $newContentIds = collect($data['standard_content'])->pluck('id')->filter()->toArray();
            $idsToDelete = array_diff($oldContentIds, $newContentIds);

            foreach ($data['standard_content'] as $content) {
                if (isset($content['id'])) {
                    $subscription->standard_content()->find($content['id'])->update($content);
                } else {
                    $subscription->standard_content()->create($content);
                }
            }

            foreach ($idsToDelete as $id) {
                $subscription->standard_content()->find($id)->delete();
            }

            return $subscription;
        });
    }

    public function updateOptionalContent(array $data, Subscription $subscription)
    {
        return DB::transaction(function () use ($data, $subscription) {
            $oldContentIds = $subscription->optional_content()->pluck('id')->toArray();
            $newContentIds = collect($data['optional_content'])->pluck('id')->filter()->toArray();
            $idsToDelete = array_diff($oldContentIds, $newContentIds);

            foreach ($data['optional_content'] as $content) {
                if (isset($content['id'])) {
                    $subscription->optional_content()->find($content['id'])->update($content);
                } else {
                    $subscription->optional_content()->create($content);
                }
            }

            foreach ($idsToDelete as $id) {
                $subscription->optional_content()->find($id)->delete();
            }

            return $subscription;
        });
    }

    public static function toTree()
    {
        return (new PriceList)->toTree();
    }

    public static function getViewAttributes()
    {
        return [
            ...PriceListService::getViewAttributes(),
            'baseProducts' => BaseProduct::with('vat_rate')->where('sale_in_subscription', true)->get(),
            'courseProducts' => CourseProduct::with('vat_rate')->where('sale_in_subscription', true)->get(),
            'articles' => Article::with('vat_rate')->get(),
            'membershipFees' => Membership::with('vat_rate')->get(),
        ];
    }
}
