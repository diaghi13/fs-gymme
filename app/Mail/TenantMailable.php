<?php

namespace App\Mail;

use App\Models\TenantSetting;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Envelope;

abstract class TenantMailable extends Mailable
{
    /**
     * Get the message envelope with tenant-specific sender
     */
    abstract public function envelope(): Envelope;

    /**
     * Build the message envelope with tenant settings
     */
    protected function buildEnvelope(string $subject): Envelope
    {
        $envelope = new Envelope(
            from: new Address(
                TenantSetting::get('email.sender', config('mail.from.address')),
                TenantSetting::get('email.sender_name', config('mail.from.name'))
            ),
            subject: $subject,
        );

        // Add reply-to if configured
        $replyTo = TenantSetting::get('email.reply_to');
        if ($replyTo) {
            $envelope->replyTo(new Address($replyTo));
        }

        return $envelope;
    }

    /**
     * Get email signature from tenant settings
     */
    protected function getSignature(): string
    {
        return TenantSetting::get('email.signature', '');
    }

    /**
     * Add signature to email content
     */
    protected function withSignature(array $data): array
    {
        $signature = $this->getSignature();

        if ($signature) {
            $data['signature'] = $signature;
        }

        return $data;
    }

    /**
     * Get admin recipients from tenant settings
     */
    protected static function getAdminRecipients(): array
    {
        $recipients = TenantSetting::get('email.admin_recipients', []);

        // Ensure it's an array
        if (is_string($recipients)) {
            $recipients = json_decode($recipients, true) ?? [];
        }

        return array_filter($recipients);
    }

    /**
     * Check if a notification should be sent based on tenant preferences
     */
    protected static function shouldSendNotification(string $notificationType): bool
    {
        return TenantSetting::get("notifications.{$notificationType}", true);
    }
}
