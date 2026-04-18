<?php

namespace App\Http\Responses;

use App\Services\TrustedDeviceManager;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Fortify;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create a new response instance.
     */
    public function __construct(protected TrustedDeviceManager $trustedDeviceManager) {}

    /**
     * Create an HTTP response for a successful login.
     */
    public function toResponse($request)
    {
        if ($request->user()) {
            $this->trustedDeviceManager->finalizeSuccessfulLogin($request, $request->user());
        }

        if ($request->user()?->mustChangePassword()) {
            return $request->wantsJson()
                ? response()->json(['two_factor' => false])
                : redirect()->route('settings.change-password');
        }

        return $request->wantsJson()
            ? response()->json(['two_factor' => false])
            : redirect()->intended(Fortify::redirects('login'));
    }
}
