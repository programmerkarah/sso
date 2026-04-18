<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(private readonly string $token) {}

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
        $resetUrl = url(route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ], false));

        $expireMinutes = config('auth.passwords.'.config('fortify.passwords').'.expire');

        return (new MailMessage)
            ->subject('Permintaan Reset Password Akun')
            ->markdown('mail.notifications.standard', [
                'headline' => 'Reset Password Akun',
                'greeting' => 'Yth. '.$notifiable->name.',',
                'introLines' => [
                    'Kami menerima permintaan untuk melakukan reset password pada akun Single Sign-On Anda.',
                    "Tautan reset password hanya berlaku selama {$expireMinutes} menit.",
                ],
                'actionText' => 'Reset Password',
                'actionUrl' => $resetUrl,
                'outroLines' => [
                    'Apabila Anda tidak melakukan permintaan ini, abaikan email ini. Password Anda tidak akan berubah tanpa tindakan lebih lanjut.',
                ],
            ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
