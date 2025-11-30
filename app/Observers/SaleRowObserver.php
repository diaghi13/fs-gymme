<?php

namespace App\Observers;

use App\Models\Customer\Customer;
use App\Models\Customer\CustomerSubscription;
use App\Models\Customer\MembershipFee;
use App\Models\Sale\SaleRow;

class SaleRowObserver
{
    /**
     * Handle the SaleRow "created" event.
     */
    public function created(SaleRow $saleRow): void
    {
        $entity = $saleRow->entity;

        /** @var $customer Customer */
        $customer = $saleRow->sale->customer;

        $subscription = null;

        if ($entity instanceof \App\Models\PriceList\Membership) {
            $customer->membership_fees()->save(new MembershipFee([
                'sale_row_id' => $saleRow->id,
                'start_date' => $saleRow->start_date,
                'end_date' => $saleRow->end_date,
                'notes' => null,
            ]));
        }

        if ($entity instanceof \App\Models\PriceList\SubscriptionContent) {
            $entity->load('price_listable');

            if ($entity->price_listable instanceof \App\Models\PriceList\Membership) {
                $customer->membership_fees()->save(new MembershipFee([
                    'sale_row_id' => $saleRow->id,
                    'start_date' => $saleRow->start_date,
                    'end_date' => $saleRow->end_date,
                    'notes' => null,
                ]));
            }

            if ($entity->price_listable instanceof \App\Models\Product\BaseProduct || $entity->price_listable instanceof \App\Models\Product\CourseProduct) {
                $subscription = $this->createSubscription($saleRow, $entity->price_listable);

                $subscription->entity()->associate($entity->price_listable);

                //                $customer->subscriptions()->save(new CustomerSubscription([
                //                    'sale_row_id' => $saleRow->id,
                //                    'type' => 'subscription',
                //                    'price_list_id' => $saleRow->price_list_id,
                //                    'start_date' => $saleRow->start_date,
                //                    'end_date' => $saleRow->end_date,
                //                    'notes' => null,
                //                ]));
            }
        }

        if (! $subscription) {
            return;
        }

        $subscription->save();
    }

    /**
     * Handle the SaleRow "updated" event.
     */
    public function updated(SaleRow $saleRow): void
    {
        //
    }

    /**
     * Handle the SaleRow "deleted" event.
     */
    public function deleted(SaleRow $saleRow): void
    {
        // When a SaleRow is deleted, we should also delete the associated subscription
        $saleRow->customer_subscription?->delete();
    }

    /**
     * Handle the SaleRow "restored" event.
     */
    public function restored(SaleRow $saleRow): void
    {
        //
    }

    /**
     * Handle the SaleRow "force deleted" event.
     */
    public function forceDeleted(SaleRow $saleRow): void
    {
        //
    }

    protected function createSubscription(SaleRow $saleRow, $entity): \App\Models\Customer\CustomerSubscription
    {
        return new \App\Models\Customer\CustomerSubscription([
            'customer_id' => $saleRow->sale->customer_id,
            'sale_row_id' => $saleRow->id,
            'type' => $entity instanceof \App\Models\PriceList\Membership ? 'membership' : 'subscription',
            'price_list_id' => $saleRow->price_list_id,
            'start_date' => $saleRow->start_date,
            'end_date' => $saleRow->end_date,
            'notes' => null,
        ]);
    }

    protected function createMembership(SaleRow $saleRow)
    {
        return new MembershipFee([
            'customer_id' => $saleRow->sale->customer_id,
            'sale_row_id' => $saleRow->id,
            'start_date' => $saleRow->start_date,
            'end_date' => $saleRow->end_date,
            'notes' => null,
        ]);
    }
}
