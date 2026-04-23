<?php

use App\Http\Controllers\Admin\ApplicationController;
use App\Http\Controllers\Admin\OrganizationController;
use App\Http\Controllers\Admin\SystemController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\ApplicationCatalogController;
use App\Http\Controllers\Auth\CustomAuthorizationController;
use App\Http\Controllers\Settings\ChangePasswordController;
use App\Http\Controllers\SettingsController;
use App\Models\Application;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/csrf-token', function () {
    request()->session()->regenerateToken();

    return response()->json([
        'token' => csrf_token(),
    ]);
})->name('csrf.token');

// DEBUG: Test session & auth
Route::get('/debug-auth', function () {
    return response()->json([
        'authenticated' => Auth::check(),
        'user_id' => Auth::id(),
        'session_id' => request()->session()->getId(),
        'guard' => config('auth.defaults.guard'),
        'session_driver' => config('session.driver'),
        'passport_middleware' => config('passport.middleware'),
    ]);
})->middleware(['web']);

// DEBUG: Override OAuth authorize
Route::get('/oauth/authorize', [CustomAuthorizationController::class, 'authorize'])
    ->middleware(['web'])
    ->name('passport.authorizations.authorize.debug');

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }

    return Inertia::render('Welcome');
});

// Dashboard - Requires verified email, 2FA, and password not pending change
Route::get('/dashboard', function () {
    $user = request()->user();
    $isAdmin = $user?->isAdmin() ?? false;
    $organizationType = $user?->organization?->type;

    $applicationsQuery = Application::query()->orderBy('name');

    if ($isAdmin) {
        $applicationsQuery->where('is_active', true);
    } else {
        $applicationsQuery
            ->where('is_active', true)
            ->eligibleForOrganizationType($organizationType);
    }

    $applicationsCount = (clone $applicationsQuery)->count();
    $availableApplications = $applicationsQuery
        ->limit(4)
        ->get(['id', 'name', 'description', 'domain', 'callback_url', 'logo_url', 'is_active'])
        ->map(fn (Application $application) => [
            'id' => $application->id,
            'name' => $application->name,
            'description' => $application->description,
            'landing_url' => $application->landingUrl(),
            'launch_url' => $application->launchUrl(),
            'logo_url' => $application->logo_url,
            'is_active' => $application->is_active,
        ])
        ->values()
        ->all();

    $pendingVerificationUsers = $isAdmin
        ? User::query()
            ->whereNull('admin_verified_at')
            ->orderBy('created_at')
            ->limit(8)
            ->get(['id', 'name', 'username', 'email', 'created_at'])
            ->map(fn (User $pendingUser) => [
                'id' => $pendingUser->id,
                'name' => $pendingUser->name,
                'username' => $pendingUser->username,
                'email' => $pendingUser->email,
                'created_at' => $pendingUser->created_at,
            ])
            ->values()
            ->all()
        : [];

    return Inertia::render('Dashboard', [
        'applicationsCount' => $applicationsCount,
        'availableApplications' => $availableApplications,
        'organizationType' => $organizationType,
        'pendingVerificationUsers' => $pendingVerificationUsers,
    ]);
})->middleware(['auth', 'admin-verified', 'verified', 'two-factor', 'must-change-password'])->name('dashboard');

Route::middleware(['auth'])->prefix('settings')->name('settings.')->group(function () {
    Route::get('/change-password', [ChangePasswordController::class, 'show'])->name('change-password');
    Route::post('/change-password', [ChangePasswordController::class, 'update'])->name('change-password.update');
});

// Settings Routes
Route::middleware(['auth', 'admin-verified', 'verified', 'must-change-password'])->prefix('settings')->name('settings.')->group(function () {
    Route::get('/security', [SettingsController::class, 'security'])->name('security');
    Route::post('/security/password', [SettingsController::class, 'updatePassword'])->name('security.password.update');
    Route::post('/security/email', [SettingsController::class, 'updateEmail'])->name('security.email.update');
    Route::get('/security/recovery-codes', [SettingsController::class, 'showRecoveryCodes'])->name('security.recovery-codes.show');
    Route::post('/security/recovery-codes/regenerate', [SettingsController::class, 'regenerateRecoveryCodes'])->name('security.recovery-codes.regenerate');
});

Route::middleware(['auth', 'admin-verified', 'verified', 'two-factor', 'must-change-password'])
    ->get('/applications', [ApplicationCatalogController::class, 'index'])
    ->name('applications.index');

// Admin Routes - Only admins can manage applications
Route::middleware(['auth', 'admin-verified', 'verified', 'two-factor', 'must-change-password', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/system', [SystemController::class, 'index'])->name('system.index');
    Route::post('/system/backups', [SystemController::class, 'backup'])->name('system.backups.create');
    Route::delete('/system/backups/{filename}', [SystemController::class, 'destroyBackup'])
        ->where('filename', '.*')
        ->name('system.backups.destroy');
    Route::put('/system/backups/{filename}/metadata', [SystemController::class, 'updateBackupMetadata'])
        ->where('filename', '.*')
        ->name('system.backups.metadata.update');
    Route::get('/system/backups/{filename}', [SystemController::class, 'downloadBackup'])
        ->where('filename', '.*')
        ->name('system.backups.download');
    Route::post('/system/restore', [SystemController::class, 'restore'])->name('system.restore');

    Route::get('/applications', [ApplicationController::class, 'index'])->name('applications.index');
    Route::post('/applications/navigate', [ApplicationController::class, 'index'])->name('applications.navigate');
    Route::get('/applications/create', [ApplicationController::class, 'create'])->name('applications.create');
    Route::post('/applications', [ApplicationController::class, 'store'])->name('applications.store');
    Route::get('/applications/{application}', [ApplicationController::class, 'show'])->name('applications.show');
    Route::get('/applications/{application}/guide', [ApplicationController::class, 'guide'])->name('applications.guide');
    Route::get('/applications/{application}/guide/export-pdf', [ApplicationController::class, 'exportGuidePdf'])->name('applications.guide.export-pdf');
    Route::get('/applications/{application}/edit', [ApplicationController::class, 'edit'])->name('applications.edit');
    Route::put('/applications/{application}', [ApplicationController::class, 'update'])->name('applications.update');
    Route::delete('/applications/{application}', [ApplicationController::class, 'destroy'])->name('applications.destroy');
    Route::post('/applications/{application}/refresh-secret', [ApplicationController::class, 'refreshSecret'])->name('applications.refresh-secret');
    Route::post('/applications/{application}/toggle-active', [ApplicationController::class, 'toggleActive'])->name('applications.toggle-active');
    Route::match(['GET', 'POST'], '/users', [UserManagementController::class, 'index'])->name('users.index');
    Route::get('/users/export/excel', [UserManagementController::class, 'exportExcel'])->name('users.export.excel');
    Route::get('/users/export/pdf', [UserManagementController::class, 'exportPdf'])->name('users.export.pdf');
    Route::post('/users/{user}/reset-password', [UserManagementController::class, 'resetPassword'])->name('users.reset-password');
    Route::post('/users/{user}/reset-two-factor', [UserManagementController::class, 'resetTwoFactor'])->name('users.reset-two-factor');
    Route::post('/users/{user}/identity', [UserManagementController::class, 'updateIdentity'])->name('users.update-identity');
    Route::post('/users/{user}/access', [UserManagementController::class, 'updateAccess'])->name('users.update-access');
    Route::post('/users/{user}/toggle-admin-verification', [UserManagementController::class, 'toggleAdminVerification'])->name('users.toggle-admin-verification');
    Route::post('/users/access/batch', [UserManagementController::class, 'batchUpdateAccess'])->name('users.batch-update-access');
    Route::post('/users/verify/batch', [UserManagementController::class, 'batchVerify'])->name('users.batch-verify');
    Route::post('/users/{user}/toggle-admin', [UserManagementController::class, 'toggleAdmin'])->name('users.toggle-admin');

    Route::get('/organizations', [OrganizationController::class, 'index'])->name('organizations.index');
    Route::get('/organizations/create', [OrganizationController::class, 'create'])->name('organizations.create');
    Route::post('/organizations', [OrganizationController::class, 'store'])->name('organizations.store');
    Route::get('/organizations/{organization}/edit', [OrganizationController::class, 'edit'])->name('organizations.edit');
    Route::put('/organizations/{organization}', [OrganizationController::class, 'update'])->name('organizations.update');
    Route::post('/organizations/{organization}/toggle-active', [OrganizationController::class, 'toggleActive'])->name('organizations.toggle-active');
});
