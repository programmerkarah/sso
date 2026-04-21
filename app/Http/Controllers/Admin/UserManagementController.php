<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BatchUpdateUserAccessRequest;
use App\Http\Requests\Admin\UpdateUserAccessRequest;
use App\Http\Requests\Admin\UpdateUserIdentityRequest;
use App\Models\Organization;
use App\Models\Role;
use App\Models\User;
use App\Notifications\PasswordResetByAdmin;
use App\Services\EncryptedStateService;
use App\Support\ActivityLogger;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Throwable;

class UserManagementController extends Controller
{
    public function index(Request $request, EncryptedStateService $encryptedState): Response
    {
        $state = $this->resolveState($request, $encryptedState);

        $selectedUserId = isset($state['user_id']) ? (int) $state['user_id'] : null;
        $pendingOnly = (bool) ($state['pending_only'] ?? false);
        $currentPage = max(1, (int) ($state['page'] ?? 1));

        $usersQuery = $this->buildUsersQuery($selectedUserId, $pendingOnly)
            ->orderBy('name');

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
                    'organization' => $user->organization ? [
                        'id' => $user->organization->id,
                        'name' => $user->organization->name,
                        'type' => $user->organization->type,
                    ] : null,
                    'created_at' => $user->created_at,
                    'last_login_at' => $user->last_login_at,
                    'email_verified_at' => $user->email_verified_at,
                    'admin_verified_at' => $user->admin_verified_at,
                    'is_admin_verified' => $user->isAdminVerified(),
                    'two_factor_confirmed_at' => $user->two_factor_confirmed_at,
                    'roles' => $user->roles->pluck('name')->values()->all(),
                    'role_ids' => $user->roles->pluck('id')->values()->all(),
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
                        'pending_only' => $pendingOnly,
                    ])
                    : null,
                'next_page_token' => $users->hasMorePages()
                    ? $encryptedState->encryptArray([
                        'page' => $users->currentPage() + 1,
                        'user_id' => $selectedUserId,
                        'pending_only' => $pendingOnly,
                    ])
                    : null,
                'pages' => collect(range(1, $users->lastPage()))
                    ->map(fn (int $page) => [
                        'label' => (string) $page,
                        'token' => $encryptedState->encryptArray([
                            'page' => $page,
                            'user_id' => $selectedUserId,
                            'pending_only' => $pendingOnly,
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
                        'pending_only' => $pendingOnly,
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
                'pending_only' => false,
            ]),
            'exportStateToken' => $encryptedState->encryptArray([
                'page' => 1,
                'user_id' => $selectedUserId,
                'pending_only' => $pendingOnly,
            ]),
            'pendingOnlyActive' => $pendingOnly,
            'pendingOnlyFilterToken' => $encryptedState->encryptArray([
                'page' => 1,
                'user_id' => null,
                'pending_only' => true,
            ]),
            'allUsersFilterToken' => $encryptedState->encryptArray([
                'page' => 1,
                'user_id' => $selectedUserId,
                'pending_only' => false,
            ]),
            'organizationOptions' => Organization::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'type'])
                ->map(fn (Organization $organization) => [
                    'id' => $organization->id,
                    'label' => $organization->name,
                    'description' => $organization->type,
                ])
                ->values()
                ->all(),
            'roleOptions' => Role::query()
                ->orderBy('name')
                ->get(['id', 'name', 'description'])
                ->map(fn (Role $role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'description' => $role->description,
                ])
                ->values()
                ->all(),
        ]);
    }

    public function exportExcel(Request $request, EncryptedStateService $encryptedState): HttpResponse
    {
        $state = $this->resolveState($request, $encryptedState);
        $selectedUserId = isset($state['user_id']) ? (int) ($state['user_id']) : null;
        $pendingOnly = (bool) ($state['pending_only'] ?? false);
        $users = $this->buildUsersQuery($selectedUserId, $pendingOnly)
            ->orderBy('name')
            ->get(['id', 'name', 'username', 'email']);

        $filename = $selectedUserId ? 'pengguna-terfilter.xlsx' : 'pengguna-sso.xlsx';

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        $sheet->setCellValue('A1', 'No');
        $sheet->setCellValue('B1', 'Nama');
        $sheet->setCellValue('C1', 'Username');
        $sheet->setCellValue('D1', 'Email');

        $rowNumber = 2;
        $counter = 1;
        foreach ($users as $user) {
            $sheet->setCellValue('A'.$rowNumber, $counter);
            $sheet->setCellValue('B'.$rowNumber, $user->name);
            $sheet->setCellValue('C'.$rowNumber, $user->username);
            $sheet->setCellValue('D'.$rowNumber, $user->email);

            $rowNumber++;
            $counter++;
        }

        foreach (['A', 'B', 'C', 'D'] as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);
        ob_start();
        $writer->save('php://output');
        $content = ob_get_clean() ?: '';

        ActivityLogger::logByRequest(
            request: $request,
            event: 'admin.users.export.xlsx',
            category: 'user_management',
            description: 'Export pengguna format XLSX dijalankan.',
            user: $request->user(),
            metadata: [
                'selected_user_id' => $selectedUserId,
                'total_exported' => $users->count(),
            ],
        );

        return response($content, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }

    public function exportPdf(Request $request, EncryptedStateService $encryptedState): HttpResponse
    {
        $state = $this->resolveState($request, $encryptedState);
        $selectedUserId = isset($state['user_id']) ? (int) ($state['user_id']) : null;
        $pendingOnly = (bool) ($state['pending_only'] ?? false);
        $users = $this->buildUsersQuery($selectedUserId, $pendingOnly)
            ->orderBy('name')
            ->get(['id', 'name', 'username', 'email']);

        $pdf = Pdf::loadView('admin.users.export-pdf', [
            'users' => $users,
            'generatedAt' => now(),
        ])->setPaper('a4', 'portrait');

        $filename = $selectedUserId ? 'pengguna-terfilter.pdf' : 'pengguna-sso.pdf';

        ActivityLogger::logByRequest(
            request: $request,
            event: 'admin.users.export.pdf',
            category: 'user_management',
            description: 'Export pengguna format PDF dijalankan.',
            user: $request->user(),
            metadata: [
                'selected_user_id' => $selectedUserId,
                'total_exported' => $users->count(),
            ],
        );

        return response($pdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }

    public function resetPassword(User $user): RedirectResponse
    {
        $temporaryPassword = Str::password(12, letters: true, numbers: true, symbols: false);
        $previousPasswordHash = $user->getRawOriginal('password');

        try {
            DB::transaction(function () use ($user, $temporaryPassword, $previousPasswordHash): void {
                $user->forceFill([
                    'password' => $temporaryPassword,
                    'password_change_required' => true,
                    'previous_password' => $previousPasswordHash,
                ])->save();

                $user->notify(new PasswordResetByAdmin($temporaryPassword));
            });
        } catch (Throwable $exception) {
            Log::error('Gagal mengirim email reset password oleh admin.', [
                'target_user_id' => $user->id,
                'target_email' => $user->email,
                'error' => $exception->getMessage(),
            ]);

            ActivityLogger::logByRequest(
                request: request(),
                event: 'admin.users.password.reset.failed',
                category: 'user_management',
                description: 'Reset password pengguna gagal karena notifikasi tidak terkirim.',
                user: request()->user(),
                metadata: [
                    'target_user_id' => $user->id,
                    'target_email' => $user->email,
                ],
                status: 'error',
            );

            return back()->with('error', "Reset password {$user->name} dibatalkan karena email gagal dikirim. Tidak ada perubahan password.");
        }

        ActivityLogger::logByRequest(
            request: request(),
            event: 'admin.users.password.reset',
            category: 'user_management',
            description: 'Admin mereset password pengguna.',
            user: request()->user(),
            metadata: [
                'target_user_id' => $user->id,
                'target_email' => $user->email,
            ],
        );

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

        ActivityLogger::logByRequest(
            request: request(),
            event: 'admin.users.two_factor.reset',
            category: 'user_management',
            description: 'Admin mereset 2FA pengguna.',
            user: request()->user(),
            metadata: [
                'target_user_id' => $user->id,
                'target_email' => $user->email,
            ],
        );

        return back()->with('success', "2FA untuk {$user->name} berhasil direset. Pengguna harus mengaktifkan ulang 2FA saat diperlukan.");
    }

    public function toggleAdmin(Request $request, User $user): RedirectResponse
    {
        if ($user->id === $request->user()->id) {
            ActivityLogger::logByRequest(
                request: $request,
                event: 'admin.users.role.blocked-self-update',
                category: 'user_management',
                description: 'Upaya perubahan peran admin akun sendiri ditolak.',
                user: $request->user(),
                metadata: [
                    'target_user_id' => $user->id,
                    'target_email' => $user->email,
                ],
                status: 'warning',
            );

            return back()->with('error', 'Anda tidak dapat mengubah peran akun Anda sendiri.');
        }

        $adminRole = Role::where('name', 'admin')->firstOrFail();
        $userRole = Role::where('name', 'user')->first();

        if ($user->isAdmin()) {
            $user->roles()->detach($adminRole);
            if ($userRole) {
                $user->roles()->syncWithoutDetaching([$userRole->id]);
            }

            ActivityLogger::logByRequest(
                request: $request,
                event: 'admin.users.role.revoked',
                category: 'user_management',
                description: 'Peran admin pengguna dicabut.',
                user: $request->user(),
                metadata: [
                    'target_user_id' => $user->id,
                    'target_email' => $user->email,
                    'role' => 'admin',
                ],
            );

            return back()->with('success', "{$user->name} telah diturunkan dari peran admin.");
        }

        $user->roles()->syncWithoutDetaching([$adminRole->id]);

        ActivityLogger::logByRequest(
            request: $request,
            event: 'admin.users.role.granted',
            category: 'user_management',
            description: 'Peran admin pengguna diberikan.',
            user: $request->user(),
            metadata: [
                'target_user_id' => $user->id,
                'target_email' => $user->email,
                'role' => 'admin',
            ],
        );

        return back()->with('success', "{$user->name} berhasil dijadikan admin.");
    }

    public function updateIdentity(UpdateUserIdentityRequest $request, User $user): RedirectResponse
    {
        $newUsername = (string) $request->string('username');
        $newEmail = strtolower((string) $request->string('email'));

        $emailChanged = strtolower($user->email) !== $newEmail;
        $usernameChanged = $user->username !== $newUsername;

        if (! $emailChanged && ! $usernameChanged) {
            ActivityLogger::logByRequest(
                request: $request,
                event: 'admin.users.identity.no-change',
                category: 'user_management',
                description: 'Permintaan pembaruan identitas tidak mengubah data pengguna.',
                user: $request->user(),
                metadata: [
                    'target_user_id' => $user->id,
                    'target_email' => $user->email,
                ],
                status: 'warning',
            );

            return back()->with('info', "Tidak ada perubahan untuk akun {$user->name}.");
        }

        $user->username = $newUsername;
        $user->email = $newEmail;

        if ($emailChanged) {
            $user->email_verified_at = null;
        }

        $user->save();

        if ($emailChanged) {
            $user->sendEmailVerificationNotification();
        }

        ActivityLogger::logByRequest(
            request: $request,
            event: 'admin.users.identity.updated',
            category: 'user_management',
            description: 'Admin memperbarui username/email pengguna.',
            user: $request->user(),
            metadata: [
                'target_user_id' => $user->id,
                'email_changed' => $emailChanged,
                'username_changed' => $usernameChanged,
            ],
        );

        return back()->with('success', "Identitas akun {$user->name} berhasil diperbarui.");
    }

    public function updateAccess(UpdateUserAccessRequest $request, User $user): RedirectResponse
    {
        $organizationId = $request->filled('organization_id') ? (int) $request->integer('organization_id') : null;
        $roleIds = collect($request->input('role_ids', []))
            ->map(fn (mixed $id) => (int) $id)
            ->filter()
            ->unique()
            ->values();

        $adminRoleId = Role::query()->where('name', 'admin')->value('id');
        if (
            $user->id === $request->user()->id
            && $adminRoleId
            && ! $roleIds->contains((int) $adminRoleId)
        ) {
            ActivityLogger::logByRequest(
                request: $request,
                event: 'admin.users.access.blocked-self-admin-removal',
                category: 'user_management',
                description: 'Upaya menghapus peran admin dari akun sendiri ditolak.',
                user: $request->user(),
                metadata: [
                    'target_user_id' => $user->id,
                    'requested_role_ids' => $roleIds->all(),
                ],
                status: 'warning',
            );

            return back()->with('error', 'Anda tidak dapat menghapus peran admin dari akun sendiri.');
        }

        $user->forceFill([
            'organization_id' => $organizationId,
        ])->save();

        $user->roles()->sync($roleIds->all());

        ActivityLogger::logByRequest(
            request: $request,
            event: 'admin.users.access.updated',
            category: 'user_management',
            description: 'Admin memperbarui organisasi dan peran pengguna.',
            user: $request->user(),
            metadata: [
                'target_user_id' => $user->id,
                'organization_id' => $organizationId,
                'role_ids' => $roleIds->all(),
            ],
        );

        return back()->with('success', "Akses organisasi dan role untuk {$user->name} berhasil diperbarui.");
    }

    public function toggleAdminVerification(Request $request, User $user): RedirectResponse
    {
        if ($user->id === $request->user()?->id && $user->isAdminVerified()) {
            ActivityLogger::logByRequest(
                request: $request,
                event: 'admin.users.verification.blocked-self-revoke',
                category: 'user_management',
                description: 'Upaya mencabut verifikasi admin untuk akun sendiri ditolak.',
                user: $request->user(),
                metadata: [
                    'target_user_id' => $user->id,
                    'target_email' => $user->email,
                ],
                status: 'warning',
            );

            return back()->with('error', 'Anda tidak dapat mencabut verifikasi admin untuk akun Anda sendiri.');
        }

        if ($user->isAdminVerified()) {
            $user->forceFill([
                'admin_verified_at' => null,
                'admin_verified_by' => null,
            ])->save();

            ActivityLogger::logByRequest(
                request: $request,
                event: 'admin.users.verification.revoked',
                category: 'user_management',
                description: 'Admin mencabut verifikasi akses pengguna.',
                user: $request->user(),
                metadata: [
                    'target_user_id' => $user->id,
                    'target_email' => $user->email,
                ],
            );

            return back()->with('success', "Verifikasi admin untuk {$user->name} berhasil dicabut.");
        }

        $user->forceFill([
            'admin_verified_at' => now(),
            'admin_verified_by' => $request->user()?->id,
        ])->save();

        ActivityLogger::logByRequest(
            request: $request,
            event: 'admin.users.verification.granted',
            category: 'user_management',
            description: 'Admin memverifikasi akses pengguna.',
            user: $request->user(),
            metadata: [
                'target_user_id' => $user->id,
                'target_email' => $user->email,
            ],
        );

        return back()->with('success', "Verifikasi admin untuk {$user->name} berhasil diberikan.");
    }

    public function batchVerify(Request $request): RedirectResponse
    {
        $userIds = collect($request->input('user_ids', []))
            ->map(fn (mixed $id) => (int) $id)
            ->filter()
            ->unique()
            ->values();

        if ($userIds->isEmpty()) {
            ActivityLogger::logByRequest(
                request: $request,
                event: 'admin.users.verification.batch-empty-selection',
                category: 'user_management',
                description: 'Verifikasi batch dibatalkan karena tidak ada pengguna terpilih.',
                user: $request->user(),
                status: 'warning',
            );

            return back()->with('error', 'Tidak ada pengguna yang dipilih.');
        }

        $targetUsers = User::query()
            ->whereIn('id', $userIds)
            ->whereNull('admin_verified_at')
            ->get();

        $now = now();
        $adminId = $request->user()->id;

        DB::transaction(function () use ($targetUsers, $now, $adminId): void {
            foreach ($targetUsers as $targetUser) {
                $targetUser->forceFill([
                    'admin_verified_at' => $now,
                    'admin_verified_by' => $adminId,
                ])->save();
            }
        });

        ActivityLogger::logByRequest(
            request: $request,
            event: 'admin.users.verification.batch-verified',
            category: 'user_management',
            description: 'Admin memverifikasi beberapa pengguna secara batch.',
            user: $request->user(),
            metadata: [
                'user_ids' => $targetUsers->pluck('id')->all(),
            ],
        );

        return back()->with('success', "Verifikasi berhasil diterapkan ke {$targetUsers->count()} pengguna.");
    }

    public function batchUpdateAccess(BatchUpdateUserAccessRequest $request): RedirectResponse
    {
        $userIds = collect($request->input('user_ids', []))
            ->map(fn (mixed $id) => (int) $id)
            ->filter()
            ->unique()
            ->values();

        $hasOrganization = $request->filled('organization_id');
        $organizationId = $hasOrganization ? (int) $request->integer('organization_id') : null;

        $hasRoles = $request->has('role_ids');
        $roleIds = collect($request->input('role_ids', []))
            ->map(fn (mixed $id) => (int) $id)
            ->filter()
            ->unique()
            ->values();

        $adminRoleId = (int) (Role::query()->where('name', 'admin')->value('id') ?? 0);
        if ($hasRoles && $adminRoleId > 0) {
            $containsSelf = $userIds->contains((int) $request->user()->id);
            $adminRemoved = ! $roleIds->contains($adminRoleId);

            if ($containsSelf && $adminRemoved) {
                ActivityLogger::logByRequest(
                    request: $request,
                    event: 'admin.users.access.batch-blocked-self-admin-removal',
                    category: 'user_management',
                    description: 'Pembaruan akses batch ditolak karena mencabut admin dari akun sendiri.',
                    user: $request->user(),
                    metadata: [
                        'user_ids' => $userIds->all(),
                        'requested_role_ids' => $roleIds->all(),
                    ],
                    status: 'warning',
                );

                return back()->with('error', 'Aksi batch tidak boleh mencabut peran admin dari akun Anda sendiri.');
            }
        }

        $targetUsers = User::query()->whereIn('id', $userIds)->get();

        DB::transaction(function () use ($targetUsers, $hasOrganization, $organizationId, $hasRoles, $roleIds): void {
            foreach ($targetUsers as $targetUser) {
                if ($hasOrganization) {
                    $targetUser->forceFill([
                        'organization_id' => $organizationId,
                    ])->save();
                }

                if ($hasRoles) {
                    $targetUser->roles()->sync($roleIds->all());
                }
            }
        });

        ActivityLogger::logByRequest(
            request: $request,
            event: 'admin.users.access.batch-updated',
            category: 'user_management',
            description: 'Admin menjalankan pembaruan organisasi/peran secara batch.',
            user: $request->user(),
            metadata: [
                'user_ids' => $userIds->all(),
                'organization_id' => $organizationId,
                'role_ids' => $hasRoles ? $roleIds->all() : null,
            ],
        );

        return back()->with('success', "Pembaruan batch berhasil diterapkan ke {$targetUsers->count()} pengguna.");
    }

    private function resolveState(Request $request, EncryptedStateService $encryptedState): array
    {
        return $encryptedState->decryptArray($request->string('state')->toString(), [
            'page' => 1,
            'user_id' => null,
            'pending_only' => false,
        ]);
    }

    private function buildUsersQuery(?int $selectedUserId, bool $pendingOnly): Builder
    {
        return User::query()
            ->with(['roles', 'organization'])
            ->when($pendingOnly, fn ($query) => $query->whereNull('admin_verified_at'))
            ->when($selectedUserId, fn ($query) => $query->whereKey($selectedUserId));
    }
}
