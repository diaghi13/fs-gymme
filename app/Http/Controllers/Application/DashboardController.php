<?php

namespace App\Http\Controllers\Application;

use App\Http\Controllers\Controller;
use App\Models\Customer\CustomerSubscription;
use App\Models\Sale\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $data = [
            'activeCustomersCount' => $this->getActiveCustomersCount(),
            'dailyCollectionSum' => $this->getDailyCollectionSum(),
            'dailyCollectionDiffSum' => $this->getDailyCollectionDiffSum(),
            'pendingPaymentsCount' => $this->getPendingPaymentsCount(),
            'activeSubscriptions' => $this->getActiveSubscriptionsCount(),
            'subscriptionDiffPerDate' => $this->getSubscriptionDiffPerDate(),
        ];

        return Inertia::render('dashboard', $data);
    }

    private function getActiveCustomersCount(): int
    {
        return CustomerSubscription::ofType('membership')->active()->count();
    }

    private function getDailyCollectionSum(): float
    {
        return Payment::query()->dailySum();
    }

    private function getDailyCollectionDiffSum(): array
    {
        $dailyCollectionDiffSum = [];
        $dailyCollectionSum = $this->getDailyCollectionSum();
        $date = now('Europe/Rome')->subDay();

        for ($i = 0; $i < 7; $i++) {
            $next = Payment::query()
                ->whereDate('payed_at', $date)
                ->sum('amount') / 100;
            $dailyCollectionDiffSum[$date->format('d/m/y')] = $dailyCollectionSum - $next;
            $dailyCollectionSum = $next;
            $date->subDay();
        }

        return array_reverse($dailyCollectionDiffSum);
    }

    private function getPendingPaymentsCount(): int
    {
        return Payment::pending()->count();
    }

    private function getActiveSubscriptionsCount(): int
    {
        return CustomerSubscription::ofType('subscription')->active()->count();
    }

    private function getSubscriptionDiffPerDate(): array
    {
        $subscriptionDiffPerDate = [];
        $activeSubscriptionsCount = $this->getActiveSubscriptionsCount();
        $date = now('Europe/Rome')->subDay();

        for ($i = 0; $i < 7; $i++) {
            $next = CustomerSubscription::ofType('subscription')
                ->active()
                ->whereDate('start_date', '<=', $date)
                ->where(function ($query) use ($date) {
                    $query->whereNull('end_date')
                        ->orWhere('end_date', '>=', $date);
                })->count();

            $subscriptionDiffPerDate[$date->format('d/m/y')] = $activeSubscriptionsCount - $next;
            $activeSubscriptionsCount = $next;
            $date->subDay();
        }

        return array_reverse($subscriptionDiffPerDate);
    }
}
