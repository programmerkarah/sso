<?php

namespace App\Http\Responses;

use App\Services\SessionConcurrencyManager;
use App\Services\TrustedDeviceManager;
use App\Support\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Laravel\Fortify\Contracts\TwoFactorLoginResponse as TwoFactorLoginResponseContract;
use Laravel\Fortify\Fortify;

class TwoFactorLoginResponse implements TwoFactorLoginResponseContract
{
    /**
     * Create a new response instance.
     */
    public function __construct(
        protected TrustedDeviceManager $trustedDeviceManager,
        protected SessionConcurrencyManager $sessionConcurrencyManager,
    ) {}

    /**
     * Create an HTTP response for a successful two-factor login.
     */
    public function toResponse($request)
    {
        if ($request->user()) {
            $user = $request->user();
            $userId = (int) $user->id;

            // Catat apakah login ini menggusur sesi aktif di perangkat lain
            // sebelum sesi baru diaktifkan (setelah aktivasi, flag ini tidak bisa dibaca).
            $isDisplacingOtherSession = $this->sessionConcurrencyManager->hasOtherActiveSession($request, $userId);

            $this->trustedDeviceManager->finalizeSuccessfulLogin($request, $user);
            $this->sessionConcurrencyManager->activateLatestSession($request, $userId);

            // 1 device, 1 session: hapus semua trusted device milik perangkat lain.
            // Trusted device perangkat saat ini (baru dibuat/diperbarui di atas) dipertahankan.
            if ($isDisplacingOtherSession) {
                $currentFingerprint = $this->trustedDeviceManager->fingerprint($request);
                $user->trustedDevices()
                    ->where('device_fingerprint', '!=', $currentFingerprint)
                    ->delete();
            }

            ActivityLogger::logByRequest(
                request: $request,
                event: 'auth.login.two_factor',
                category: 'authentication',
                description: "Berhasil login pengguna {$user->name} setelah verifikasi dua faktor.",
                user: $user,
            );
        }

        if ($request->user()?->mustChangePassword()) {
            return $request->wantsJson()
                ? new JsonResponse('', 204)
                : redirect()->route('settings.change-password');
        }

        $intendedUrl = $request->session()->get('url.intended');
        $defaultRedirect = Fortify::redirects('login');

        if ($this->shouldIgnoreIntendedUrl($intendedUrl)) {
            $request->session()->forget('url.intended');
            $intendedUrl = null;
        }

        Log::channel('single')->info('=== TwoFactorLoginResponse: Redirecting after 2FA ===', [
            'intended_url' => $intendedUrl,
            'default_redirect' => $defaultRedirect,
            'session_id' => $request->session()->getId(),
        ]);

        return $request->wantsJson()
            ? new JsonResponse('', 204)
            : redirect()->intended($defaultRedirect);
    }

    private function shouldIgnoreIntendedUrl(mixed $intendedUrl): bool
    {
        if (! is_string($intendedUrl) || $intendedUrl === '') {
            return false;
        }

        $path = parse_url($intendedUrl, PHP_URL_PATH);

        if (! is_string($path)) {
            return false;
        }

        return in_array($path, ['/login', '/logout', '/two-factor-challenge'], true);
    }
}
