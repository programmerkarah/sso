<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ChangePasswordController extends Controller
{
    /**
     * Show the forced password change form.
     */
    public function show(Request $request): Response|RedirectResponse
    {
        if (! $request->user()?->mustChangePassword()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Settings/ChangePassword');
    }

    /**
     * Update the user's password after a forced reset.
     *
     * Rules: new password must not match the previous password stored at reset time.
     */
    public function update(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (! $user || ! $user->mustChangePassword()) {
            return redirect()->route('dashboard');
        }

        $request->validate([
            'password' => [
                'required',
                'confirmed',
                Password::defaults(),
                function (string $attribute, mixed $value, \Closure $fail) use ($user): void {
                    if ($user->previous_password && Hash::check($value, $user->previous_password)) {
                        $fail('Password baru tidak boleh sama dengan password Anda sebelum reset dilakukan.');
                    }
                },
            ],
        ], [
            'password.required' => 'Password baru wajib diisi.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ]);

        $user->forceFill([
            'password' => $request->input('password'),
            'password_change_required' => false,
            'previous_password' => null,
        ])->save();

        return redirect()->route('dashboard')->with('success', 'Password berhasil diperbarui. Selamat datang!');
    }
}
