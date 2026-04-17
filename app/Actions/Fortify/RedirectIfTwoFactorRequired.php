<?php

namespace App\Actions\Fortify;

use App\Services\TrustedDeviceManager;
use Illuminate\Contracts\Auth\StatefulGuard;
use Laravel\Fortify\Actions\RedirectIfTwoFactorAuthenticatable;
use Laravel\Fortify\LoginRateLimiter;
use Laravel\Fortify\TwoFactorAuthenticatable;

class RedirectIfTwoFactorRequired extends RedirectIfTwoFactorAuthenticatable
{
    public function __construct(
        StatefulGuard $guard,
        LoginRateLimiter $limiter,
        TrustedDeviceManager $trustedDeviceManager,
    ) {
        parent::__construct($guard, $limiter);

        $this->trustedDeviceManager = $trustedDeviceManager;
    }

    /**
     * The trusted device manager.
     */
    protected TrustedDeviceManager $trustedDeviceManager;

    /**
     * Handle the incoming request.
     */
    public function handle($request, $next)
    {
        $user = $this->validateCredentials($request);

        if ($this->shouldChallengeTwoFactor($request, $user)) {
            return $this->twoFactorChallengeResponse($request, $user);
        }

        return $next($request);
    }

    /**
     * Determine if the user must complete the 2FA challenge.
     */
    protected function shouldChallengeTwoFactor($request, $user): bool
    {
        return optional($user)->two_factor_secret
            && ! is_null(optional($user)->two_factor_confirmed_at)
            && in_array(TwoFactorAuthenticatable::class, class_uses_recursive($user))
            && $this->trustedDeviceManager->shouldChallenge($request, $user);
    }
}
