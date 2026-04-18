<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Notifications\PasswordResetByAdmin;
use App\Services\EncryptedStateService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    public function index(Request $request, EncryptedStateService $encryptedState): Response
    {
        $state = $encryptedState->decryptArray($request->string('state')->toString(), [
            'page' => 1,
            'user_id' => null,
        ]);

        $selectedUserId = isset($state['user_id']) ? (int) $state['user_id'] : null;
        $currentPage = max(1, (int) ($state['page'] ?? 1));

        $usersQuery = User::query()
            ->with('roles')
            ->latest();

        if ($selectedUserId) {
            $usersQuery->whereKey($selectedUserId);
        }

        $users = $usersQuery
            ->paginate(15, ['*'], 'page', $currentPage);

        $selectedUser = $selectedUserId ? User::query()->find($selectedUserId) : null;

        return Inertia::render('Admin/Users/Index', [
            'users' => [
                'data' => $users->getCollection()->map(fn (User $user) => [
                    'id' => $user->id,
                    'route_key' => $user->getRouteKey(),
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'created_at' => $user->created_at,
                    'last_login_at' => $user->last_login_at,
                    'email_verified_at' => $user->email_verified_at,
                    'two_factor_confirmed_at' => $user->two_factor_confirmed_at,
                    'roles' => $user->roles->pluck('name')->values()->all(),
                    'is_admin' => $user->isAdmin(),
                ])->values()->all(),
                'current_page' => $users->currentPage(),
                'from' => $users->firstItem(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'to' => $users->lastItem(),
                'total' => $users->total(),
                'prev_page_token' => $users->currentPage() > 1
                    ? $encryptedState->encryptArray([
                        'page' => $users->currentPage() - 1,
                        'user_id' => $selectedUserId,
                    ])
                    : null,
                'next_page_token' => $users->hasMorePages()
                    ? $encryptedState->encryptArray([
                        'page' => $users->currentPage() + 1,
                        'user_id' => $selectedUserId,
                    ])
                    : null,
                'pages' => collect(range(1, $users->lastPage()))
                    ->map(fn (int $page) => [
                        'label' => (string) $page,
                        'token' => $encryptedState->encryptArray([
                            'page' => $page,
                            'user_id' => $selectedUserId,
                        ]),
                        'active' => $page === $users->currentPage(),
                    ])
                    ->all(),
            ],
            'userOptions' => User::query()
                ->select(['id', 'name', 'username', 'email'])
                ->orderBy('name')
                ->get()
                ->map(fn (User $user) => [
                    'label' => $user->name,
                    'description' => '@'.$user->username.' • '.$user->email,
                    'state_token' => $encryptedState->encryptArray([
                        'page' => 1,
                        'user_id' => $user->id,
                    ]),
                ])
                ->values()
                ->all(),
            'selectedUser' => $selectedUser ? [
                'label' => $selectedUser->name,
                'description' => '@'.$selectedUser->username.' • '.$selectedUser->email,
            ] : null,
            'clearFilterToken' => $encryptedState->encryptArray([
                'page' => 1,
                'user_id' => null,
            ]),
        ]);
    }

    public function resetPassword(User $user): RedirectResponse
    {
        $temporaryPassword = Str::password(12, letters: true, numbers: true, symbols: false);
        $previousPasswordHash = $user->getRawOriginal('password');

        $user->forceFill([
            'password' => $temporaryPassword,
            'password_change_required' => true,
            'previous_password' => $previousPasswordHash,
        ])->save();

        $user->notify(new PasswordResetByAdmin($temporaryPassword));

        return back()->with('success', "Password {$user->name} berhasil direset. Email dengan password sementara telah dikirim ke {$user->email}.");
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
