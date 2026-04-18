<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewUserPendingVerificationNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(private readonly User $pendingUser) {}

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
            ->subject('User Baru Menunggu Verifikasi Admin SSO')
            ->markdown('mail.notifications.standard', [
                'headline' => 'Verifikasi User Baru Diperlukan',
                'greeting' => 'Yth. '.$notifiable->name.',',
                'introLines' => [
                    'Terdapat user baru yang mendaftar ke SSO dan menunggu verifikasi admin.',
                    'Nama: '.$this->pendingUser->name,
                    'Username: '.$this->pendingUser->username,
                    'Email: '.$this->pendingUser->email,
                    'Silakan verifikasi user tersebut sebelum akses fitur SSO diberikan.',
                ],
                'actionText' => 'Buka Kelola Pengguna',
                'actionUrl' => url('/admin/users'),
                'outroLines' => [
                    'Anda menerima email ini karena memiliki role admin di SSO.',
                ],
            ]);
    }
}
