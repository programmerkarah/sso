<?php

use App\Http\Controllers\Admin\ApplicationController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\SettingsController;
use App\Models\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }

    return Inertia::render('Welcome');
});

// Dashboard - Requires verified email and 2FA
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard', [
        'applicationsCount' => Application::where('is_active', true)->count(),
    ]);
})->middleware(['auth', 'verified', 'two-factor'])->name('dashboard');

// Settings Routes
Route::middleware(['auth', 'verified'])->prefix('settings')->name('settings.')->group(function () {
    Route::get('/security', [SettingsController::class, 'security'])->name('security');
    Route::get('/security/recovery-codes', [SettingsController::class, 'showRecoveryCodes'])->name('security.recovery-codes.show');
    Route::post('/security/recovery-codes/regenerate', [SettingsController::class, 'regenerateRecoveryCodes'])->name('security.recovery-codes.regenerate');
});

// Admin Routes - Only admins can manage applications
Route::middleware(['auth', 'verified', 'two-factor', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('applications', ApplicationController::class);
    Route::get('/users', [UserManagementController::class, 'index'])->name('users.index');
    Route::post('/users/{user}/reset-password', [UserManagementController::class, 'resetPassword'])->name('users.reset-password');
    Route::post('/users/{user}/reset-two-factor', [UserManagementController::class, 'resetTwoFactor'])->name('users.reset-two-factor');
    Route::post('/users/{user}/toggle-admin', [UserManagementController::class, 'toggleAdmin'])->name('users.toggle-admin');
});
