<?php

namespace App\Providers;

use Illuminate\Contracts\Auth\StatefulGuard;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;
use Laravel\Passport\Http\Controllers\AuthorizationController;
use Laravel\Passport\Http\Controllers\DeviceAuthorizationController;

class PassportServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Override Passport's guard binding to use the SAME web guard instance
        $this->app->when([
            AuthorizationController::class,
            DeviceAuthorizationController::class,
        ])->needs(StatefulGuard::class)->give(function () {
            // Return the WEB guard instance that has the session
            return Auth::guard('web');
        });
    }

    public function boot(): void
    {
        //
    }
}
