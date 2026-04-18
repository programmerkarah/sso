<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserIdentityRequest;
use App\Models\Role;
use App\Models\User;
use App\Notifications\PasswordResetByAdmin;
use App\Services\EncryptedStateService;
use App\Support\ActivityLogger;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class UserManagementController extends Controller
{
    public function index(Request $request, EncryptedStateService $encryptedState): Response
    {
        $state = $this->resolveState($request, $encryptedState);

        $selectedUserId = isset($state['user_id']) ? (int) $state['user_id'] : null;
        $currentPage = max(1, (int) ($state['page'] ?? 1));

        $usersQuery = $this->buildUsersQuery($selectedUserId)
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
            'exportStateToken' => $encryptedState->encryptArray([
                'page' => 1,
                'user_id' => $selectedUserId,
            ]),
        ]);
    }

    public function exportExcel(Request $request, EncryptedStateService $encryptedState): HttpResponse
    {
        $state = $this->resolveState($request, $encryptedState);
        $selectedUserId = isset($state['user_id']) ? (int) ($state['user_id']) : null;
        $users = $this->buildUsersQuery($selectedUserId)
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
        $users = $this->buildUsersQuery($selectedUserId)
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

        $user->forceFill([
            'password' => $temporaryPassword,
            'password_change_required' => true,
            'previous_password' => $previousPasswordHash,
        ])->save();

        $user->notify(new PasswordResetByAdmin($temporaryPassword));

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

    private function resolveState(Request $request, EncryptedStateService $encryptedState): array
    {
        return $encryptedState->decryptArray($request->string('state')->toString(), [
            'page' => 1,
            'user_id' => null,
        ]);
    }

    private function buildUsersQuery(?int $selectedUserId)
    {
        return User::query()
            ->with('roles')
            ->when($selectedUserId, fn ($query) => $query->whereKey($selectedUserId));
    }
}
