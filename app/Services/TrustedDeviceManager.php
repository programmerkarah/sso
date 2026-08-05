<?php

namespace App\Services;

use App\Models\TrustedDevice;
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
        // 1 device, 1 session: jika ada sesi aktif di perangkat lain, wajib 2FA
        // bahkan jika perangkat ini sudah pernah dipercaya.
        if ($this->sessionConcurrencyManager->hasOtherActiveSession($request, (int) $user->id)) {
            return true;
        }

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

        return ! is_null($this->resolveTrustedDevice($request, $user, (string) $cookie['token']));
    }

    /**
     * Build the device fingerprint without relying on IP addresses.
     */
    public function fingerprint(Request $request): string
    {
        $normalizedUserAgent = $this->normalizeUserAgent((string) $request->userAgent());
        $normalizedLanguage = $this->normalizeLanguage((string) $request->header('accept-language'));

        return hash('sha256', implode('|', [
            $normalizedUserAgent,
            $normalizedLanguage,
        ]));
    }

    /**
     * Keep compatibility with legacy fingerprints created from raw headers.
     */
    public function legacyFingerprint(Request $request): string
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
            'ip_address' => $request->ip(),
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

        $device = $this->resolveTrustedDevice($request, $user, (string) $cookie['token']);

        if (! $device) {
            return;
        }

        $device->forceFill([
            'device_fingerprint' => $this->fingerprint($request),
            'user_agent' => $request->userAgent(),
            'ip_address' => $request->ip(),
            'last_used_at' => now(),
            'expires_at' => now()->addDays(self::TRUST_DAYS),
        ])->save();

        $this->queueTrustedDeviceCookie($request, $user->id, $cookie['token']);
    }

    private function resolveTrustedDevice(Request $request, User $user, string $token): ?TrustedDevice
    {
        $tokenHash = hash('sha256', $token);

        $device = $user->trustedDevices()
            ->where('token_hash', $tokenHash)
            ->where('expires_at', '>', now())
            ->first();

        if (! $device) {
            return null;
        }

        $currentFingerprint = $this->fingerprint($request);

        if (hash_equals($device->device_fingerprint, $currentFingerprint)) {
            return $device;
        }

        if (hash_equals($device->device_fingerprint, $this->legacyFingerprint($request))) {
            $device->forceFill([
                'device_fingerprint' => $currentFingerprint,
                'user_agent' => $request->userAgent(),
                'ip_address' => $request->ip(),
                'last_used_at' => now(),
            ])->save();

            return $device;
        }

        return null;
    }

    private function normalizeUserAgent(string $userAgent): string
    {
        $ua = strtolower(trim($userAgent));

        $browserFamily = 'other';
        $browserMajor = '0';

        if (preg_match('/edg\/(\d+)/', $ua, $matches)) {
            $browserFamily = 'edge';
            $browserMajor = $matches[1];
        } elseif (preg_match('/chrome\/(\d+)/', $ua, $matches)) {
            $browserFamily = 'chrome';
            $browserMajor = $matches[1];
        } elseif (preg_match('/firefox\/(\d+)/', $ua, $matches)) {
            $browserFamily = 'firefox';
            $browserMajor = $matches[1];
        } elseif (preg_match('/version\/(\d+).+safari\//', $ua, $matches)) {
            $browserFamily = 'safari';
            $browserMajor = $matches[1];
        }

        $osFamily = 'other';
        $osMajor = '0';

        if (preg_match('/windows nt (\d+)\./', $ua, $matches)) {
            $osFamily = 'windows';
            $osMajor = $matches[1];
        } elseif (preg_match('/android (\d+)/', $ua, $matches)) {
            $osFamily = 'android';
            $osMajor = $matches[1];
        } elseif (preg_match('/iphone os (\d+)_|cpu os (\d+)_/', $ua, $matches)) {
            $osFamily = 'ios';
            $osMajor = $matches[1] ?: $matches[2];
        } elseif (preg_match('/mac os x (\d+)[_.]/', $ua, $matches)) {
            $osFamily = 'macos';
            $osMajor = $matches[1];
        } elseif (preg_match('/linux/', $ua)) {
            $osFamily = 'linux';
        }

        return implode('|', [
            $browserFamily,
            $browserMajor,
            $osFamily,
            $osMajor,
        ]);
    }

    private function normalizeLanguage(string $acceptLanguage): string
    {
        if ($acceptLanguage === '') {
            return 'unknown';
        }

        $firstLanguage = explode(',', strtolower($acceptLanguage))[0] ?? '';
        $withoutQuality = explode(';', $firstLanguage)[0] ?? '';
        $normalized = trim($withoutQuality);

        return $normalized !== '' ? $normalized : 'unknown';
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
