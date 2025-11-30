<?php

namespace App\Listeners;

use App\Events\Customer\CustomerCreated;
use App\Notifications\Customer\CustomerWelcomeNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendWelcomeEmail implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct() {}

    /**
     * Handle the event.
     */
    public function handle(CustomerCreated $event): void
    {
        // Send welcome email to customer via their user account
        if ($event->customer->user && $event->customer->email) {
            $event->customer->user->notify(new CustomerWelcomeNotification($event->customer));
        }
    }

    /**
     * Determine whether the listener should be queued.
     */
    public function shouldQueue(CustomerCreated $event): bool
    {
        // Only send email if customer has given GDPR consent
        return (bool) $event->customer->gdpr_consent;
    }
}
