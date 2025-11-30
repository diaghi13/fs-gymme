<?php

namespace App\Services\Customer;

use App\Enums\SubscriptionContentType;
use App\Models\Customer\Customer;
use App\Models\PriceList\Subscription;
use App\Models\PriceList\SubscriptionContent;

/**
 * Example Service: Customer Subscription Creation
 *
 * Questo servizio mostra come utilizzare i nuovi tipi specifici
 * per creare abbonamenti clienti con logiche differenziate.
 */
class CustomerSubscriptionService
{
    /**
     * Create a customer subscription from a price list subscription
     */
    public function createCustomerSubscription(Customer $customer, Subscription $subscription): void
    {
        // Load all subscription contents with their specific types
        $contents = $subscription->standard_content()
            ->with('price_listable')
            ->get();

        // Validate: must have at least one membership fee
        $hasMembership = $contents->contains(fn ($content) => $content->isMembershipFee());

        if (! $hasMembership) {
            throw new \InvalidArgumentException('L\'abbonamento deve includere almeno una quota associativa');
        }

        // Process each content based on its specific type
        foreach ($contents as $content) {
            $this->processContentByType($customer, $content);
        }
    }

    /**
     * Process content with type-specific logic
     */
    protected function processContentByType(Customer $customer, SubscriptionContent $content): void
    {
        $type = $content->getContentType();

        match ($type) {
            SubscriptionContentType::MembershipFee => $this->createMembershipFee($customer, $content),
            SubscriptionContentType::BaseProduct => $this->createProductAccess($customer, $content),
            SubscriptionContentType::CourseProduct => $this->createCourseEnrollment($customer, $content),
            SubscriptionContentType::Token => $this->createTokenPackage($customer, $content),
            SubscriptionContentType::DayPass => $this->createDayPassAccess($customer, $content),
            SubscriptionContentType::Article => $this->createArticleAccess($customer, $content),
            default => throw new \LogicException("Tipo contenuto non gestito: {$type->value}"),
        };

        // Log action with readable type label
        logger()->info("Created {$content->getContentTypeLabel()} for customer {$customer->id}");
    }

    protected function createMembershipFee(Customer $customer, SubscriptionContent $content): void
    {
        // Logic specific to membership fee
        // - Required duration (months_duration)
        // - No entrances
        // - Grants base access rights

        // Example:
        // CustomerMembership::create([
        //     'customer_id' => $customer->id,
        //     'subscription_content_id' => $content->id,
        //     'valid_from' => now(),
        //     'valid_to' => now()->addMonths($content->months_duration),
        //     'status' => 'active',
        // ]);
    }

    protected function createProductAccess(Customer $customer, SubscriptionContent $content): void
    {
        // Logic specific to base products
        // - May have duration (days/months)
        // - May have entrance limits (total_entries, daily_entries, etc.)
        // - Booking rules apply

        if ($content->supportsEntrances()) {
            // Create entry counter
            // CustomerProductAccess::create([
            //     'customer_id' => $customer->id,
            //     'product_id' => $content->price_listable_id,
            //     'entries_remaining' => $content->total_entries ?? 9999,
            //     'daily_limit' => $content->daily_entries,
            //     'valid_from' => now(),
            //     'valid_to' => $this->calculateValidTo($content),
            // ]);
        }

        // Apply time restrictions if any
        if ($content->has_time_restrictions && $content->timeRestrictions->isNotEmpty()) {
            foreach ($content->timeRestrictions as $restriction) {
                // Store time restriction rules
            }
        }
    }

    protected function createCourseEnrollment(Customer $customer, SubscriptionContent $content): void
    {
        // Logic specific to courses
        // - Requires duration
        // - May have entrance limits (number of lessons)
        // - May have specific scheduling

        // CourseEnrollment::create([
        //     'customer_id' => $customer->id,
        //     'course_id' => $content->price_listable_id,
        //     'lessons_remaining' => $content->total_entries,
        //     'enrolled_at' => now(),
        //     'expires_at' => $this->calculateValidTo($content),
        // ]);
    }

    protected function createTokenPackage(Customer $customer, SubscriptionContent $content): void
    {
        // Logic specific to token packages
        // - Fixed number of entries (entrances field)
        // - No duration (or optional validity)
        // - Can be used for any service

        // CustomerTokenPackage::create([
        //     'customer_id' => $customer->id,
        //     'subscription_content_id' => $content->id,
        //     'tokens_total' => $content->entrances,
        //     'tokens_remaining' => $content->entrances,
        //     'purchased_at' => now(),
        //     'expires_at' => $content->valid_to,
        // ]);
    }

    protected function createDayPassAccess(Customer $customer, SubscriptionContent $content): void
    {
        // Logic specific to day passes
        // - Single day access
        // - No duration
        // - Simple entry/exit tracking

        // CustomerDayPass::create([
        //     'customer_id' => $customer->id,
        //     'subscription_content_id' => $content->id,
        //     'valid_date' => now()->toDateString(),
        //     'used' => false,
        // ]);
    }

    protected function createArticleAccess(Customer $customer, SubscriptionContent $content): void
    {
        // Logic specific to articles
        // - One-time purchase/access
        // - No duration or entrances
        // - May be physical or digital goods

        // CustomerArticlePurchase::create([
        //     'customer_id' => $customer->id,
        //     'article_id' => $content->price_listable_id,
        //     'purchased_at' => now(),
        //     'quantity' => 1,
        // ]);
    }

    /**
     * Calculate validity end date based on content rules
     */
    protected function calculateValidTo(SubscriptionContent $content): ?\Carbon\Carbon
    {
        if (! $content->requiresDuration()) {
            return null;
        }

        $validTo = now();

        if ($content->days_duration) {
            $validTo->addDays($content->days_duration);
        }

        if ($content->months_duration) {
            $validTo->addMonths($content->months_duration);
        }

        return $validTo;
    }

    /**
     * Get subscription summary for customer display
     */
    public function getSubscriptionSummary(Subscription $subscription): array
    {
        $contents = $subscription->standard_content()
            ->with('price_listable')
            ->get();

        return [
            'name' => $subscription->name,
            'total_price' => $contents->sum('price'),
            'contents' => $contents->map(function ($content) {
                return [
                    'type' => $content->getContentTypeLabel(),
                    'name' => $content->price_listable->name,
                    'duration' => $this->formatDuration($content),
                    'access' => $content->getAccessSummary(),
                    'price' => $content->price,
                    'is_membership' => $content->isMembershipFee(),
                ];
            })->toArray(),
            'benefits' => [
                'guest_passes_total' => $subscription->guest_passes_total,
                'guest_passes_per_month' => $subscription->guest_passes_per_month,
                'multi_location_access' => $subscription->multi_location_access,
            ],
        ];
    }

    protected function formatDuration(SubscriptionContent $content): ?string
    {
        if (! $content->requiresDuration()) {
            return null;
        }

        $parts = [];

        if ($content->days_duration) {
            $parts[] = "{$content->days_duration} giorni";
        }

        if ($content->months_duration) {
            $parts[] = "{$content->months_duration} ".($content->months_duration === 1 ? 'mese' : 'mesi');
        }

        return implode(' + ', $parts) ?: null;
    }
}
