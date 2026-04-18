<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordResetByAdmin extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(private readonly string $temporaryPassword) {}

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
        return (new MailMessage)
            ->subject('Password Akun Anda Telah Direset')
            ->greeting('Halo, '.$notifiable->name.'!')
            ->line('Password akun Anda telah direset oleh administrator.')
            ->line('Gunakan password sementara berikut untuk masuk:')
            ->line('**'.$this->temporaryPassword.'**')
            ->line('Setelah masuk, Anda akan diminta untuk segera mengganti password ini dengan password baru yang aman.')
            ->line('**Jangan bagikan password sementara ini kepada siapapun.**')
            ->action('Masuk Sekarang', url(config('app.url').'/login'))
            ->line('Jika Anda tidak merasa melakukan permintaan ini, segera hubungi administrator.');
    }
}
