<?php

namespace App\Http\Responses;

use App\Services\TrustedDeviceManager;
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
