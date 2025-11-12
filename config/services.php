<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'fattura_elettronica_api' => [
        'enabled' => env('FE_API_ENABLED', false),
        'api_key' => env('FE_API_KEY'),
        'username' => env('FE_API_USERNAME'),
        'password' => env('FE_API_PASSWORD'),
        'endpoint_test' => env('FE_ENDPOINT_TEST', 'https://fattura-elettronica-api.it/ws2.0/test'),
        'endpoint_prod' => env('FE_ENDPOINT_PROD', 'https://fattura-elettronica-api.it/ws2.0/prod'),
        'webhook_token' => env('FE_API_WEBHOOK_TOKEN'),
        'sandbox' => env('FE_API_SANDBOX', true),
    ],

];
