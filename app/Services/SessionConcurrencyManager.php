<?php

namespace App\Services;

use App\Events\SessionDisplaced;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SessionConcurrencyManager
{
    public const FORCE_2FA_CACHE_PREFIX = 'auth:force-2fa:';

    private const ACTIVE_DEVICE_CACHE_PREFIX = 'auth:active-device:';

    public function activateLatestSession(Request $request, int $userId, ?int $trustedDeviceId = null): void
    {
        $currentSessionId = $request->session()->getId();
        $previousSessionId = $this->getLiveActiveSessionId($userId);

        Cache::forever($this->cacheKey($userId), $currentSessionId);

        if ($trustedDeviceId !== null) {
            Cache::forever($this->deviceCacheKey($userId), $trustedDeviceId);
        } else {
            Cache::forget($this->deviceCacheKey($userId));
        }

        $this->clearForceTwoFactorFlag($userId);

        $deletedOtherSessions = DB::table(config('session.table', 'sessions'))
            ->where('user_id', $userId)
            ->where('id', '!=', $currentSessionId)
            ->delete();

        if (
            $deletedOtherSessions > 0
            || (
                is_string($previousSessionId)
                && $previousSessionId !== ''
                && $previousSessionId !== $currentSessionId
            )
        ) {
            SessionDisplaced::dispatch($userId);
        }
    }

    public function ensureSessionRegistered(Request $request, int $userId): void
    {
        if (! is_string($this->getLiveActiveSessionId($userId))) {
            Cache::forever($this->cacheKey($userId), $request->session()->getId());
        }
    }

    public function isCurrentSessionActive(Request $request, int $userId): bool
    {
        $activeSessionId = $this->getLiveActiveSessionId($userId);

        return is_string($activeSessionId)
            && hash_equals($activeSessionId, $request->session()->getId());
    }

    /**
     * Determine if there is a registered live session on a different device.
     *
     * A changed session ID alone must not be treated as a different device:
     * after session expiry/regeneration the same browser can legitimately receive
     * a new session ID while the previous database row is still inside Laravel's
     * lifetime window for a short period.
     */
    public function hasOtherActiveSession(Request $request, int $userId, ?int $currentTrustedDeviceId = null): bool
    {
        $activeSessionId = $this->getLiveActiveSessionId($userId);

        if (! is_string($activeSessionId) || $activeSessionId === '') {
            return false;
        }

        if (hash_equals($activeSessionId, $request->session()->getId())) {
            return false;
        }

        $activeTrustedDeviceId = $this->getActiveTrustedDeviceId($userId);

        if ($activeTrustedDeviceId !== null && $currentTrustedDeviceId !== null) {
            return $activeTrustedDeviceId !== $currentTrustedDeviceId;
        }

        if ($activeTrustedDeviceId !== null) {
            return true;
        }

        $activeUserAgent = DB::table(config('session.table', 'sessions'))
            ->where('id', $activeSessionId)
            ->where('user_id', $userId)
            ->value('user_agent');

        if (! is_string($activeUserAgent) || $activeUserAgent === '') {
            $this->forgetActiveSession($userId);

            return false;
        }

        return $currentTrustedDeviceId === null || ! $this->isSameBrowserDevice(
            (string) $activeUserAgent,
            (string) $request->userAgent(),
        );
    }

    public function hasActiveSessionRecord(int $userId): bool
    {
        return is_string($this->getLiveActiveSessionId($userId));
    }

    public function forgetIfCurrentSession(Request $request, int $userId): void
    {
        $activeSessionId = $this->getActiveSessionId($userId);
        $currentSessionId = $request->session()->getId();

        if (is_string($activeSessionId) && $activeSessionId !== '' && hash_equals($activeSessionId, $currentSessionId)) {
            Cache::forget($this->cacheKey($userId));
        }
    }

    public function forgetActiveSession(int $userId): void
    {
        Cache::forget($this->cacheKey($userId));
        Cache::forget($this->deviceCacheKey($userId));
    }

    public function getActiveTrustedDeviceId(int $userId): ?int
    {
        $value = Cache::get($this->deviceCacheKey($userId));

        return is_numeric($value) ? (int) $value : null;
    }

    public function consumeForceTwoFactorFlag(int $userId): bool
    {
        $key = self::FORCE_2FA_CACHE_PREFIX.$userId;

        if (! Cache::pull($key, false)) {
            return false;
        }

        return true;
    }

    public function clearForceTwoFactorFlag(int $userId): void
    {
        Cache::forget(self::FORCE_2FA_CACHE_PREFIX.$userId);
    }

    /**
     * Resolve the registered session only when it is still alive according to
     * Laravel's configured session lifetime. The cache entry itself is stored
     * forever, so a timed-out session must not be treated as another device.
     */
    private function getLiveActiveSessionId(int $userId): ?string
    {
        $activeSessionId = $this->getActiveSessionId($userId);

        if (! is_string($activeSessionId) || $activeSessionId === '') {
            return null;
        }

        $lifetimeMinutes = max(1, (int) config('session.lifetime', 120));
        $oldestAllowedActivity = now()->subMinutes($lifetimeMinutes)->getTimestamp();

        $isAlive = DB::table(config('session.table', 'sessions'))
            ->where('id', $activeSessionId)
            ->where('user_id', $userId)
            ->where('last_activity', '>=', $oldestAllowedActivity)
            ->exists();

        if (! $isAlive) {
            $this->forgetActiveSession($userId);

            return null;
        }

        return $activeSessionId;
    }

    private function isSameBrowserDevice(string $leftUserAgent, string $rightUserAgent): bool
    {
        $left = $this->browserDeviceSignature($leftUserAgent);
        $right = $this->browserDeviceSignature($rightUserAgent);

        return $left !== null
            && $right !== null
            && hash_equals($left, $right);
    }

    private function browserDeviceSignature(string $userAgent): ?string
    {
        $ua = strtolower(trim($userAgent));

        if ($ua === '') {
            return null;
        }

        $browser = match (true) {
            str_contains($ua, 'edg/') => 'edge',
            str_contains($ua, 'chrome/') => 'chrome',
            str_contains($ua, 'firefox/') => 'firefox',
            str_contains($ua, 'safari/') && str_contains($ua, 'version/') => 'safari',
            default => 'other',
        };

        $os = match (true) {
            str_contains($ua, 'windows nt') => 'windows',
            str_contains($ua, 'iphone') || str_contains($ua, 'ipad') || str_contains($ua, 'cpu os') => 'ios',
            str_contains($ua, 'android') => 'android',
            str_contains($ua, 'mac os x') => 'macos',
            str_contains($ua, 'linux') => 'linux',
            default => 'other',
        };

        return hash('sha256', $browser.'|'.$os);
    }

    private function getActiveSessionId(int $userId): mixed
    {
        return Cache::get($this->cacheKey($userId));
    }

    private function cacheKey(int $userId): string
    {
        return "auth:active-session:{$userId}";
    }

    private function deviceCacheKey(int $userId): string
    {
        return self::ACTIVE_DEVICE_CACHE_PREFIX.$userId;
    }
}
