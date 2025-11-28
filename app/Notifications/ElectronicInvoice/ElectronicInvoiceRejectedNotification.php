<?php

namespace App\Notifications\ElectronicInvoice;

use App\Models\Sale\ElectronicInvoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ElectronicInvoiceRejectedNotification extends Notification implements ShouldQueue
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

        $mail = (new MailMessage)
            ->error()
            ->subject('❌ Fattura Elettronica '.$this->invoice->transmission_id.' Rifiutata - Azione Richiesta')
            ->greeting('Attenzione!')
            ->line('La fattura elettronica è stata **rifiutata** dal Sistema di Interscambio (SDI).')
            ->line('**Documento**: '.$sale->document_type.' n. '.$documentNumber)
            ->line('**Cliente**: '.($sale->customer->company_name ?? $sale->customer->full_name))
            ->line('**Importo**: '.number_format($sale->total, 2, ',', '.').' €')
            ->line('**Transmission ID**: '.$this->invoice->transmission_id);

        // Add SDI errors if present
        if ($this->invoice->sdi_errors && is_array($this->invoice->sdi_errors)) {
            $mail->line('---')
                ->line('**Errori SDI**:');

            foreach ($this->invoice->sdi_errors as $index => $error) {
                $errorNum = $index + 1;
                if (is_array($error)) {
                    $code = $error['code'] ?? 'N/A';
                    $message = $error['message'] ?? $error['description'] ?? 'Errore sconosciuto';
                    $mail->line("**{$errorNum}. Codice {$code}**: {$message}");
                } else {
                    $mail->line("**{$errorNum}.** {$error}");
                }
            }
        }

        $mail->line('---')
            ->action('Correggi e Reinvia', route('app.sales.show', $sale->id))
            ->line('**Azione richiesta**: Correggi gli errori indicati e genera nuovamente la fattura elettronica.')
            ->line('Per assistenza, consulta la documentazione o contatta il supporto tecnico.')
            ->salutation('Cordiali saluti,<br>Il Team '.config('app.name'));

        return $mail;
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'electronic_invoice_rejected',
            'invoice_id' => $this->invoice->id,
            'sale_id' => $this->invoice->sale_id,
            'transmission_id' => $this->invoice->transmission_id,
            'external_id' => $this->invoice->external_id,
            'sdi_errors' => $this->invoice->sdi_errors,
            'message' => 'Fattura elettronica rifiutata da SDI',
        ];
    }
}
