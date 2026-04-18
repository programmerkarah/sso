<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class DebugOAuthMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->is('oauth/*')) {
            $webGuard = Auth::guard('web');
            
            Log::channel('single')->info('=== OAuth Request Debug ===', [
                'url' => $request->fullUrl(),
                'session_id' => $request->session()->getId(),
                'auth_check' => Auth::check(),
                'auth_user_id' => Auth::id(),
                'guard_web_check' => $webGuard->check(),
                'guard_web_user_id' => $webGuard->id(),
                'guard_web_instance' => spl_object_id($webGuard),
                'session_driver' => config('session.driver'),
                'passport_guard' => config('passport.guard'),
                'passport_middleware' => config('passport.middleware'),
            ]);
        }

        return $next($request);
    }
}
