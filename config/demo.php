<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Demo Tenant Duration
    |--------------------------------------------------------------------------
    |
    | The number of days a demo tenant subscription is valid before expiring.
    | This value is used when creating new demo subscriptions.
    |
    */

    'duration_days' => env('DEMO_DURATION_DAYS', 14),

    /*
    |--------------------------------------------------------------------------
    | Grace Period Before Deletion
    |--------------------------------------------------------------------------
    |
    | The number of days to wait after a demo subscription expires before
    | permanently deleting the tenant and all associated data.
    |
    | During this grace period, tenants can still upgrade to a paid plan.
    |
    */

    'grace_period_days' => env('DEMO_GRACE_PERIOD_DAYS', 7),

    /*
    |--------------------------------------------------------------------------
    | Enable Automatic Deletion
    |--------------------------------------------------------------------------
    |
    | When enabled, expired demo tenants will be automatically deleted after
    | the grace period. Set to false to disable automatic deletion.
    |
    */

    'auto_delete_enabled' => env('DEMO_AUTO_DELETE_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Warning Email Days
    |--------------------------------------------------------------------------
    |
    | Number of days before expiration to send warning emails to demo users.
    | Multiple warnings can be sent (e.g., 3 days before, 1 day before).
    |
    */

    'warning_email_days' => [
        3, // 3 days before expiration
        1, // 1 day before expiration
    ],

    /*
    |--------------------------------------------------------------------------
    | Demo Plan Slug
    |--------------------------------------------------------------------------
    |
    | The slug used to identify demo subscription plans in the system.
    |
    */

    'demo_plan_slug' => env('DEMO_PLAN_SLUG', 'demo'),

];
