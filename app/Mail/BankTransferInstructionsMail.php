<?php

namespace App\Mail;

use App\Models\SubscriptionPlan;
use App\Models\Tenant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Email sent to customers who choose bank transfer payment.
 *
 * Contains bank account details and payment instructions.
 */
class BankTransferInstructionsMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public Tenant $tenant,
        public SubscriptionPlan $plan,
        public string $subscriptionId
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Istruzioni per il Bonifico Bancario - '.config('app.name'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $bankDetails = [
            'account_holder' => config('app.bank_account_holder', 'Nome Azienda S.r.l.'),
            'bank_name' => config('app.bank_name', 'Banca Esempio'),
            'iban' => config('app.bank_iban', 'IT60 X054 2811 1010 0000 0123 456'),
            'bic' => config('app.bank_bic', 'ABCDITMM'),
            'amount' => $this->plan->price,
            'reference' => 'ABBONAMENTO-'.$this->tenant->id.'-'.now()->format('Ymd'),
        ];

        return new Content(
            markdown: 'emails.bank-transfer-instructions',
            with: [
                'tenant' => $this->tenant,
                'plan' => $this->plan,
                'subscriptionId' => $this->subscriptionId,
                'bankDetails' => $bankDetails,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
