<?php

namespace App\Mail;

use App\Models\ElectronicInvoice;
use App\Models\Sale\Sale;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ElectronicInvoiceRejected extends TenantMailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public ElectronicInvoice $invoice,
        public Sale $sale
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return $this->buildEnvelope(
            "❌ URGENTE: Fattura Elettronica Rifiutata - {$this->invoice->transmission_id}"
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.electronic-invoice-rejected',
            with: $this->withSignature([
                'invoice' => $this->invoice,
                'sale' => $this->sale,
                'customerName' => $this->sale->customer?->full_name ?? 'Cliente',
                'invoiceNumber' => $this->sale->number,
                'invoiceDate' => $this->sale->date?->format('d/m/Y'),
                'totalAmount' => number_format($this->sale->total_price / 100, 2, ',', '.'),
                'transmissionId' => $this->invoice->transmission_id,
                'externalId' => $this->invoice->external_id,
                'sdiErrors' => $this->invoice->sdi_errors ?? 'Nessun dettaglio disponibile',
            ]),
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
