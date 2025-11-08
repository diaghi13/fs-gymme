<?php

namespace App\Notifications\Tenant;

use App\Models\Tenant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WelcomeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Tenant $tenant,
        public string $loginUrl
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $trialDays = config('app.trial_days', 14);

        return (new MailMessage)
            ->subject('Benvenuto su '.$this->tenant->name.'! 🎉')
            ->greeting('Ciao '.$notifiable->first_name.'!')
            ->line('Benvenuto su **'.$this->tenant->name.'**! Siamo entusiasti di averti con noi.')
            ->line('Il tuo tenant è stato configurato con successo e puoi iniziare ad utilizzarlo immediatamente.')
            ->line('**Cosa puoi fare ora:**')
            ->line('✅ Accedi alla tua dashboard')
            ->line('✅ Configura la tua palestra/struttura')
            ->line('✅ Aggiungi membri del team')
            ->line('✅ Inizia a gestire clienti e abbonamenti')
            ->line('')
            ->line('🎁 Hai **'.$trialDays.' giorni di prova gratuita** per esplorare tutte le funzionalità.')
            ->action('Accedi al Tuo Tenant', $this->loginUrl)
            ->line('')
            ->line('**Dati di accesso:**')
            ->line('Email: '.$notifiable->email)
            ->line('URL: '.$this->loginUrl)
            ->line('')
            ->line('Se hai bisogno di aiuto, non esitare a contattarci. Siamo qui per te!')
            ->salutation('Il Team di Gymme')
            ->line('')
            ->line('_Questa è una email automatica, per favore non rispondere._');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tenant_id' => $this->tenant->id,
            'tenant_name' => $this->tenant->name,
            'login_url' => $this->loginUrl,
        ];
    }
}
