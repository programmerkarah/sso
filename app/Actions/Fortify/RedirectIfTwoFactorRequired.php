<?php

namespace App\Actions\Fortify;

use App\Services\TrustedDeviceManager;
use App\Support\ActivityLogger;
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

        if (
            optional($user)->two_factor_secret
            && ! is_null(optional($user)->two_factor_confirmed_at)
            && in_array(TwoFactorAuthenticatable::class, class_uses_recursive($user))
        ) {
            $decision = $this->trustedDeviceManager->twoFactorDecision($request, $user);

            ActivityLogger::logByRequest(
                request: $request,
                event: 'auth.two_factor.decision',
                category: 'authentication',
                description: $decision['required']
                    ? 'Login memerlukan verifikasi dua faktor.'
                    : 'Login menggunakan perangkat tepercaya tanpa challenge dua faktor.',
                user: null,
                metadata: [
                    'credential_user_id' => (int) $user->id,
                    'trusted_device_id' => $decision['trusted_device_id'],
                    'two_factor_required' => $decision['required'],
                    'two_factor_reason' => $decision['reason'],
                ],
                status: $decision['required'] ? 'warning' : 'success',
            );

            if ($decision['required']) {
                return $this->twoFactorChallengeResponse($request, $user);
            }

            return $next($request);
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
