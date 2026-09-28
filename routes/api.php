<?php

use App\Models\Application;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:api')->get('/user', function (Request $request) {
    /** @var User $user */
    $user = $request->user();

    abort_unless($user->isAdminVerified(), 403, 'Akun belum diverifikasi admin SSO.');
    abort_unless($user->hasVerifiedEmail(), 403, 'Email akun belum terverifikasi.');
    abort_unless(! is_null($user->two_factor_confirmed_at), 403, 'Autentikasi dua faktor (2FA) belum aktif.');

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
    abort_unless($user->hasVerifiedEmail(), 403, 'Email akun belum terverifikasi.');
    abort_unless(! is_null($user->two_factor_confirmed_at), 403, 'Autentikasi dua faktor (2FA) belum aktif.');

    $query = User::query()->with('organization')
        ->whereNotNull('admin_verified_at')
        ->whereNotNull('email_verified_at');

    if ($clientId = $request->query('client_id')) {
        $application = Application::query()->where('oauth_client_id', $clientId)->firstOrFail();
        $allowed = $application->allowed_organization_types;
        if (is_array($allowed) && $allowed !== []) {
            $query->whereHas('organization', fn ($q) => $q->whereIn('type', $allowed));
        }
    }

    return $query->orderBy('id')->get()->map(fn (User $item) => [
        'id' => $item->id,
        'name' => $item->name,
        'username' => $item->username,
        'email' => $item->email,
        'email_verified_at' => $item->email_verified_at,
        'organization_type' => $item->organization?->type,
        'organization' => $item->organization ? [
            'id' => $item->organization->id,
            'name' => $item->organization->name,
            'slug' => $item->organization->slug,
            'type' => $item->organization->type,
        ] : null,
    ]);
});

Route::post('/applications/eligible-users', function (Request $request) {
    $application = Application::query()
        ->where('oauth_client_id', (string) $request->input('client_id'))
        ->where('is_active', true)
        ->firstOrFail();

    abort_unless(
        hash_equals((string) $application->oauth_client_secret, (string) $request->input('client_secret')),
        401
    );

    $query = User::query()->with('organization')
        ->whereNotNull('admin_verified_at')
        ->whereNotNull('email_verified_at')
        ->whereNotNull('two_factor_confirmed_at');

    if ($application->hasOrganizationRestrictions()) {
        $query->whereHas('organization', fn ($q) =>
            $q->whereIn('type', $application->allowed_organization_types)
        );
    }

    return $query->orderBy('name')->get()->map(fn (User $item) => [
        'id' => $item->id,
        'name' => $item->name,
        'username' => $item->username,
        'email' => $item->email,
        'email_verified_at' => $item->email_verified_at,
        'organization_type' => $item->organization?->type,
    ]);
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
