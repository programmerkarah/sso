<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SessionConcurrencyManager
{
    public const FORCE_2FA_CACHE_PREFIX = 'auth:force-2fa:';

    public function activateLatestSession(Request $request, int $userId, bool $forceTwoFactorOnNextLogin = false): void
    {
        $currentSessionId = $request->session()->getId();
        $previousSessionId = $this->getActiveSessionId($userId);

        Cache::forever($this->cacheKey($userId), $currentSessionId);

        if (
            is_string($previousSessionId)
            && $previousSessionId !== ''
            && $previousSessionId !== $currentSessionId
        ) {
            DB::table(config('session.table', 'sessions'))
                ->where('id', $previousSessionId)
                ->delete();

            if ($forceTwoFactorOnNextLogin) {
                Cache::forever(self::FORCE_2FA_CACHE_PREFIX.$userId, true);
            }
        }
    }

    public function ensureSessionRegistered(Request $request, int $userId): void
    {
        if (! is_string($this->getActiveSessionId($userId))) {
            Cache::forever($this->cacheKey($userId), $request->session()->getId());
        }
    }

    public function isCurrentSessionActive(Request $request, int $userId): bool
    {
        $activeSessionId = $this->getActiveSessionId($userId);

        return is_string($activeSessionId)
            && $activeSessionId !== ''
            && hash_equals($activeSessionId, $request->session()->getId());
    }

    public function hasActiveSessionRecord(int $userId): bool
    {
        $activeSessionId = $this->getActiveSessionId($userId);

        if (! is_string($activeSessionId) || $activeSessionId === '') {
            return false;
        }

        return DB::table(config('session.table', 'sessions'))
            ->where('id', $activeSessionId)
            ->exists();
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

    private function getActiveSessionId(int $userId): mixed
    {
        return Cache::get($this->cacheKey($userId));
    }

    private function cacheKey(int $userId): string
    {
        return "auth:active-session:{$userId}";
    }
}
