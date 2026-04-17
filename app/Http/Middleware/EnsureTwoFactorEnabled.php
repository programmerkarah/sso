<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTwoFactorEnabled
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && is_null($user->two_factor_confirmed_at)) {
            return redirect()->route('settings.security')
                ->with('status', 'Anda harus mengaktifkan autentikasi dua faktor untuk melanjutkan.');
        }

        return $next($request);
    }
}
