<?php

namespace App\Http\Responses;

use App\Services\SessionConcurrencyManager;
use App\Services\TrustedDeviceManager;
use App\Support\ActivityLogger;
use Illuminate\Support\Facades\Log;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Fortify;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create a new response instance.
     */
    public function __construct(
        protected TrustedDeviceManager $trustedDeviceManager,
        protected SessionConcurrencyManager $sessionConcurrencyManager,
    ) {}

    /**
     * Create an HTTP response for a successful login.
     */
    public function toResponse($request)
    {
        if ($request->user()) {
            $user = $request->user();
            $userId = (int) $user->id;

            $currentTrustedDevice = $this->trustedDeviceManager->finalizeSuccessfulLogin($request, $user);

            $this->sessionConcurrencyManager->activateLatestSession(
                $request,
                $userId,
                $currentTrustedDevice?->id,
            );

            if ($currentTrustedDevice) {
                $user->trustedDevices()
                    ->whereKeyNot($currentTrustedDevice->id)
                    ->delete();
            }

            ActivityLogger::logByRequest(
                request: $request,
                event: 'auth.login',
                category: 'authentication',
                description: "Berhasil login pengguna {$user->name}.",
                user: $user,
            );
        }

        if ($request->user()?->mustChangePassword()) {
            return $request->wantsJson()
                ? response()->json(['two_factor' => false])
                : redirect()->route('settings.change-password');
        }

        // Pengguna tanpa 2FA tetap dianggap berhasil login, tetapi hanya boleh
        // membuka halaman aktivasi 2FA. URL tujuan (termasuk OAuth authorize)
        // sengaja tetap disimpan agar dapat dilanjutkan setelah 2FA aktif.
        if ($request->user() && is_null($request->user()->two_factor_confirmed_at)) {
            return $request->wantsJson()
                ? response()->json([
                    'two_factor' => false,
                    'redirect' => route('settings.security'),
                ])
                : redirect()
                    ->route('settings.security')
                    ->with('status', 'Aktifkan dan konfirmasi autentikasi dua faktor (2FA) untuk melanjutkan.');
        }

        $intendedUrl = $request->session()->get('url.intended');
        $defaultRedirect = Fortify::redirects('login');

        if ($this->shouldIgnoreIntendedUrl($intendedUrl)) {
            $request->session()->forget('url.intended');
            $intendedUrl = null;
        }

        Log::channel('single')->info('=== LoginResponse: Redirecting after login ===', [
            'intended_url' => $intendedUrl,
            'default_redirect' => $defaultRedirect,
            'session_id' => $request->session()->getId(),
        ]);

        return $request->wantsJson()
            ? response()->json(['two_factor' => false])
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
