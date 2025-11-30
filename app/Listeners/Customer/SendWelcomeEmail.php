<?php

namespace App\Listeners\Customer;

use App\Events\Customer\CustomerCreated;

class SendWelcomeEmail
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(CustomerCreated $event): void
    {
        //
    }
}
