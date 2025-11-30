<?php

namespace App\Services\PriceList;

use App\Models\PriceList\Article;
use App\Models\PriceList\DayPass;
use App\Models\PriceList\GiftCard;
use App\Models\PriceList\Membership;
use App\Models\PriceList\PriceList;
use App\Models\PriceList\Subscription;
use App\Models\PriceList\Token;
use App\Models\Product\BaseProduct;
use App\Models\Product\BookableService;
use App\Models\Product\CourseProduct;
use Illuminate\Support\Facades\DB;

class SubscriptionPriceListService
{
    public function store(array $data)
    {
        return DB::transaction(function () use ($data) {
            $subscription = Subscription::create([
                'name' => $data['name'],
                'slug' => \Illuminate\Support\Str::slug($data['name']),
                'parent_id' => $data['parent_id'],
                'color' => $data['color'],
                'saleable' => $data['saleable'] ?? true,
                'guest_passes_total' => $data['guest_passes_total'] ?? null,
                'guest_passes_per_month' => $data['guest_passes_per_month'] ?? null,
                'multi_location_access' => $data['multi_location_access'] ?? false,
            ]);

            foreach ($data['standard_content'] as $contentData) {
                $subscriptionContent = $subscription->standard_content()->create([
                    'price_listable_id' => $contentData['price_listable_id'],
                    'price_listable_type' => $contentData['price_listable_type'],
                    'is_optional' => $contentData['is_optional'] ?? false,
                    'days_duration' => $contentData['days_duration'] ?? null,
                    'months_duration' => $contentData['months_duration'] ?? null,
                    'entrances' => $contentData['entrances'] ?? null,
                    'price' => $contentData['price'],
                    'vat_rate_id' => $contentData['vat_rate_id'],

                    // Access rules
                    'unlimited_entries' => $contentData['unlimited_entries'] ?? false,
                    'total_entries' => $contentData['total_entries'] ?? null,
                    'daily_entries' => $contentData['daily_entries'] ?? null,
                    'weekly_entries' => $contentData['weekly_entries'] ?? null,
                    'monthly_entries' => $contentData['monthly_entries'] ?? null,

                    // Booking rules
                    'max_concurrent_bookings' => $contentData['max_concurrent_bookings'] ?? null,
                    'daily_bookings' => $contentData['daily_bookings'] ?? null,
                    'weekly_bookings' => $contentData['weekly_bookings'] ?? null,
                    'advance_booking_days' => $contentData['advance_booking_days'] ?? null,
                    'cancellation_hours' => $contentData['cancellation_hours'] ?? null,

                    // Validity rules
                    'validity_type' => $contentData['validity_type'] ?? 'duration',
                    'validity_days' => $contentData['validity_days'] ?? null,
                    'validity_months' => $contentData['validity_months'] ?? null,
                    'valid_from' => $contentData['valid_from'] ?? null,
                    'valid_to' => $contentData['valid_to'] ?? null,
                    'freeze_days_allowed' => $contentData['freeze_days_allowed'] ?? null,
                    'freeze_cost_cents' => $contentData['freeze_cost_cents'] ?? null,

                    // Time restrictions
                    'has_time_restrictions' => $contentData['has_time_restrictions'] ?? false,

                    // Service access
                    'service_access_type' => $contentData['service_access_type'] ?? 'all',

                    // Benefits & perks

                    // Metadata
                    'sort_order' => $contentData['sort_order'] ?? 0,
                    'settings' => $contentData['settings'] ?? null,

                    // Legacy fields (backward compatibility)
                    'daily_access' => $contentData['daily_access'] ?? null,
                    'weekly_access' => $contentData['weekly_access'] ?? null,
                    'reservation_limit' => $contentData['reservation_limit'] ?? null,
                    'daily_reservation_limit' => $contentData['daily_reservation_limit'] ?? null,
                ]);

                // Sync services if provided
                if (! empty($contentData['services'])) {
                    $this->syncServices($subscriptionContent, $contentData['services']);
                }

                // Create time restrictions if provided
                if (! empty($contentData['time_restrictions'])) {
                    $this->syncTimeRestrictions($subscriptionContent, $contentData['time_restrictions']);
                }
            }

            return $subscription;
        });
    }

    public function update(array $data, Subscription $subscription)
    {
        return DB::transaction(function () use ($data, $subscription) {
            $subscription->update([
                'name' => $data['name'],
                'slug' => \Illuminate\Support\Str::slug($data['name']),
                'parent_id' => $data['parent_id'],
                'color' => $data['color'],
                'saleable' => $data['saleable'] ?? true,
                'guest_passes_total' => $data['guest_passes_total'] ?? null,
                'guest_passes_per_month' => $data['guest_passes_per_month'] ?? null,
                'multi_location_access' => $data['multi_location_access'] ?? false,
            ]);

            $oldContentIds = $subscription->standard_content()->pluck('id')->toArray();
            $newContentIds = collect($data['standard_content'])->pluck('id')->filter()->toArray();
            $idsToDelete = array_diff($oldContentIds, $newContentIds);

            foreach ($data['standard_content'] as $contentData) {
                if (isset($contentData['id'])) {
                    // Update existing content
                    $subscriptionContent = $subscription->standard_content()->find($contentData['id']);

                    $subscriptionContent->update([
                        'price_listable_id' => $contentData['price_listable_id'],
                        'price_listable_type' => $contentData['price_listable_type'],
                        'is_optional' => $contentData['is_optional'] ?? false,
                        'days_duration' => $contentData['days_duration'] ?? null,
                        'months_duration' => $contentData['months_duration'] ?? null,
                        'entrances' => $contentData['entrances'] ?? null,
                        'price' => $contentData['price'],
                        'vat_rate_id' => $contentData['vat_rate_id'],

                        // Access rules
                        'unlimited_entries' => $contentData['unlimited_entries'] ?? false,
                        'total_entries' => $contentData['total_entries'] ?? null,
                        'daily_entries' => $contentData['daily_entries'] ?? null,
                        'weekly_entries' => $contentData['weekly_entries'] ?? null,
                        'monthly_entries' => $contentData['monthly_entries'] ?? null,

                        // Booking rules
                        'max_concurrent_bookings' => $contentData['max_concurrent_bookings'] ?? null,
                        'daily_bookings' => $contentData['daily_bookings'] ?? null,
                        'weekly_bookings' => $contentData['weekly_bookings'] ?? null,
                        'advance_booking_days' => $contentData['advance_booking_days'] ?? null,
                        'cancellation_hours' => $contentData['cancellation_hours'] ?? null,

                        // Validity rules
                        'validity_type' => $contentData['validity_type'] ?? 'duration',
                        'validity_days' => $contentData['validity_days'] ?? null,
                        'validity_months' => $contentData['validity_months'] ?? null,
                        'valid_from' => $contentData['valid_from'] ?? null,
                        'valid_to' => $contentData['valid_to'] ?? null,
                        'freeze_days_allowed' => $contentData['freeze_days_allowed'] ?? null,
                        'freeze_cost_cents' => $contentData['freeze_cost_cents'] ?? null,

                        // Time restrictions
                        'has_time_restrictions' => $contentData['has_time_restrictions'] ?? false,

                        // Service access
                        'service_access_type' => $contentData['service_access_type'] ?? 'all',

                        // Benefits & perks

                        // Metadata
                        'sort_order' => $contentData['sort_order'] ?? 0,
                        'settings' => $contentData['settings'] ?? null,

                        // Legacy fields
                        'daily_access' => $contentData['daily_access'] ?? null,
                        'weekly_access' => $contentData['weekly_access'] ?? null,
                        'reservation_limit' => $contentData['reservation_limit'] ?? null,
                        'daily_reservation_limit' => $contentData['daily_reservation_limit'] ?? null,
                    ]);

                    // Sync services if provided
                    if (isset($contentData['services'])) {
                        $this->syncServices($subscriptionContent, $contentData['services']);
                    }

                    // Sync time restrictions if provided
                    if (isset($contentData['time_restrictions'])) {
                        $this->syncTimeRestrictions($subscriptionContent, $contentData['time_restrictions']);
                    }
                } else {
                    // Create new content
                    $subscriptionContent = $subscription->standard_content()->create([
                        'price_listable_id' => $contentData['price_listable_id'],
                        'price_listable_type' => $contentData['price_listable_type'],
                        'is_optional' => $contentData['is_optional'] ?? false,
                        'days_duration' => $contentData['days_duration'] ?? null,
                        'months_duration' => $contentData['months_duration'] ?? null,
                        'entrances' => $contentData['entrances'] ?? null,
                        'price' => $contentData['price'],
                        'vat_rate_id' => $contentData['vat_rate_id'],

                        // Access rules
                        'unlimited_entries' => $contentData['unlimited_entries'] ?? false,
                        'total_entries' => $contentData['total_entries'] ?? null,
                        'daily_entries' => $contentData['daily_entries'] ?? null,
                        'weekly_entries' => $contentData['weekly_entries'] ?? null,
                        'monthly_entries' => $contentData['monthly_entries'] ?? null,

                        // Booking rules
                        'max_concurrent_bookings' => $contentData['max_concurrent_bookings'] ?? null,
                        'daily_bookings' => $contentData['daily_bookings'] ?? null,
                        'weekly_bookings' => $contentData['weekly_bookings'] ?? null,
                        'advance_booking_days' => $contentData['advance_booking_days'] ?? null,
                        'cancellation_hours' => $contentData['cancellation_hours'] ?? null,

                        // Validity rules
                        'validity_type' => $contentData['validity_type'] ?? 'duration',
                        'validity_days' => $contentData['validity_days'] ?? null,
                        'validity_months' => $contentData['validity_months'] ?? null,
                        'valid_from' => $contentData['valid_from'] ?? null,
                        'valid_to' => $contentData['valid_to'] ?? null,
                        'freeze_days_allowed' => $contentData['freeze_days_allowed'] ?? null,
                        'freeze_cost_cents' => $contentData['freeze_cost_cents'] ?? null,

                        // Time restrictions
                        'has_time_restrictions' => $contentData['has_time_restrictions'] ?? false,

                        // Service access
                        'service_access_type' => $contentData['service_access_type'] ?? 'all',

                        // Benefits & perks

                        // Metadata
                        'sort_order' => $contentData['sort_order'] ?? 0,
                        'settings' => $contentData['settings'] ?? null,

                        // Legacy fields
                        'daily_access' => $contentData['daily_access'] ?? null,
                        'weekly_access' => $contentData['weekly_access'] ?? null,
                        'reservation_limit' => $contentData['reservation_limit'] ?? null,
                        'daily_reservation_limit' => $contentData['daily_reservation_limit'] ?? null,
                    ]);

                    // Sync services if provided
                    if (! empty($contentData['services'])) {
                        $this->syncServices($subscriptionContent, $contentData['services']);
                    }

                    // Create time restrictions if provided
                    if (! empty($contentData['time_restrictions'])) {
                        $this->syncTimeRestrictions($subscriptionContent, $contentData['time_restrictions']);
                    }
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

            foreach ($data['optional_content'] as $contentData) {
                if (isset($contentData['id'])) {
                    // Update existing optional content
                    $subscriptionContent = $subscription->optional_content()->find($contentData['id']);

                    $subscriptionContent->update([
                        'price_listable_id' => $contentData['price_listable_id'],
                        'price_listable_type' => $contentData['price_listable_type'],
                        'is_optional' => true,
                        'days_duration' => $contentData['days_duration'] ?? null,
                        'months_duration' => $contentData['months_duration'] ?? null,
                        'entrances' => $contentData['entrances'] ?? null,
                        'price' => $contentData['price'],
                        'vat_rate_id' => $contentData['vat_rate_id'],

                        // Access rules
                        'unlimited_entries' => $contentData['unlimited_entries'] ?? false,
                        'total_entries' => $contentData['total_entries'] ?? null,
                        'daily_entries' => $contentData['daily_entries'] ?? null,
                        'weekly_entries' => $contentData['weekly_entries'] ?? null,
                        'monthly_entries' => $contentData['monthly_entries'] ?? null,

                        // Booking rules
                        'max_concurrent_bookings' => $contentData['max_concurrent_bookings'] ?? null,
                        'daily_bookings' => $contentData['daily_bookings'] ?? null,
                        'weekly_bookings' => $contentData['weekly_bookings'] ?? null,
                        'advance_booking_days' => $contentData['advance_booking_days'] ?? null,
                        'cancellation_hours' => $contentData['cancellation_hours'] ?? null,

                        // Validity rules
                        'validity_type' => $contentData['validity_type'] ?? 'duration',
                        'validity_days' => $contentData['validity_days'] ?? null,
                        'validity_months' => $contentData['validity_months'] ?? null,
                        'valid_from' => $contentData['valid_from'] ?? null,
                        'valid_to' => $contentData['valid_to'] ?? null,
                        'freeze_days_allowed' => $contentData['freeze_days_allowed'] ?? null,
                        'freeze_cost_cents' => $contentData['freeze_cost_cents'] ?? null,

                        // Time restrictions
                        'has_time_restrictions' => $contentData['has_time_restrictions'] ?? false,

                        // Service access
                        'service_access_type' => $contentData['service_access_type'] ?? 'all',

                        // Benefits & perks

                        // Metadata
                        'sort_order' => $contentData['sort_order'] ?? 0,
                        'settings' => $contentData['settings'] ?? null,
                    ]);

                    // Sync services if provided
                    if (isset($contentData['services'])) {
                        $this->syncServices($subscriptionContent, $contentData['services']);
                    }

                    // Sync time restrictions if provided
                    if (isset($contentData['time_restrictions'])) {
                        $this->syncTimeRestrictions($subscriptionContent, $contentData['time_restrictions']);
                    }
                } else {
                    // Create new optional content
                    $subscriptionContent = $subscription->optional_content()->create([
                        'price_listable_id' => $contentData['price_listable_id'],
                        'price_listable_type' => $contentData['price_listable_type'],
                        'is_optional' => true,
                        'days_duration' => $contentData['days_duration'] ?? null,
                        'months_duration' => $contentData['months_duration'] ?? null,
                        'entrances' => $contentData['entrances'] ?? null,
                        'price' => $contentData['price'],
                        'vat_rate_id' => $contentData['vat_rate_id'],

                        // Access rules
                        'unlimited_entries' => $contentData['unlimited_entries'] ?? false,
                        'total_entries' => $contentData['total_entries'] ?? null,
                        'daily_entries' => $contentData['daily_entries'] ?? null,
                        'weekly_entries' => $contentData['weekly_entries'] ?? null,
                        'monthly_entries' => $contentData['monthly_entries'] ?? null,

                        // Booking rules
                        'max_concurrent_bookings' => $contentData['max_concurrent_bookings'] ?? null,
                        'daily_bookings' => $contentData['daily_bookings'] ?? null,
                        'weekly_bookings' => $contentData['weekly_bookings'] ?? null,
                        'advance_booking_days' => $contentData['advance_booking_days'] ?? null,
                        'cancellation_hours' => $contentData['cancellation_hours'] ?? null,

                        // Validity rules
                        'validity_type' => $contentData['validity_type'] ?? 'duration',
                        'validity_days' => $contentData['validity_days'] ?? null,
                        'validity_months' => $contentData['validity_months'] ?? null,
                        'valid_from' => $contentData['valid_from'] ?? null,
                        'valid_to' => $contentData['valid_to'] ?? null,
                        'freeze_days_allowed' => $contentData['freeze_days_allowed'] ?? null,
                        'freeze_cost_cents' => $contentData['freeze_cost_cents'] ?? null,

                        // Time restrictions
                        'has_time_restrictions' => $contentData['has_time_restrictions'] ?? false,

                        // Service access
                        'service_access_type' => $contentData['service_access_type'] ?? 'all',

                        // Benefits & perks

                        // Metadata
                        'sort_order' => $contentData['sort_order'] ?? 0,
                        'settings' => $contentData['settings'] ?? null,
                    ]);

                    // Sync services if provided
                    if (! empty($contentData['services'])) {
                        $this->syncServices($subscriptionContent, $contentData['services']);
                    }

                    // Create time restrictions if provided
                    if (! empty($contentData['time_restrictions'])) {
                        $this->syncTimeRestrictions($subscriptionContent, $contentData['time_restrictions']);
                    }
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
            'baseProducts' => BaseProduct::with('vat_rate')->get(),
            'courseProducts' => CourseProduct::with('vat_rate')->get(),
            'articles' => Article::with('vat_rate')->get(),
            'membershipFees' => Membership::with('vat_rate')->get(),
            'bookableServices' => BookableService::with('vat_rate')->get(),
            'tokens' => Token::with('vat_rate')->get(),
            'giftCards' => GiftCard::with('vat_rate')->get(),
            'dayPasses' => DayPass::with('vat_rate')->get(),
        ];
    }

    /**
     * Sync services for subscription content
     *
     * @param  \App\Models\PriceList\SubscriptionContent  $content
     * @param  array  $services  Array of service IDs or service data with usage_limit and usage_period
     */
    protected function syncServices($content, array $services): void
    {
        if (empty($services)) {
            $content->services()->sync([]);

            return;
        }

        $syncData = [];

        foreach ($services as $service) {
            // If $service is just an ID
            if (is_int($service) || is_string($service)) {
                $syncData[$service] = [
                    'usage_limit' => null,
                    'usage_period' => null,
                ];
            }
            // If $service is an array with id and optional pivot data
            elseif (is_array($service) && isset($service['id'])) {
                $syncData[$service['id']] = [
                    'usage_limit' => $service['usage_limit'] ?? null,
                    'usage_period' => $service['usage_period'] ?? null,
                ];
            }
        }

        $content->services()->sync($syncData);
    }

    /**
     * Sync time restrictions for subscription content
     *
     * @param  \App\Models\PriceList\SubscriptionContent  $content
     * @param  array  $restrictions  Array of time restriction data
     */
    protected function syncTimeRestrictions($content, array $restrictions): void
    {
        // Delete all existing time restrictions
        $content->timeRestrictions()->delete();

        // Create new time restrictions
        if (! empty($restrictions)) {
            foreach ($restrictions as $restriction) {
                $content->timeRestrictions()->create([
                    'days' => $restriction['days'] ?? null,
                    'start_time' => $restriction['start_time'] ?? null,
                    'end_time' => $restriction['end_time'] ?? null,
                    'restriction_type' => $restriction['restriction_type'] ?? 'allowed',
                    'description' => $restriction['description'] ?? null,
                ]);
            }
        }
    }
}
