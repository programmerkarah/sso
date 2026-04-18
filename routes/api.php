<?php

use App\Models\Application;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:api')->get('/user', function (Request $request) {
    /** @var User $user */
    $user = $request->user();

    abort_unless($user->isAdminVerified(), 403, 'Akun belum diverifikasi admin SSO.');

    $user->loadMissing('organization');

    $twoFactorEnabled = ! is_null($user->two_factor_secret)
        && ! is_null($user->two_factor_confirmed_at);
    $twoFactorSecret = $twoFactorEnabled ? decrypt($user->two_factor_secret) : null;
    $twoFactorRecoveryCodes = $twoFactorEnabled && is_string($user->two_factor_recovery_codes)
        ? json_decode(decrypt($user->two_factor_recovery_codes), true)
        : [];

    return [
        'id' => $user->id,
        'name' => $user->name,
        'username' => $user->username,
        'email' => $user->email,
        'password_hash' => $user->getAuthPassword(),
        'password_change_required' => $user->password_change_required,
        'email_verified_at' => $user->email_verified_at,
        'admin_verified_at' => $user->admin_verified_at,
        'last_login_at' => $user->last_login_at,
        'created_at' => $user->created_at,
        'updated_at' => $user->updated_at,
        'two_factor_enabled' => $twoFactorEnabled,
        'two_factor_confirmed_at' => $user->two_factor_confirmed_at,
        'two_factor_secret_plain' => $twoFactorSecret,
        'two_factor_recovery_codes_plain' => $twoFactorRecoveryCodes,
        'two_factor' => $twoFactorEnabled ? [
            'secret' => $twoFactorSecret,
            'recovery_codes' => $twoFactorRecoveryCodes,
            'confirmed_at' => $user->two_factor_confirmed_at,
        ] : null,
        'organization_type' => $user->organization?->type,
        'organization' => $user->organization ? [
            'id' => $user->organization->id,
            'name' => $user->organization->name,
            'slug' => $user->organization->slug,
            'type' => $user->organization->type,
        ] : null,
    ];
});

// Admin only: List all users for syncing
Route::middleware('auth:api')->get('/users', function (Request $request) {
    /** @var User $user */
    $user = $request->user();

    abort_unless($user->isAdminVerified(), 403, 'Akun belum diverifikasi admin SSO.');

    return User::select(['id', 'name', 'username', 'email', 'email_verified_at'])
        ->orderBy('id')
        ->get();
});

// Public: Check application active status by OAuth client_id
Route::get('/application/status', function (Request $request) {
    $clientId = $request->query('client_id');

    if (! $clientId) {
        return response()->json(['message' => 'client_id is required.'], 422);
    }

    $application = Application::where('oauth_client_id', $clientId)->first();

    if (! $application) {
        return response()->json(['is_active' => false, 'message' => 'Application not found.'], 404);
    }

    return response()->json([
        'is_active' => (bool) $application->is_active,
        'name' => $application->name,
    ]);
});
