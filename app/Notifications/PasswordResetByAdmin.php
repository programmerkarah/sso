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
            ->markdown('mail.notifications.standard', [
                'headline' => 'Password Akun Direset Administrator',
                'greeting' => 'Yth. '.$notifiable->name.',',
                'introLines' => [
                    'Administrator telah melakukan reset password pada akun Anda.',
                    'Gunakan password sementara berikut untuk proses login:',
                    $this->temporaryPassword,
                    'Demi keamanan akun, segera ubah password setelah berhasil masuk.',
                ],
                'actionText' => 'Masuk Sekarang',
                'actionUrl' => url(config('app.url').'/login'),
                'outroLines' => [
                    'Jangan bagikan password sementara kepada siapa pun.',
                    'Apabila Anda tidak merasa melakukan permintaan ini, segera hubungi administrator.',
                ],
            ]);
    }
}
