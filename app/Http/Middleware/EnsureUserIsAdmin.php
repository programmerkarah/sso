<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $request->user()->isAdmin()) {
            $redirectUrl = route('dashboard');
            $referer = $request->headers->get('referer');

            if (is_string($referer) && $referer !== '' && $referer !== $request->fullUrl()) {
                $redirectUrl = $referer;
            }

            return redirect()
                ->to($redirectUrl)
                ->with('error', 'Anda tidak memiliki akses ke halaman tersebut.');
        }

        return $next($request);
    }
}
