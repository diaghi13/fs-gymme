<?php

namespace App\Console\Commands\Stripe;

use Illuminate\Console\Command;
use Stripe\Stripe;
use Stripe\WebhookEndpoint;

class SetupWebhookCommand extends Command
{
    protected $signature = 'stripe:setup-webhook
                            {--url= : The webhook URL (defaults to APP_URL/stripe/webhook)}';

    protected $description = 'Setup Stripe webhook endpoint for subscription management';

    public function handle(): int
    {
        $stripeSecret = config('cashier.secret');

        if (! $stripeSecret) {
            $this->error('Stripe secret key not configured. Please set STRIPE_SECRET in your .env file.');

            return self::FAILURE;
        }

        Stripe::setApiKey($stripeSecret);

        $url = $this->option('url') ?? config('app.url').'/stripe/webhook';

        $this->info("Setting up webhook endpoint: {$url}");

        $events = [
            'customer.subscription.created',
            'customer.subscription.updated',
            'customer.subscription.deleted',
            'customer.updated',
            'invoice.payment_succeeded',
            'invoice.payment_failed',
            'invoice.payment_action_required',
        ];

        try {
            // Controlla se esiste già un webhook con questo URL
            $existingWebhooks = WebhookEndpoint::all(['limit' => 100]);

            foreach ($existingWebhooks->data as $webhook) {
                if ($webhook->url === $url) {
                    $this->warn('Webhook already exists with this URL. Updating...');

                    $webhook = WebhookEndpoint::update($webhook->id, [
                        'enabled_events' => $events,
                    ]);

                    $this->displayWebhookInfo($webhook);

                    return self::SUCCESS;
                }
            }

            // Crea un nuovo webhook
            $webhook = WebhookEndpoint::create([
                'url' => $url,
                'enabled_events' => $events,
            ]);

            $this->displayWebhookInfo($webhook);

            return self::SUCCESS;

        } catch (\Exception $e) {
            $this->error("Failed to setup webhook: {$e->getMessage()}");

            return self::FAILURE;
        }
    }

    protected function displayWebhookInfo(WebhookEndpoint $webhook): void
    {
        $this->newLine();
        $this->info('✓ Webhook configured successfully!');
        $this->newLine();

        $this->line('Webhook ID: '.$webhook->id);
        $this->line('URL: '.$webhook->url);
        $this->line('Status: '.($webhook->status === 'enabled' ? '✓ Enabled' : '✗ Disabled'));

        $this->newLine();
        $this->line('Enabled events:');
        foreach ($webhook->enabled_events as $event) {
            $this->line('  - '.$event);
        }

        $this->newLine();
        $this->warn('IMPORTANT: Add this webhook secret to your .env file:');
        $this->line('STRIPE_WEBHOOK_SECRET='.$webhook->secret);
        $this->newLine();
    }
}
