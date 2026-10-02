<?php

namespace App\Services;

use App\Events\SessionDisplaced;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SessionConcurrencyManager
{
    public const FORCE_2FA_CACHE_PREFIX = 'auth:force-2fa:';

    public function activateLatestSession(Request $request, int $userId, bool $forceTwoFactorOnNextLogin = false): void
    {
        $currentSessionId = $request->session()->getId();
        $previousSessionId = $this->getLiveActiveSessionId($userId);

        Cache::forever($this->cacheKey($userId), $currentSessionId);

        if (
            is_string($previousSessionId)
            && $previousSessionId !== ''
            && $previousSessionId !== $currentSessionId
        ) {
            DB::table(config('session.table', 'sessions'))
                ->where('id', $previousSessionId)
                ->delete();

            // Beritahu sesi lama secara real-time via Pusher bahwa mereka telah digusur.
            SessionDisplaced::dispatch($userId);

            if ($forceTwoFactorOnNextLogin) {
                Cache::forever(self::FORCE_2FA_CACHE_PREFIX.$userId, true);
            }
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
     * Determine if there is a registered active session for the user that differs
     * from the current request's session (i.e. the user is logged in on another device).
     */
    public function hasOtherActiveSession(Request $request, int $userId): bool
    {
        $activeSessionId = $this->getLiveActiveSessionId($userId);

        return is_string($activeSessionId)
            && $activeSessionId !== $request->session()->getId();
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
            ->where('last_activity', '>=', $oldestAllowedActivity)
            ->exists();

        if (! $isAlive) {
            Cache::forget($this->cacheKey($userId));

            return null;
        }

        return $activeSessionId;
    }

    private function getActiveSessionId(int $userId): mixed
    {
        return Cache::get($this->cacheKey($userId));
    }

    private function cacheKey(int $userId): string
    {
        return "auth:active-session:{$userId}";
    }
}
