<?php

namespace App\Http\Responses;

use App\Services\TrustedDeviceManager;
use App\Support\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\TwoFactorLoginResponse as TwoFactorLoginResponseContract;
use Laravel\Fortify\Fortify;

class TwoFactorLoginResponse implements TwoFactorLoginResponseContract
{
    /**
     * Create a new response instance.
     */
    public function __construct(protected TrustedDeviceManager $trustedDeviceManager) {}

    /**
     * Create an HTTP response for a successful two-factor login.
     */
    public function toResponse($request)
    {
        if ($request->user()) {
            $this->trustedDeviceManager->finalizeSuccessfulLogin($request, $request->user());

            ActivityLogger::logByRequest(
                request: $request,
                event: 'auth.login.two_factor',
                category: 'authentication',
                description: 'Login berhasil setelah verifikasi dua faktor.',
                user: $request->user(),
            );
        }

        if ($request->user()?->mustChangePassword()) {
            return $request->wantsJson()
                ? new JsonResponse('', 204)
                : redirect()->route('settings.change-password');
        }

        return $request->wantsJson()
            ? new JsonResponse('', 204)
            : redirect()->intended(Fortify::redirects('login'));
    }
}
