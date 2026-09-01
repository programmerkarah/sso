<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateSecurityEmailRequest;
use App\Models\User;
use App\Rules\SecurePassword;
use App\Services\EncryptedStateService;
use App\Support\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Actions\GenerateNewRecoveryCodes;
use Laravel\Fortify\Fortify;

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
            'twoFactorSecretKey' => $user->two_factor_secret
                ? Fortify::currentEncrypter()->decrypt($user->two_factor_secret)
                : null,
            'recoveryCodes' => $user->two_factor_confirmed_at && $request->session()->has('two-factor-recovery-codes')
                ? $request->session()->get('two-factor-recovery-codes')
                : [],
        ]);
    }

    public function sessions(Request $request, EncryptedStateService $encryptedState): Response
    {
        /** @var User $currentUser */
        $currentUser = $request->user();
        $activeSessionId = $request->session()->getId();
        $state = $this->resolveSessionState($request, $encryptedState);
        $selectedUserId = isset($state['user_id']) && $state['user_id'] !== null
            ? (int) $state['user_id']
            : null;
        $page = max(1, (int) ($state['page'] ?? 1));
        $sessionPage = max(1, (int) ($state['session_page'] ?? 1));
        $oauthPage = max(1, (int) ($state['oauth_page'] ?? 1));
        $sessionPerPage = 5;
        $oauthPerPage = 5;
        $isAdmin = $currentUser->isAdmin();

        if ($isAdmin) {
            $usersQuery = User::query()
                ->select(['id', 'name', 'username', 'email', 'last_login_at', 'created_at'])
                ->orderBy('name');

            $usersPaginator = $usersQuery->paginate(10, ['*'], 'page', $page);
            $selectedUser = $selectedUserId !== null ? User::query()->find($selectedUserId) : null;

            if (! $selectedUser && $selectedUserId !== null) {
                $selectedUser = $currentUser;
            }
        } else {
            $usersPaginator = null;
            $selectedUser = $currentUser;
        }

        $allSessions = $selectedUser
            ? collect(
                DB::table('sessions')
                    ->where('user_id', $selectedUser->id)
                    ->orderByRaw('CASE WHEN id = ? THEN 0 ELSE 1 END', [$activeSessionId])
                    ->orderByDesc('last_activity')
                    ->get(['id', 'ip_address', 'user_agent', 'last_activity'])
                    ->all(),
            )
            : collect();

        $allSessions = $allSessions
            ->map(fn ($session) => [
                'id' => $session->id,
                'ip_address' => $session->ip_address,
                'user_agent' => $session->user_agent,
                'last_activity' => $session->last_activity,
                'last_activity_at' => date('Y-m-d H:i:s', (int) $session->last_activity),
                'is_current' => $session->id === $activeSessionId,
            ])
            ->values()
            ->all();

        usort($allSessions, function (array $left, array $right): int {
            if ($left['is_current'] !== $right['is_current']) {
                return $left['is_current'] ? -1 : 1;
            }

            return (int) $right['last_activity'] <=> (int) $left['last_activity'];
        });

        $sessions = collect($allSessions)
            ->forPage($sessionPage, $sessionPerPage)
            ->values()
            ->all();

        $allOauthApplications = $selectedUser
            ? DB::table('oauth_access_tokens as tokens')
                ->join('oauth_clients as clients', 'clients.id', '=', 'tokens.client_id')
                ->where('tokens.user_id', $selectedUser->id)
                ->where('tokens.revoked', false)
                ->where(function ($query) {
                    $query->whereNull('tokens.expires_at')
                        ->orWhere('tokens.expires_at', '>', now());
                })
                ->select([
                    'tokens.id',
                    'tokens.client_id',
                    'clients.name as client_name',
                    'tokens.name as token_name',
                    'tokens.created_at',
                    'tokens.updated_at',
                    'tokens.expires_at',
                ])
                ->orderByDesc('tokens.created_at')
                ->get()
                ->map(fn ($token) => [
                    'id' => $token->id,
                    'client_id' => $token->client_id,
                    'client_name' => $token->client_name ?: $token->token_name,
                    'token_name' => $token->token_name,
                    'created_at' => $token->created_at,
                    'updated_at' => $token->updated_at,
                    'expires_at' => $token->expires_at,
                ])
                ->groupBy('client_id')
                ->map(fn ($tokenGroup) => collect($tokenGroup)->sortByDesc('created_at')->first())
                ->values()
                ->all()
            : [];

        $oauthApplications = collect($allOauthApplications)
            ->forPage($oauthPage, $oauthPerPage)
            ->values()
            ->all();

        $users = $isAdmin && $usersPaginator
            ? [
                'data' => collect($usersPaginator->items())
                    ->map(fn (User $user) => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'username' => $user->username,
                        'email' => $user->email,
                        'last_login_at' => $user->last_login_at,
                        'created_at' => $user->created_at,
                        'session_count' => DB::table('sessions')->where('user_id', $user->id)->count(),
                        'oauth_count' => DB::table('oauth_access_tokens')
                            ->where('user_id', $user->id)
                            ->where('revoked', false)
                            ->where(function ($query) {
                                $query->whereNull('expires_at')
                                    ->orWhere('expires_at', '>', now());
                            })
                            ->distinct('client_id')
                            ->count('client_id'),
                        'state_token' => $encryptedState->encryptArray([
                            'page' => $page,
                            'user_id' => $user->id,
                            'session_page' => $sessionPage,
                            'oauth_page' => $oauthPage,
                        ]),
                    ])
                    ->values()
                    ->all(),
                'current_page' => $usersPaginator->currentPage(),
                'last_page' => $usersPaginator->lastPage(),
                'per_page' => $usersPaginator->perPage(),
                'total' => $usersPaginator->total(),
                'prev_page_token' => $usersPaginator->currentPage() > 1
                    ? $encryptedState->encryptArray([
                        'page' => $usersPaginator->currentPage() - 1,
                        'user_id' => $selectedUserId,
                        'session_page' => 1,
                        'oauth_page' => 1,
                    ])
                    : null,
                'next_page_token' => $usersPaginator->hasMorePages()
                    ? $encryptedState->encryptArray([
                        'page' => $usersPaginator->currentPage() + 1,
                        'user_id' => $selectedUserId,
                        'session_page' => 1,
                        'oauth_page' => 1,
                    ])
                    : null,
            ]
            : [
                'data' => [[
                    'id' => $selectedUser->id,
                    'name' => $selectedUser->name,
                    'username' => $selectedUser->username,
                    'email' => $selectedUser->email,
                    'last_login_at' => $selectedUser->last_login_at,
                    'created_at' => $selectedUser->created_at,
                    'session_count' => count($sessions),
                    'oauth_count' => count($oauthApplications),
                    'state_token' => $encryptedState->encryptArray([
                        'page' => $page,
                        'user_id' => $selectedUser->id,
                        'session_page' => $sessionPage,
                        'oauth_page' => $oauthPage,
                    ]),
                ]],
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => 1,
                'total' => 1,
                'prev_page_token' => null,
                'next_page_token' => null,
            ];

        return Inertia::render('Settings/Sessions', [
            'users' => $users,
            'selectedUser' => $selectedUser ? [
                'id' => $selectedUser->id,
                'name' => $selectedUser->name,
                'username' => $selectedUser->username,
                'email' => $selectedUser->email,
                'last_login_at' => $selectedUser->last_login_at,
            ] : null,
            'sessions' => $sessions,
            'sessionMeta' => [
                'current_page' => $sessionPage,
                'last_page' => max(1, (int) ceil(count($allSessions) / $sessionPerPage)),
                'per_page' => $sessionPerPage,
                'total' => count($allSessions),
            ],
            'session_prev_page_token' => $sessionPage > 1
                ? $encryptedState->encryptArray([
                    'page' => $page,
                    'user_id' => $selectedUserId,
                    'session_page' => $sessionPage - 1,
                    'oauth_page' => $oauthPage,
                ])
                : null,
            'session_next_page_token' => $sessionPage < max(1, (int) ceil(count($allSessions) / $sessionPerPage))
                ? $encryptedState->encryptArray([
                    'page' => $page,
                    'user_id' => $selectedUserId,
                    'session_page' => $sessionPage + 1,
                    'oauth_page' => $oauthPage,
                ])
                : null,
            'oauthApplications' => $oauthApplications,
            'oauthMeta' => [
                'current_page' => $oauthPage,
                'last_page' => max(1, (int) ceil(count($allOauthApplications) / $oauthPerPage)),
                'per_page' => $oauthPerPage,
                'total' => count($allOauthApplications),
            ],
            'oauth_prev_page_token' => $oauthPage > 1
                ? $encryptedState->encryptArray([
                    'page' => $page,
                    'user_id' => $selectedUserId,
                    'session_page' => $sessionPage,
                    'oauth_page' => $oauthPage - 1,
                ])
                : null,
            'oauth_next_page_token' => $oauthPage < max(1, (int) ceil(count($allOauthApplications) / $oauthPerPage))
                ? $encryptedState->encryptArray([
                    'page' => $page,
                    'user_id' => $selectedUserId,
                    'session_page' => $sessionPage,
                    'oauth_page' => $oauthPage + 1,
                ])
                : null,
        ]);
    }

    private function resolveSessionState(Request $request, EncryptedStateService $encryptedState): array
    {
        $defaults = [
            'page' => 1,
            'user_id' => null,
            'session_page' => 1,
            'oauth_page' => 1,
        ];

        if (! $request->isMethod('post')) {
            return [
                ...$defaults,
                'page' => max(1, (int) $request->input('page', 1)),
                'user_id' => $request->input('user_id') !== null ? (int) $request->input('user_id') : null,
                'session_page' => max(1, (int) $request->input('session_page', 1)),
                'oauth_page' => max(1, (int) $request->input('oauth_page', 1)),
            ];
        }

        return array_merge(
            $defaults,
            $encryptedState->decryptArray($request->string('state')->toString(), $defaults),
        );
    }

    public function revokeSession(Request $request, string $sessionId): RedirectResponse
    {
        $user = $request->user();
        $targetUserId = $request->input('user_id');
        $targetUser = $this->resolveSessionTargetUser($user, $targetUserId);

        $deleted = DB::table('sessions')
            ->where('id', $sessionId)
            ->where('user_id', $targetUser->id)
            ->delete();

        if ($deleted) {
            ActivityLogger::logByRequest(
                request: $request,
                event: 'account.session.revoked',
                category: 'account_security',
                description: "Pengguna {$user->name} mengakhiri sesi aktif yang dipilih untuk {$targetUser->name}.",
                user: $user,
                metadata: [
                    'session_id' => $sessionId,
                    'target_user_id' => $targetUser->id,
                ],
            );
        }

        return redirect()->route('settings.sessions', ['user_id' => $targetUser->id])
            ->with('success', 'Sesi yang dipilih berhasil diakhiri.');
    }

    public function revokeOauthAccess(Request $request, string $tokenId): RedirectResponse
    {
        $user = $request->user();
        $targetUserId = $request->input('user_id');
        $targetUser = $this->resolveSessionTargetUser($user, $targetUserId);

        $updated = DB::table('oauth_access_tokens')
            ->where('id', $tokenId)
            ->where('user_id', $targetUser->id)
            ->update([
                'revoked' => true,
                'updated_at' => now(),
            ]);

        if ($updated) {
            ActivityLogger::logByRequest(
                request: $request,
                event: 'account.oauth.token.revoked',
                category: 'account_security',
                description: "Pengguna {$user->name} mencabut akses aplikasi OAuth yang terdaftar untuk {$targetUser->name}.",
                user: $user,
                metadata: [
                    'token_id' => $tokenId,
                    'target_user_id' => $targetUser->id,
                ],
            );
        }

        return redirect()->route('settings.sessions', ['user_id' => $targetUser->id])
            ->with('success', 'Akses OAuth untuk aplikasi yang dipilih berhasil dicabut.');
    }

    private function resolveSessionTargetUser(User $actor, mixed $targetUserId): User
    {
        if ($targetUserId === null || $targetUserId === '') {
            return $actor;
        }

        $targetUserId = (int) $targetUserId;

        if ($targetUserId === $actor->id) {
            return $actor;
        }

        if (! $actor->isAdmin()) {
            abort(403, 'Anda tidak diizinkan untuk mengelola akun pengguna lain.');
        }

        $targetUser = User::query()->find($targetUserId);

        if (! $targetUser) {
            abort(404, 'Pengguna target tidak ditemukan.');
        }

        return $targetUser;
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
                new SecurePassword($user->name, $user->username, $user->email),
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
