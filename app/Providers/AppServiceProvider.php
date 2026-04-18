<?php

namespace App\Providers;

use App\Http\Responses\LoginResponse;
use App\Http\Responses\TwoFactorLoginResponse;
use App\Models\Passport\Client as PassportClient;
use App\Support\ActivityLogger;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Contracts\TwoFactorLoginResponse as TwoFactorLoginResponseContract;
use Laravel\Passport\Passport;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(LoginResponseContract::class, LoginResponse::class);
        $this->app->singleton(TwoFactorLoginResponseContract::class, TwoFactorLoginResponse::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Passport::useClientModel(PassportClient::class);
        Passport::authorizationView('passport.authorize');

        VerifyEmail::toMailUsing(function (object $notifiable, string $url) {
            return (new MailMessage)
                ->subject('Verifikasi Alamat Email Akun')
                ->markdown('mail.notifications.standard', [
                    'headline' => 'Verifikasi Alamat Email',
                    'greeting' => 'Yth. '.$notifiable->name.',',
                    'introLines' => [
                        'Terima kasih telah menggunakan layanan Single Sign-On BPS Kota Sawahlunto.',
                        'Untuk menyelesaikan proses verifikasi akun, silakan klik tombol di bawah ini.',
                    ],
                    'actionText' => 'Verifikasi Email',
                    'actionUrl' => $url,
                    'outroLines' => [
                        'Apabila Anda tidak melakukan pendaftaran atau perubahan email, abaikan email ini.',
                    ],
                ]);
        });

        Event::listen(Logout::class, function (Logout $event): void {
            if ($event->user) {
                ActivityLogger::log(
                    event: 'auth.logout',
                    category: 'authentication',
                    description: 'Logout pengguna berhasil.',
                    user: $event->user,
                );
            }
        });
    }
}
