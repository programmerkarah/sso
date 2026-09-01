<?php

namespace App\Http\Middleware;

use App\Services\SessionConcurrencyManager;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class EnsureSingleActiveSession
{
    public function __construct(protected SessionConcurrencyManager $sessionConcurrencyManager) {}

    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::check()) {
            return $next($request);
        }

        $userId = (int) Auth::id();
        $this->sessionConcurrencyManager->ensureSessionRegistered($request, $userId);

        if ($this->sessionConcurrencyManager->isCurrentSessionActive($request, $userId)) {
            if ($this->hasActiveOauthAccess($userId) || ! $this->hasOauthAccessRecords($userId)) {
                return $next($request);
            }

            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Akses OAuth Anda telah dicabut. Silakan masuk kembali.',
                ], 401);
            }

            return redirect()->route('login')->with('error', 'Akses OAuth Anda telah dicabut. Silakan masuk kembali.');
        }

        // Recover from stale cache key: if cached active session no longer exists,
        // adopt current authenticated session instead of forcing logout.
        if (! $this->sessionConcurrencyManager->hasActiveSessionRecord($userId)) {
            $this->sessionConcurrencyManager->activateLatestSession($request, $userId);

            return $next($request);
        }

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Sesi Anda telah berakhir karena akun digunakan pada perangkat lain.',
            ], 401);
        }

        return redirect()->route('login')->withErrors([
            'username' => 'Sesi Anda telah berakhir karena akun digunakan pada perangkat lain.',
        ]);
    }

    private function hasOauthAccessRecords(int $userId): bool
    {
        return DB::table('oauth_access_tokens')
            ->where('user_id', $userId)
            ->exists();
    }

    private function hasActiveOauthAccess(int $userId): bool
    {
        return DB::table('oauth_access_tokens')
            ->where('user_id', $userId)
            ->where('revoked', false)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->exists();
    }
}
