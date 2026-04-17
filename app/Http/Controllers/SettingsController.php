<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
            return back()->with('error', 'Aktifkan dan konfirmasi 2FA terlebih dahulu sebelum melihat kode pemulihan.');
        }

        $request->session()->flash('two-factor-recovery-codes', $user->recoveryCodes());

        return back()->with('info', 'Kode pemulihan berhasil ditampilkan. Simpan kode ini di tempat yang aman.');
    }

    public function regenerateRecoveryCodes(Request $request, GenerateNewRecoveryCodes $generate): RedirectResponse
    {
        $user = $request->user();

        if (is_null($user->two_factor_confirmed_at)) {
            return back()->with('error', '2FA belum aktif, sehingga kode pemulihan belum bisa diregenerasi.');
        }

        $generate($user);
        $request->session()->flash('two-factor-recovery-codes', $user->fresh()->recoveryCodes());

        return back()->with('success', 'Kode pemulihan berhasil diregenerasi. Gunakan kode terbaru yang tampil di halaman ini.');
    }
}
