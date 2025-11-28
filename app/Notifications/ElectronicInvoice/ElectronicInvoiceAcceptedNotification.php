<?php

namespace App\Notifications\ElectronicInvoice;

use App\Models\Sale\ElectronicInvoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ElectronicInvoiceAcceptedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public ElectronicInvoice $invoice) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $sale = $this->invoice->sale;
        $documentNumber = $sale->progressive_number ?? $sale->id;

        return (new MailMessage)
            ->subject('✅ Fattura Elettronica '.$this->invoice->transmission_id.' Accettata')
            ->greeting('Buone notizie!')
            ->line('La fattura elettronica è stata **accettata correttamente** dal Sistema di Interscambio (SDI).')
            ->line('**Documento**: '.$sale->document_type.' n. '.$documentNumber)
            ->line('**Cliente**: '.($sale->customer->company_name ?? $sale->customer->full_name))
            ->line('**Importo**: '.number_format($sale->total, 2, ',', '.').' €')
            ->line('**Transmission ID**: '.$this->invoice->transmission_id)
            ->line('**Data invio SDI**: '.$this->invoice->sent_at?->format('d/m/Y H:i'))
            ->action('Visualizza Vendita', route('app.sales.show', $sale->id))
            ->line('La fattura è ora regolare a tutti gli effetti di legge.')
            ->salutation('Cordiali saluti,<br>Il Team '.config('app.name'));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'electronic_invoice_accepted',
            'invoice_id' => $this->invoice->id,
            'sale_id' => $this->invoice->sale_id,
            'transmission_id' => $this->invoice->transmission_id,
            'external_id' => $this->invoice->external_id,
            'message' => 'Fattura elettronica accettata da SDI',
        ];
    }
}
