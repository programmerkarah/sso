<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateSecurityEmailRequest;
use App\Models\User;
use App\Support\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Actions\GenerateNewRecoveryCodes;

class SettingsController extends Controller
{
    public function security(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Settings/Security', [
            'twoFactorEnabled' => ! is_null($user->two_factor_secret),
            'twoFactorConfirmed' => ! is_null($user->two_factor_confirmed_at),
            'qrCodeSvg' => $user->two_factor_secret
                ? $user->twoFactorQrCodeSvg()
                : null,
            'recoveryCodes' => $user->two_factor_confirmed_at && $request->session()->has('two-factor-recovery-codes')
                ? $request->session()->get('two-factor-recovery-codes')
                : [],
        ]);
    }

    public function showRecoveryCodes(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (is_null($user->two_factor_confirmed_at)) {
            ActivityLogger::logByRequest(
                request: $request,
                event: 'account.recovery_codes.view.blocked',
                category: 'account_security',
                description: "Gagal menampilkan kode pemulihan karena 2FA pengguna {$user->name} belum aktif.",
                user: $user,
                status: 'warning',
            );

            return back()->with('error', 'Aktifkan dan konfirmasi 2FA terlebih dahulu sebelum melihat kode pemulihan.');
        }

        $request->session()->flash('two-factor-recovery-codes', $user->recoveryCodes());

        ActivityLogger::logByRequest(
            request: $request,
            event: 'account.recovery_codes.viewed',
            category: 'account_security',
            description: "Berhasil menampilkan kode pemulihan untuk pengguna {$user->name}.",
            user: $user,
        );

        return back()->with('info', 'Kode pemulihan berhasil ditampilkan. Simpan kode ini di tempat yang aman.');
    }

    public function regenerateRecoveryCodes(Request $request, GenerateNewRecoveryCodes $generate): RedirectResponse
    {
        $user = $request->user();

        if (is_null($user->two_factor_confirmed_at)) {
            ActivityLogger::logByRequest(
                request: $request,
                event: 'account.recovery_codes.regenerate.blocked',
                category: 'account_security',
                description: "Gagal meregenerasi kode pemulihan karena 2FA pengguna {$user->name} belum aktif.",
                user: $user,
                status: 'warning',
            );

            return back()->with('error', '2FA belum aktif, sehingga kode pemulihan belum bisa diregenerasi.');
        }

        $generate($user);
        $request->session()->flash('two-factor-recovery-codes', $user->fresh()->recoveryCodes());

        ActivityLogger::logByRequest(
            request: $request,
            event: 'account.recovery_codes.regenerated',
            category: 'account_security',
            description: "Berhasil meregenerasi kode pemulihan untuk pengguna {$user->name}.",
            user: $user,
        );

        return back()->with('success', 'Kode pemulihan berhasil diregenerasi. Gunakan kode terbaru yang tampil di halaman ini.');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $request->validate([
            'current_password' => ['required', 'string', 'current_password:web'],
            'password' => [
                'required',
                'confirmed',
                Password::defaults(),
                function (string $attribute, mixed $value, \Closure $fail) use ($user): void {
                    if (Hash::check((string) $value, $user->password)) {
                        $fail('Password baru tidak boleh sama dengan password Anda saat ini.');
                    }
                },
            ],
        ], [
            'current_password.required' => 'Password saat ini wajib diisi.',
            'current_password.current_password' => 'Password saat ini tidak sesuai.',
            'password.required' => 'Password baru wajib diisi.',
            'password.confirmed' => 'Konfirmasi password baru tidak cocok.',
        ]);

        $user->forceFill([
            'password' => $request->input('password'),
        ])->save();

        ActivityLogger::logByRequest(
            request: $request,
            event: 'account.password.updated',
            category: 'account_security',
            description: "Berhasil memperbarui password akun pengguna {$user->name}.",
            user: $user,
        );

        return back()->with('success', 'Password akun berhasil diperbarui.');
    }

    public function updateEmail(UpdateSecurityEmailRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $newEmail = strtolower((string) $request->string('email'));

        if ($newEmail === strtolower($user->email)) {
            ActivityLogger::logByRequest(
                request: $request,
                event: 'account.email.no-change',
                category: 'account_security',
                description: "Permintaan update email pengguna {$user->name} tidak mengubah data.",
                user: $user,
                metadata: [
                    'email' => $newEmail,
                ],
                status: 'warning',
            );

            return back()->with('info', 'Email baru sama dengan email saat ini. Tidak ada perubahan yang disimpan.');
        }

        $user->forceFill([
            'email' => $newEmail,
            'email_verified_at' => null,
        ])->save();

        $user->sendEmailVerificationNotification();

        ActivityLogger::logByRequest(
            request: $request,
            event: 'account.email.updated',
            category: 'account_security',
            description: "Berhasil memperbarui email akun pengguna {$user->name}; verifikasi ulang diperlukan.",
            user: $user,
            metadata: [
                'new_email' => $newEmail,
            ],
        );

        return back()->with('success', 'Email berhasil diperbarui. Silakan cek inbox untuk memverifikasi alamat email baru Anda.');
    }
}
