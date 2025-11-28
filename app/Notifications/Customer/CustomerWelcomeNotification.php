<?php

namespace App\Notifications\Customer;

use App\Models\Customer\Customer;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CustomerWelcomeNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Customer $customer
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $structureName = $this->customer->structure->name ?? config('app.name');
        $firstName = $this->customer->first_name;

        return (new MailMessage)
            ->subject("Benvenuto in {$structureName}!")
            ->greeting("Ciao {$firstName}!")
            ->line("Benvenuto in {$structureName}! La tua registrazione è stata completata con successo.")
            ->line('Da ora potrai accedere alla nostra app per gestire le tue iscrizioni, prenotazioni e molto altro.')
            ->action('Accedi alla Dashboard', route('app.dashboard'))
            ->line('Se hai bisogno di aiuto, non esitare a contattarci.')
            ->salutation('A presto!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'customer_id' => $this->customer->id,
            'customer_name' => $this->customer->full_name,
            'structure_id' => $this->customer->structure_id,
        ];
    }
}
