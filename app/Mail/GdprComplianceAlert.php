<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class GdprComplianceAlert extends TenantMailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public array $dashboard,
        public array $result,
        public string $tenantName
    ) {}

    public function envelope(): Envelope
    {
        $compliance = $this->dashboard['compliance_status'];
        $subject = match ($compliance['status']) {
            'critical' => '🚨 GDPR Alert Critico - Azione Richiesta',
            'warning' => '⚠️ GDPR Warning - Revisione Necessaria',
            default => '✅ GDPR Compliance Report',
        };

        return $this->buildEnvelope("{$subject} - {$this->tenantName}");
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.gdpr-compliance-alert',
            with: $this->withSignature([
                'dashboard' => $this->dashboard,
                'result' => $this->result,
                'tenantName' => $this->tenantName,
            ]),
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
