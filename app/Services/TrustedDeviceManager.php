<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Str;

class TrustedDeviceManager
{
    public const COOKIE_NAME = 'trusted_device';

    public const TRUST_DAYS = 7;

    public function __construct(protected SessionConcurrencyManager $sessionConcurrencyManager) {}

    /**
     * Determine if the user should be challenged for 2FA.
     */
    public function shouldChallenge(Request $request, User $user): bool
    {
        if ($this->sessionConcurrencyManager->consumeForceTwoFactorFlag($user->id)) {
            return true;
        }

        return ! $this->hasValidTrustedDevice($request, $user)
            || $this->requiresFreshTwoFactorConfirmation($user);
    }

    /**
     * Finalize a successful login by updating login timestamps and device trust.
     */
    public function finalizeSuccessfulLogin(Request $request, User $user): void
    {
        $user->forceFill([
            'last_login_at' => now(),
        ])->save();

        if (! $user->two_factor_confirmed_at) {
            return;
        }

        if ($this->hasValidTrustedDevice($request, $user)) {
            $this->refreshTrustedDevice($request, $user);

            return;
        }

        $this->rememberDevice($request, $user);
    }

    /**
     * Determine if the user has a valid trusted device for this request.
     */
    public function hasValidTrustedDevice(Request $request, User $user): bool
    {
        $cookie = $this->getCookiePayload($request);

        if (! $cookie || (int) $cookie['user_id'] !== $user->id || blank($cookie['token'])) {
            return false;
        }

        return $user->trustedDevices()
            ->where('token_hash', hash('sha256', $cookie['token']))
            ->where('device_fingerprint', $this->fingerprint($request))
            ->where('expires_at', '>', now())
            ->exists();
    }

    /**
     * Build the device fingerprint without relying on IP addresses.
     */
    public function fingerprint(Request $request): string
    {
        return hash('sha256', implode('|', [
            (string) $request->userAgent(),
            (string) $request->header('accept-language'),
        ]));
    }

    /**
     * Determine if the user must reconfirm 2FA because the last login is stale.
     */
    public function requiresFreshTwoFactorConfirmation(User $user): bool
    {
        return is_null($user->last_login_at)
            || $user->last_login_at->lt(now()->subDays(self::TRUST_DAYS));
    }

    /**
     * Trust the current device for the configured trust window.
     */
    protected function rememberDevice(Request $request, User $user): void
    {
        $token = Str::random(80);
        $fingerprint = $this->fingerprint($request);

        $user->trustedDevices()
            ->where('device_fingerprint', $fingerprint)
            ->delete();

        $user->trustedDevices()->create([
            'device_fingerprint' => $fingerprint,
            'token_hash' => hash('sha256', $token),
            'user_agent' => $request->userAgent(),
            'last_used_at' => now(),
            'expires_at' => now()->addDays(self::TRUST_DAYS),
        ]);

        $this->queueTrustedDeviceCookie($request, $user->id, $token);
    }

    /**
     * Refresh the trust window for the current device.
     */
    protected function refreshTrustedDevice(Request $request, User $user): void
    {
        $cookie = $this->getCookiePayload($request);

        if (! $cookie) {
            return;
        }

        $user->trustedDevices()
            ->where('token_hash', hash('sha256', $cookie['token']))
            ->where('device_fingerprint', $this->fingerprint($request))
            ->update([
                'last_used_at' => now(),
                'expires_at' => now()->addDays(self::TRUST_DAYS),
            ]);

        $this->queueTrustedDeviceCookie($request, $user->id, $cookie['token']);
    }

    /**
     * Queue the trusted device cookie for the response.
     */
    protected function queueTrustedDeviceCookie(Request $request, int $userId, string $token): void
    {
        Cookie::queue(cookie(
            self::COOKIE_NAME,
            json_encode([
                'user_id' => $userId,
                'token' => $token,
            ], JSON_THROW_ON_ERROR),
            self::TRUST_DAYS * 24 * 60,
            null,
            null,
            $request->isSecure(),
            true,
            false,
            'lax'
        ));
    }

    /**
     * Get the trusted device cookie payload.
     *
     * @return array{user_id:int|string, token:string}|null
     */
    protected function getCookiePayload(Request $request): ?array
    {
        $cookieValue = $request->cookie(self::COOKIE_NAME);

        if (! is_string($cookieValue) || $cookieValue === '') {
            return null;
        }

        try {
            $payload = json_decode($cookieValue, true, flags: JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return null;
        }

        if (! is_array($payload) || ! isset($payload['user_id'], $payload['token'])) {
            return null;
        }

        return $payload;
    }
}
