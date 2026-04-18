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
            $this->trustedDeviceManager->finalizeSuccessfulLogin($request, $request->user());
            $this->sessionConcurrencyManager->activateLatestSession(
                $request,
                (int) $request->user()->id,
            );

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
