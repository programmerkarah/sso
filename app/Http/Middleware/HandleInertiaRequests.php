<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Laravel\Fortify\Fortify;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $isAdmin = $user?->isAdmin() ?? false;
        $status = match ($request->session()->get('status')) {
            Fortify::TWO_FACTOR_AUTHENTICATION_ENABLED => '2FA berhasil diaktifkan. Selesaikan konfirmasi kode dari aplikasi autentikator Anda.',
            Fortify::TWO_FACTOR_AUTHENTICATION_CONFIRMED => '2FA berhasil dikonfirmasi dan sekarang aktif melindungi akun Anda.',
            Fortify::TWO_FACTOR_AUTHENTICATION_DISABLED => '2FA berhasil dinonaktifkan.',
            Fortify::VERIFICATION_LINK_SENT => 'Link verifikasi email berhasil dikirim ulang.',
            default => $request->session()->get('status'),
        };

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'created_at' => $user->created_at,
                    'last_login_at' => $user->last_login_at,
                    'email_verified_at' => $user->email_verified_at,
                    'two_factor_confirmed_at' => $user->two_factor_confirmed_at,
                    'password_change_required' => $user->password_change_required,
                    'roles' => $user->roles->pluck('name')->values()->all(),
                    'isAdmin' => $isAdmin,
                ] : null,
                'can' => [
                    'manageApplications' => $isAdmin,
                    'manageUsers' => $isAdmin,
                    'manageSystem' => $isAdmin,
                ],
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'info' => $request->session()->get('info'),
                'status' => $status,
            ],
        ];
    }
}
