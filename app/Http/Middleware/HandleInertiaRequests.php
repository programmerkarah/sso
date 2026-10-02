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

        $pageMeta = match (true) {
            $request->routeIs('dashboard') => ['title' => 'Dashboard', 'description' => 'Akses aplikasi dan kelola kebutuhan akun dari satu tempat.', 'section' => 'home'],
            $request->routeIs('applications.*') => ['title' => 'Aplikasi SSO', 'description' => 'Aplikasi yang tersedia melalui akun Single Sign-On Anda.', 'section' => 'applications'],
            $request->routeIs('settings.security') => ['title' => 'Keamanan Akun', 'description' => 'Kelola password, email, dan autentikasi dua faktor.', 'section' => 'account'],
            $request->routeIs('settings.sessions') => ['title' => 'Sesi & Akses', 'description' => 'Kelola sesi web aktif dan akses OAuth yang terhubung.', 'section' => 'account'],
            $request->routeIs('admin.applications.*') => ['title' => 'Aplikasi', 'description' => 'Kelola aplikasi yang terhubung ke SSO.', 'section' => 'admin'],
            $request->routeIs('admin.organizations.*') => ['title' => 'Organisasi', 'description' => 'Kelola organisasi dan cakupan akses aplikasi.', 'section' => 'admin'],
            $request->routeIs('admin.users.*') => ['title' => 'Pengguna', 'description' => 'Kelola identitas, akses, verifikasi, dan keamanan pengguna.', 'section' => 'admin'],
            $request->routeIs('admin.system.*') => ['title' => 'Sistem', 'description' => 'Pantau layanan, database, backup, dan audit aktivitas.', 'section' => 'admin'],
            default => ['title' => config('app.name', 'SSO BPS Kota Sawahlunto'), 'description' => 'Single Sign-On', 'section' => null],
        };

        return [
            ...parent::share($request),
            'app' => [
                'name' => config('app.name', 'SSO BPS Kota Sawahlunto'),
                'product_name' => 'SSO BPS Kota Sawahlunto',
                'product_short_name' => 'SSO',
                'description' => 'Single Sign-On',
                'locale' => app()->getLocale(),
            ],
            'ui' => [
                'page' => $pageMeta,
                'container' => 'max-w-[1680px]',
            ],
            'navigation' => [
                'primary' => array_values(array_filter([
                    ['label' => 'Dashboard', 'href' => '/dashboard', 'icon' => 'dashboard'],
                    ['label' => 'Aplikasi', 'href' => '/applications', 'icon' => 'applications'],
                ])),
                'account' => [
                    ['label' => 'Keamanan akun', 'href' => '/settings/security'],
                    ['label' => 'Sesi & akses', 'href' => '/settings/sessions'],
                ],
                'admin' => array_values(array_filter([
                    $isAdmin ? ['label' => 'Kelola aplikasi', 'href' => '/admin/applications'] : null,
                    $isAdmin ? ['label' => 'Organisasi', 'href' => '/admin/organizations'] : null,
                    $isAdmin ? ['label' => 'Pengguna', 'href' => '/admin/users'] : null,
                    $isAdmin ? ['label' => 'Sistem', 'href' => '/admin/system'] : null,
                ])),
            ],
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'created_at' => $user->created_at,
                    'last_login_at' => $user->last_login_at,
                    'email_verified_at' => $user->email_verified_at,
                    'admin_verified_at' => $user->admin_verified_at,
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
