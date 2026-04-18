<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\TrustedDevice;
use App\Models\User;
use App\Notifications\PasswordResetByAdmin;
use App\Services\EncryptedStateService;
use Database\Seeders\RoleSeeder;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Tests\TestCase;

class AdminUserManagementTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Ensure logged-in users are redirected away from the public welcome page.
     */
    public function test_authenticated_user_is_redirected_from_welcome_to_dashboard(): void
    {
        $user = User::factory()->create();
        $user->forceFill([
            'two_factor_confirmed_at' => now(),
        ])->save();

        $response = $this->actingAs($user)->get('/');

        $response->assertRedirect(route('dashboard'));
    }

    /**
     * Ensure admin can reset a user's password and the user receives an email notification.
     */
    public function test_admin_can_reset_user_password(): void
    {
        Notification::fake();

        [$admin, $targetUser] = $this->createAdminAndTargetUser();

        $previousPassword = $targetUser->password;

        $response = $this
            ->actingAs($admin)
            ->from('/admin/users')
            ->post(route('admin.users.reset-password', $targetUser));

        $targetUser->refresh();

        $response
            ->assertRedirect('/admin/users')
            ->assertSessionHas('success');

        // Password must have changed
        $this->assertNotSame($previousPassword, $targetUser->password);

        // Flag must be set
        $this->assertTrue($targetUser->password_change_required);
        $this->assertNotNull($targetUser->previous_password);

        // Email must be sent to the target user
        Notification::assertSentTo($targetUser, PasswordResetByAdmin::class);
    }

    /**
     * Ensure user with password_change_required is redirected to change-password page from dashboard.
     */
    public function test_user_with_password_change_required_is_redirected_from_dashboard(): void
    {
        $this->seed(RoleSeeder::class);

        $user = User::factory()->create([
            'password_change_required' => true,
            'two_factor_confirmed_at' => now(),
        ]);

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertRedirect(route('settings.change-password'));
    }

    /**
     * Ensure user with password_change_required cannot access other protected settings pages.
     */
    public function test_user_with_password_change_required_is_redirected_from_security_page(): void
    {
        $this->seed(RoleSeeder::class);

        $user = User::factory()->create([
            'password_change_required' => true,
        ]);

        $response = $this->actingAs($user)->get(route('settings.security'));

        $response->assertRedirect(route('settings.change-password'));
    }

    /**
     * Ensure user can change password successfully with a new (different) password.
     */
    public function test_user_can_change_forced_password_successfully(): void
    {
        $this->seed(RoleSeeder::class);

        $oldPassword = 'OldPassword1';
        $user = User::factory()->create([
            'password_change_required' => true,
            'previous_password' => Hash::make($oldPassword),
        ]);

        $response = $this
            ->actingAs($user)
            ->from('/settings/change-password')
            ->post(route('settings.change-password.update'), [
                'password' => 'NewSecurePass2',
                'password_confirmation' => 'NewSecurePass2',
            ]);

        $user->refresh();

        $response->assertRedirect(route('dashboard'));
        $this->assertFalse($user->password_change_required);
        $this->assertNull($user->previous_password);
        $this->assertTrue(Hash::check('NewSecurePass2', $user->password));
    }

    /**
     * Ensure user cannot reuse the password they had before the reset.
     */
    public function test_user_cannot_reuse_previous_password_when_changing(): void
    {
        $this->seed(RoleSeeder::class);

        $oldPassword = 'OldPassword1';
        $user = User::factory()->create([
            'password_change_required' => true,
            'previous_password' => Hash::make($oldPassword),
        ]);

        $response = $this
            ->actingAs($user)
            ->from('/settings/change-password')
            ->post(route('settings.change-password.update'), [
                'password' => $oldPassword,
                'password_confirmation' => $oldPassword,
            ]);

        $user->refresh();

        $response
            ->assertRedirect('/settings/change-password')
            ->assertSessionHasErrors(['password']);

        // Flag must still be set
        $this->assertTrue($user->password_change_required);
    }

    /**
     * Ensure admin can reset a user's two-factor authentication.
     */
    public function test_admin_can_reset_user_two_factor_authentication(): void
    {
        [$admin, $targetUser] = $this->createAdminAndTargetUser();

        TrustedDevice::create([
            'user_id' => $targetUser->id,
            'device_fingerprint' => hash('sha256', 'device-a'),
            'token_hash' => hash('sha256', 'token-a'),
            'user_agent' => 'Mozilla/5.0',
            'last_used_at' => now(),
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this
            ->actingAs($admin)
            ->from('/admin/users')
            ->post(route('admin.users.reset-two-factor', $targetUser));

        $targetUser->refresh();

        $response
            ->assertRedirect('/admin/users')
            ->assertSessionHas('success');

        $this->assertNull($targetUser->two_factor_secret);
        $this->assertNull($targetUser->two_factor_recovery_codes);
        $this->assertNull($targetUser->two_factor_confirmed_at);
        $this->assertSame(0, $targetUser->trustedDevices()->count());
    }

    /**
     * Ensure viewing recovery codes returns a redirect with flash data.
     */
    public function test_user_can_view_recovery_codes_via_settings_route(): void
    {
        $user = User::factory()->create([
            'two_factor_secret' => encrypt('secret-key'),
            'two_factor_recovery_codes' => encrypt(json_encode(['code-1', 'code-2'])),
            'two_factor_confirmed_at' => now(),
        ]);

        $response = $this
            ->actingAs($user)
            ->from('/settings/security')
            ->get(route('settings.security.recovery-codes.show'));

        $response
            ->assertRedirect('/settings/security')
            ->assertSessionHas('info')
            ->assertSessionHas('two-factor-recovery-codes', ['code-1', 'code-2']);
    }

    /**
     * Ensure regenerating recovery codes redirects with a success flash message.
     */
    public function test_user_can_regenerate_recovery_codes_with_success_flash(): void
    {
        $user = User::factory()->create([
            'two_factor_secret' => encrypt('secret-key'),
            'two_factor_recovery_codes' => encrypt(json_encode(['code-1', 'code-2'])),
            'two_factor_confirmed_at' => now(),
        ]);

        $response = $this
            ->actingAs($user)
            ->from('/settings/security')
            ->post(route('settings.security.recovery-codes.regenerate'));

        $response
            ->assertRedirect('/settings/security')
            ->assertSessionHas('success')
            ->assertSessionHas('two-factor-recovery-codes');

        $this->assertNotSame(['code-1', 'code-2'], session('two-factor-recovery-codes'));
    }

    /**
     * Ensure authenticated users can update their password from the security page.
     */
    public function test_user_can_update_password_from_security_page(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $response = $this
            ->actingAs($user)
            ->from(route('settings.security'))
            ->post(route('settings.security.password.update'), [
                'current_password' => 'password',
                'password' => 'BaruSekali123',
                'password_confirmation' => 'BaruSekali123',
            ]);

        $user->refresh();

        $response
            ->assertRedirect(route('settings.security'))
            ->assertSessionHas('success');

        $this->assertTrue(Hash::check('BaruSekali123', $user->password));
    }

    public function test_user_can_update_email_from_security_page_and_receive_verification_email(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
        ]);

        $response = $this
            ->actingAs($user)
            ->from(route('settings.security'))
            ->post(route('settings.security.email.update'), [
                'current_password' => 'password',
                'email' => 'email.baru@example.test',
            ]);

        $user->refresh();

        $response
            ->assertRedirect(route('settings.security'))
            ->assertSessionHas('success');

        $this->assertSame('email.baru@example.test', $user->email);
        $this->assertNull($user->email_verified_at);

        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_admin_can_update_user_identity_and_trigger_reverification_when_email_changes(): void
    {
        Notification::fake();

        [$admin, $targetUser] = $this->createAdminAndTargetUser();
        $targetUser->forceFill([
            'email_verified_at' => now(),
        ])->save();

        $response = $this
            ->actingAs($admin)
            ->from(route('admin.users.index'))
            ->post(route('admin.users.update-identity', $targetUser), [
                'username' => 'user_baru_admin',
                'email' => 'user.baru.admin@example.test',
            ]);

        $targetUser->refresh();

        $response
            ->assertRedirect(route('admin.users.index'))
            ->assertSessionHas('success');

        $this->assertSame('user_baru_admin', $targetUser->username);
        $this->assertSame('user.baru.admin@example.test', $targetUser->email);
        $this->assertNull($targetUser->email_verified_at);

        Notification::assertSentTo($targetUser, VerifyEmail::class);
    }

    /**
     * Ensure the users page can filter with encrypted state sent via POST.
     */
    public function test_admin_can_filter_users_with_encrypted_post_state(): void
    {
        [$admin, $targetUser] = $this->createAdminAndTargetUser();
        $anotherUser = User::factory()->create();

        $state = app(EncryptedStateService::class)->encryptArray([
            'page' => 1,
            'user_id' => $targetUser->id,
        ]);

        $response = $this
            ->actingAs($admin)
            ->post(route('admin.users.index'), [
                'state' => $state,
            ]);

        $response
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Users/Index')
                ->where('users.total', 1)
                ->where('users.data.0.email', $targetUser->email)
                ->missing('users.data.1')
            );

        $this->assertNotSame($targetUser->id, $anotherUser->id);
    }

    /**
     * Ensure admin can toggle a user's admin role.
     */
    public function test_admin_can_toggle_user_admin_role(): void
    {
        [$admin, $targetUser] = $this->createAdminAndTargetUser();

        // Grant admin
        $response = $this
            ->actingAs($admin)
            ->from('/admin/users')
            ->post(route('admin.users.toggle-admin', $targetUser));

        $response
            ->assertRedirect('/admin/users')
            ->assertSessionHas('success');

        $this->assertTrue($targetUser->fresh()->isAdmin());

        // Revoke admin
        $response = $this
            ->actingAs($admin)
            ->from('/admin/users')
            ->post(route('admin.users.toggle-admin', $targetUser));

        $response
            ->assertRedirect('/admin/users')
            ->assertSessionHas('success');

        $this->assertFalse($targetUser->fresh()->isAdmin());
    }

    /**
     * Ensure admin cannot change their own role.
     */
    public function test_admin_cannot_toggle_own_role(): void
    {
        [$admin] = $this->createAdminAndTargetUser();

        $response = $this
            ->actingAs($admin)
            ->from('/admin/users')
            ->post(route('admin.users.toggle-admin', $admin));

        $response
            ->assertRedirect('/admin/users')
            ->assertSessionHas('error');

        $this->assertTrue($admin->fresh()->isAdmin());
    }

    /**
     * Ensure the users index returns paginated data.
     */
    public function test_admin_users_index_returns_paginated_data(): void
    {
        [$admin] = $this->createAdminAndTargetUser();

        $response = $this
            ->actingAs($admin)
            ->get(route('admin.users.index'));

        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Users/Index')
            ->has('users.data')
            ->has('users.total')
            ->has('users.current_page'),
        );
    }

    public function test_admin_can_export_users_as_excel(): void
    {
        [$admin, $targetUser] = $this->createAdminAndTargetUser();

        $response = $this
            ->actingAs($admin)
            ->get(route('admin.users.export.excel'));

        $response->assertOk();
        $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $response->assertHeader('content-disposition', 'attachment; filename="pengguna-sso.xlsx"');
        $this->assertStringStartsWith('PK', $response->getContent());
        $this->assertNotEmpty($response->getContent());
    }

    public function test_admin_user_export_is_sorted_alphabetically(): void
    {
        $this->seed(RoleSeeder::class);

        $admin = User::factory()->create([
            'name' => 'MMM Admin',
            'email_verified_at' => now(),
            'two_factor_confirmed_at' => now(),
        ]);
        $admin->roles()->attach(Role::where('name', 'admin')->value('id'));

        User::factory()->create([
            'name' => 'ZZZ User',
            'username' => 'zzz_user',
            'email' => 'zzz@example.test',
        ]);

        User::factory()->create([
            'name' => 'AAA User',
            'username' => 'aaa_user',
            'email' => 'aaa@example.test',
        ]);

        $response = $this
            ->actingAs($admin)
            ->get(route('admin.users.export.excel'));

        $response->assertOk();

        $tempFile = tempnam(sys_get_temp_dir(), 'users-export-');
        if ($tempFile === false) {
            $this->fail('Gagal membuat temporary file untuk validasi XLSX.');
        }

        file_put_contents($tempFile, $response->getContent());

        $spreadsheet = IOFactory::load($tempFile);
        $sheet = $spreadsheet->getActiveSheet();

        $exportedNames = [
            (string) $sheet->getCell('B2')->getValue(),
            (string) $sheet->getCell('B3')->getValue(),
            (string) $sheet->getCell('B4')->getValue(),
        ];

        $spreadsheet->disconnectWorksheets();
        unset($spreadsheet);
        @unlink($tempFile);

        $this->assertSame(['AAA User', 'MMM Admin', 'ZZZ User'], $exportedNames);
    }

    public function test_admin_can_export_users_as_pdf(): void
    {
        [$admin, $targetUser] = $this->createAdminAndTargetUser();

        $response = $this
            ->actingAs($admin)
            ->get(route('admin.users.export.pdf'));

        $response->assertOk();
        $response->assertHeader('content-type', 'application/pdf');
        $response->assertHeader('content-disposition', 'attachment; filename="pengguna-sso.pdf"');

        $this->assertStringStartsWith('%PDF', $response->getContent());
        $this->assertNotEmpty($response->getContent());
    }

    /**
     * @return array{0: User, 1: User}
     */
    private function createAdminAndTargetUser(): array
    {
        $this->seed(RoleSeeder::class);

        $admin = User::factory()->create();
        $admin->forceFill([
            'two_factor_confirmed_at' => now(),
        ])->save();
        $admin->roles()->attach(Role::where('name', 'admin')->value('id'));

        $targetUser = User::factory()->create([
            'two_factor_secret' => encrypt('secret-key'),
            'two_factor_recovery_codes' => encrypt(json_encode(['code-1', 'code-2'])),
            'two_factor_confirmed_at' => now(),
        ]);
        $targetUser->roles()->attach(Role::where('name', 'user')->value('id'));

        return [$admin, $targetUser];
    }
}
