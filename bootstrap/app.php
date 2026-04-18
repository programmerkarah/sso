<?php

use App\Http\Middleware\EnsurePasswordChanged;
use App\Http\Middleware\EnsureTwoFactorEnabled;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response as HttpFoundationResponse;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
        ]);
        
        // Log final response for debugging
        $middleware->append(\App\Http\Middleware\LogFinalResponse::class);
        
        // Exclude OAuth token endpoint from CSRF verification
        $middleware->validateCsrfTokens(except: [
            'oauth/token',
            'oauth/token/*',
        ]);

        $middleware->alias([
            'two-factor' => EnsureTwoFactorEnabled::class,
            'admin' => EnsureUserIsAdmin::class,
            'must-change-password' => EnsurePasswordChanged::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function (HttpFoundationResponse $response) {
            if ($response->getStatusCode() !== 419) {
                return $response;
            }

            $request = request();

            if ($request->hasSession()) {
                $request->session()->regenerateToken();
            }

            if ($request->header('X-Inertia')) {
                $redirectUrl = $request->header('referer') ?: url()->current();

                return Inertia::location($redirectUrl);
            }

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'CSRF token mismatch.',
                ], 419);
            }

            return back();
        });
    })->create();
