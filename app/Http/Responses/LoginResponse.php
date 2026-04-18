<?php

namespace App\Http\Responses;

use App\Services\TrustedDeviceManager;
use App\Support\ActivityLogger;
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

            ActivityLogger::logByRequest(
                request: $request,
                event: 'auth.login',
                category: 'authentication',
                description: 'Login berhasil.',
                user: $request->user(),
            );
        }

        if ($request->user()?->mustChangePassword()) {
            return $request->wantsJson()
                ? response()->json(['two_factor' => false])
                : redirect()->route('settings.change-password');
        }

        // Debug intended URL
        \Illuminate\Support\Facades\Log::channel('single')->info('=== LoginResponse: Redirecting after login ===', [
            'intended_url' => $request->session()->get('url.intended'),
            'default_redirect' => Fortify::redirects('login'),
            'session_id' => $request->session()->getId(),
        ]);

        return $request->wantsJson()
            ? response()->json(['two_factor' => false])
            : redirect()->intended(Fortify::redirects('login'));
    }
}
