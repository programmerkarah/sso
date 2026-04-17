<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    public function index(): Response
    {
        $users = User::query()
            ->with('roles')
            ->latest()
            ->paginate(15)
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'created_at' => $user->created_at,
                'last_login_at' => $user->last_login_at,
                'email_verified_at' => $user->email_verified_at,
                'two_factor_confirmed_at' => $user->two_factor_confirmed_at,
                'roles' => $user->roles->pluck('name')->values()->all(),
                'is_admin' => $user->isAdmin(),
            ]);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
        ]);
    }

    public function resetPassword(User $user): RedirectResponse
    {
        $temporaryPassword = Str::password(12, letters: true, numbers: true, symbols: false);

        $user->forceFill([
            'password' => $temporaryPassword,
        ])->save();

        return back()->with([
            'success' => 'Password pengguna berhasil direset.',
            'info' => 'Password sementara hanya ditampilkan sekali. Segera salin dan kirimkan ke pengguna terkait.',
            'temporaryPassword' => $temporaryPassword,
            'temporaryPasswordFor' => $user->name,
        ]);
    }

    public function resetTwoFactor(User $user): RedirectResponse
    {
        $user->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();

        $user->trustedDevices()->delete();

        return back()->with('success', "2FA untuk {$user->name} berhasil direset. Pengguna harus mengaktifkan ulang 2FA saat diperlukan.");
    }

    public function toggleAdmin(Request $request, User $user): RedirectResponse
    {
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'Anda tidak dapat mengubah peran akun Anda sendiri.');
        }

        $adminRole = Role::where('name', 'admin')->firstOrFail();
        $userRole = Role::where('name', 'user')->first();

        if ($user->isAdmin()) {
            $user->roles()->detach($adminRole);
            if ($userRole) {
                $user->roles()->syncWithoutDetaching([$userRole->id]);
            }

            return back()->with('success', "{$user->name} telah diturunkan dari peran admin.");
        }

        $user->roles()->syncWithoutDetaching([$adminRole->id]);

        return back()->with('success', "{$user->name} berhasil dijadikan admin.");
    }
}
