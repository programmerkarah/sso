<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Organization;
use App\Models\Role;
use App\Models\TrustedDevice;
use App\Models\User;
use App\Notifications\PasswordResetByAdmin;
use App\Services\EncryptedStateService;
use Database\Seeders\RoleSeeder;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\Channels\MailChannel;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Passport\Client;
use PhpOffice\PhpSpreadsheet\IOFactory;
use RuntimeException;
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

    public function test_api_user_profile_returns_portable_two_factor_data_and_organization(): void
    {
        $organization = Organization::query()->create([
            'name' => 'Internal',
            'slug' => 'internal',
            'type' => 'internal',
            'is_active' => true,
        ]);

        $user = User::factory()->create([
            'organization_id' => $organization->id,
            'two_factor_secret' => encrypt('shared-secret'),
            'two_factor_recovery_codes' => encrypt(json_encode(['code-1', 'code-2'])),
            'two_factor_confirmed_at' => now(),
        ]);

        $response = $this
            ->actingAs($user, 'api')
            ->getJson('/api/user');

        $response
            ->assertOk()
            ->assertJson([
                'id' => $user->id,
                'organization_type' => 'internal',
                'two_factor_enabled' => true,
                'two_factor' => [
                    'secret' => 'shared-secret',
                    'recovery_codes' => ['code-1', 'code-2'],
                ],
                'organization' => [
                    'id' => $organization->id,
                    'name' => 'Internal',
                    'slug' => 'internal',
                    'type' => 'internal',
                ],
            ]);
    }

    public function test_api_user_profile_rejects_user_with_unverified_email(): void
    {
        $user = User::factory()->unverified()->create([
            'two_factor_secret' => encrypt('shared-secret'),
            'two_factor_recovery_codes' => encrypt(json_encode(['code-1', 'code-2'])),
            'two_factor_confirmed_at' => now(),
        ]);

        $response = $this
            ->actingAs($user, 'api')
            ->getJson('/api/user');

        $response
            ->assertForbidden()
            ->assertSeeText('Email akun belum terverifikasi.');
    }

    public function test_api_user_profile_rejects_user_without_confirmed_two_factor(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ]);

        $response = $this
            ->actingAs($user, 'api')
            ->getJson('/api/user');

        $response
            ->assertForbidden()
            ->assertSeeText('Autentikasi dua faktor (2FA) belum aktif.');
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

        $this->assertDatabaseHas('activity_logs', [
            'event' => 'admin.users.password.reset',
            'category' => 'user_management',
            'status' => 'success',
            'user_id' => $admin->id,
        ]);
    }

    public function test_reset_password_is_rolled_back_when_notification_fails(): void
    {
        [$admin, $targetUser] = $this->createAdminAndTargetUser();

        $previousPassword = $targetUser->password;
        $previousStoredPreviousPassword = $targetUser->previous_password;

        $this->mock(MailChannel::class, function ($mock): void {
            $mock->shouldReceive('send')->andThrow(new RuntimeException('SMTP unavailable'));
        });

        $response = $this
            ->actingAs($admin)
            ->from('/admin/users')
            ->post(route('admin.users.reset-password', $targetUser));

        $targetUser->refresh();

        $response
            ->assertRedirect('/admin/users')
            ->assertSessionHas('error');

        $this->assertSame($previousPassword, $targetUser->password);
        $this->assertFalse((bool) $targetUser->password_change_required);
        $this->assertSame($previousStoredPreviousPassword, $targetUser->previous_password);

        $failedLog = ActivityLog::query()
            ->where('event', 'admin.users.password.reset.failed')
            ->latest('id')
            ->first();

        $this->assertNotNull($failedLog);
        $this->assertSame('error', $failedLog->status);
        $this->assertSame($admin->id, $failedLog->user_id);
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

        $oldPassword = 'OldPassword1!';
        $user = User::factory()->create([
            'password_change_required' => true,
            'previous_password' => Hash::make($oldPassword),
        ]);

        $response = $this
            ->actingAs($user)
            ->from('/settings/change-password')
            ->post(route('settings.change-password.update'), [
                'password' => 'NewSecurePass2!',
                'password_confirmation' => 'NewSecurePass2!',
            ]);

        $user->refresh();

        $response->assertRedirect(route('dashboard'));
        $this->assertFalse($user->password_change_required);
        $this->assertNull($user->previous_password);
        $this->assertTrue(Hash::check('NewSecurePass2!', $user->password));
    }

    /**
     * Ensure user cannot reuse the password they had before the reset.
     */
    public function test_user_cannot_reuse_previous_password_when_changing(): void
    {
        $this->seed(RoleSeeder::class);

        $oldPassword = 'OldPassword1!';
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
                'password' => 'BaruSekali123!',
                'password_confirmation' => 'BaruSekali123!',
            ]);

        $user->refresh();

        $response
            ->assertRedirect(route('settings.security'))
            ->assertSessionHas('success');

        $this->assertTrue(Hash::check('BaruSekali123!', $user->password));
    }

    public function test_admin_can_soft_delete_user_and_cleanup_security_artifacts(): void
    {
        [$admin, $targetUser] = $this->createAdminAndTargetUser();

        DB::table('sessions')->insert([
            'id' => 'sess-'.$targetUser->id,
            'user_id' => $targetUser->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'PHPUnit',
            'payload' => 'payload',
            'last_activity' => time(),
        ]);

        TrustedDevice::query()->create([
            'user_id' => $targetUser->id,
            'device_fingerprint' => hash('sha256', 'stable-device'),
            'token_hash' => hash('sha256', 'stable-token'),
            'user_agent' => 'Mozilla/5.0',
            'last_used_at' => now(),
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this
            ->actingAs($admin)
            ->from(route('admin.users.index'))
            ->delete(route('admin.users.delete', $targetUser));

        $response
            ->assertRedirect(route('admin.users.index'))
            ->assertSessionHas('success');

        $this->assertSoftDeleted('users', ['id' => $targetUser->id]);
        $this->assertDatabaseMissing('sessions', ['user_id' => $targetUser->id]);
        $this->assertDatabaseMissing('trusted_devices', ['user_id' => $targetUser->id]);
    }

    public function test_admin_cannot_delete_own_account(): void
    {
        [$admin] = $this->createAdminAndTargetUser();

        $response = $this
            ->actingAs($admin)
            ->from(route('admin.users.index'))
            ->delete(route('admin.users.delete', $admin));

        $response
            ->assertRedirect(route('admin.users.index'))
            ->assertSessionHas('error');

        $this->assertDatabaseHas('users', ['id' => $admin->id]);
        $this->assertNull($admin->fresh()->deleted_at);
    }

    public function test_non_admin_cannot_delete_user_account(): void
    {
        User::factory()->create();
        $regularUser = User::factory()->create();
        $targetUser = User::factory()->create();

        $response = $this
            ->actingAs($regularUser)
            ->delete(route('admin.users.delete', $targetUser));

        $response->assertRedirect();
        $this->assertDatabaseHas('users', ['id' => $targetUser->id]);
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

    public function test_admin_session_page_does_not_default_to_active_user_until_selection_is_made(): void
    {
        $this->seed(RoleSeeder::class);

        $admin = User::factory()->create([
            'admin_verified_at' => now(),
            'email_verified_at' => now(),
            'two_factor_confirmed_at' => now(),
        ]);
        $admin->roles()->attach(Role::where('name', 'admin')->value('id'));

        $otherUser = User::factory()->create([
            'admin_verified_at' => now(),
            'email_verified_at' => now(),
            'two_factor_confirmed_at' => now(),
        ]);
        $otherUser->roles()->attach(Role::where('name', 'user')->value('id'));

        $response = $this
            ->actingAs($admin)
            ->get(route('settings.sessions'));

        $response
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Settings/Sessions')
                ->where('selectedUser', null)
                ->where('sessions', [])
                ->where('users.total', 2)
            );
    }

    public function test_session_page_rejects_user_id_query_parameter_as_unauthorized(): void
    {
        $this->seed(RoleSeeder::class);

        $admin = User::factory()->create([
            'admin_verified_at' => now(),
            'email_verified_at' => now(),
            'two_factor_confirmed_at' => now(),
        ]);
        $admin->roles()->attach(Role::where('name', 'admin')->value('id'));

        $targetUser = User::factory()->create([
            'admin_verified_at' => now(),
            'email_verified_at' => now(),
            'two_factor_confirmed_at' => now(),
        ]);
        $targetUser->roles()->attach(Role::where('name', 'user')->value('id'));

        $response = $this
            ->actingAs($admin)
            ->get(route('settings.sessions', ['user_id' => $targetUser->id]));

        $response
            ->assertUnauthorized();
    }

    public function test_user_is_logged_out_when_all_oauth_access_tokens_are_revoked(): void
    {
        $this->seed(RoleSeeder::class);

        $user = User::factory()->create([
            'admin_verified_at' => now(),
            'email_verified_at' => now(),
            'two_factor_confirmed_at' => now(),
        ]);

        $client = Client::create([
            'id' => (string) fake()->uuid(),
            'owner_type' => null,
            'owner_id' => null,
            'name' => 'Aplikasi Terblokir',
            'secret' => null,
            'provider' => null,
            'redirect_uris' => ['https://example.test/callback'],
            'grant_types' => ['authorization_code', 'refresh_token'],
            'revoked' => false,
        ]);

        DB::table('oauth_access_tokens')->insert([
            [
                'id' => 'blocked-token-'.uniqid(),
                'user_id' => $user->id,
                'client_id' => $client->id,
                'name' => 'Aplikasi Terblokir',
                'scopes' => '[]',
                'revoked' => true,
                'created_at' => now(),
                'updated_at' => now(),
                'expires_at' => now()->addDay(),
            ],
        ]);

        $response = $this
            ->actingAs($user)
            ->from(route('dashboard'))
            ->get(route('dashboard'));

        $response
            ->assertRedirect(route('login'))
            ->assertSessionHas('error');

        $this->assertFalse(Auth::check());
    }

    public function test_admin_can_revoke_another_users_session_and_oauth_access_from_session_management(): void
    {
        $this->seed(RoleSeeder::class);

        $admin = User::factory()->create([
            'admin_verified_at' => now(),
            'email_verified_at' => now(),
            'two_factor_confirmed_at' => now(),
        ]);
        $admin->roles()->attach(Role::where('name', 'admin')->value('id'));

        $targetUser = User::factory()->create([
            'admin_verified_at' => now(),
            'email_verified_at' => now(),
            'two_factor_confirmed_at' => now(),
        ]);
        $targetUser->roles()->attach(Role::where('name', 'user')->value('id'));

        $sessionId = 'session-target-'.uniqid();
        DB::table('sessions')->insert([
            [
                'id' => $sessionId,
                'user_id' => $targetUser->id,
                'ip_address' => '10.0.0.5',
                'user_agent' => 'Target Browser',
                'payload' => json_encode([]),
                'last_activity' => now()->timestamp,
            ],
        ]);

        $client = Client::create([
            'id' => (string) fake()->uuid(),
            'owner_type' => null,
            'owner_id' => null,
            'name' => 'Aplikasi Target',
            'secret' => null,
            'provider' => null,
            'redirect_uris' => ['https://example.test/callback'],
            'grant_types' => ['authorization_code', 'refresh_token'],
            'revoked' => false,
        ]);

        $tokenId = 'access-token-target-'.uniqid();
        DB::table('oauth_access_tokens')->insert([
            [
                'id' => $tokenId,
                'user_id' => $targetUser->id,
                'client_id' => $client->id,
                'name' => 'Aplikasi Target',
                'scopes' => '[]',
                'revoked' => false,
                'created_at' => now(),
                'updated_at' => now(),
                'expires_at' => now()->addDay(),
            ],
        ]);

        $response = $this
            ->actingAs($admin)
            ->post(route('settings.sessions.revoke', ['sessionId' => $sessionId]), [
                'user_id' => $targetUser->id,
            ]);

        $response->assertRedirect(route('settings.sessions'));
        $this->assertDatabaseMissing('sessions', ['id' => $sessionId]);

        $tokenResponse = $this
            ->actingAs($admin)
            ->post(route('settings.oauth.revoke', ['tokenId' => $tokenId]), [
                'user_id' => $targetUser->id,
            ]);

        $tokenResponse->assertRedirect(route('settings.sessions'));
        $this->assertDatabaseHas('oauth_access_tokens', ['id' => $tokenId, 'revoked' => true]);
    }

    public function test_user_can_view_their_active_sessions_and_revoke_an_oauth_client_access(): void
    {
        $this->seed(RoleSeeder::class);

        $user = User::factory()->create([
            'admin_verified_at' => now(),
            'email_verified_at' => now(),
            'two_factor_confirmed_at' => now(),
        ]);

        $currentSessionId = 'session-current-'.uniqid();
        session()->setId($currentSessionId);
        session()->save();
        $this->actingAs($user);
        $otherSessionId = 'session-other-'.uniqid();
        $currentTimestamp = now()->timestamp + 10;
        $otherTimestamp = now()->timestamp;

        DB::table('sessions')->insert([
            [
                'id' => $currentSessionId,
                'user_id' => $user->id,
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Current Browser',
                'payload' => json_encode([]),
                'last_activity' => $currentTimestamp,
            ],
            [
                'id' => $otherSessionId,
                'user_id' => $user->id,
                'ip_address' => '10.0.0.2',
                'user_agent' => 'Other Browser',
                'payload' => json_encode([]),
                'last_activity' => $otherTimestamp,
            ],
        ]);

        $client = Client::create([
            'id' => (string) fake()->uuid(),
            'owner_type' => null,
            'owner_id' => null,
            'name' => 'Aplikasi Terdaftar',
            'secret' => null,
            'provider' => null,
            'redirect_uris' => ['https://example.test/callback'],
            'grant_types' => ['authorization_code', 'refresh_token'],
            'revoked' => false,
        ]);

        $tokenId = 'access-token-'.uniqid();
        DB::table('oauth_access_tokens')->insert([
            [
                'id' => $tokenId,
                'user_id' => $user->id,
                'client_id' => $client->id,
                'name' => 'Aplikasi Terdaftar',
                'scopes' => '[]',
                'revoked' => false,
                'created_at' => now(),
                'updated_at' => now(),
                'expires_at' => now()->addDay(),
            ],
        ]);

        $response = $this
            ->actingAs($user)
            ->get(route('settings.sessions'));

        $response
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Settings/Sessions')
                ->where('selectedUser.id', $user->id)
                ->where('sessions.0.is_current', true)
                ->where('sessions.1.is_current', false)
                ->where('oauthApplications.0.client_name', 'Aplikasi Terdaftar')
            );

        $securityResponse = $this
            ->actingAs($user)
            ->getJson(route('admin.users.security', $user));

        $securityResponse
            ->assertOk()
            ->assertJsonPath('sessions.0.is_active', true)
            ->assertJsonPath('oauth_tokens.0.client_name', 'Aplikasi Terdaftar');

        $revokeResponse = $this
            ->actingAs($user)
            ->post(route('settings.sessions.revoke', ['sessionId' => $otherSessionId]), [
                'user_id' => $user->id,
            ]);

        $revokeResponse->assertRedirect(route('settings.sessions'));
        $this->assertDatabaseMissing('sessions', ['id' => $otherSessionId]);

        $tokenRevokeResponse = $this
            ->actingAs($user)
            ->post(route('settings.oauth.revoke', ['tokenId' => $tokenId]), [
                'user_id' => $user->id,
            ]);

        $tokenRevokeResponse->assertRedirect(route('settings.sessions'));
        $this->assertDatabaseHas('oauth_access_tokens', ['id' => $tokenId, 'revoked' => true]);
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

    public function test_admin_can_resend_verification_email_to_user(): void
    {
        Notification::fake();

        [$admin, $targetUser] = $this->createAdminAndTargetUser();
        $targetUser->forceFill([
            'email_verified_at' => null,
        ])->save();

        $response = $this
            ->actingAs($admin)
            ->from(route('admin.users.index'))
            ->post(route('admin.users.resend-verification-email', $targetUser));

        $response
            ->assertRedirect(route('admin.users.index'))
            ->assertSessionHas('success');

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

    public function test_admin_can_update_user_access_individually(): void
    {
        [$admin, $targetUser] = $this->createAdminAndTargetUser();

        $organization = Organization::create([
            'name' => 'Internal',
            'slug' => 'internal',
            'type' => 'internal',
            'is_active' => true,
        ]);

        $adminRoleId = (int) Role::where('name', 'admin')->value('id');
        $userRoleId = (int) Role::where('name', 'user')->value('id');

        $response = $this
            ->actingAs($admin)
            ->from('/admin/users')
            ->post(route('admin.users.update-access', $targetUser), [
                'organization_id' => $organization->id,
                'role_ids' => [$userRoleId, $adminRoleId],
            ]);

        $response
            ->assertRedirect('/admin/users')
            ->assertSessionHas('success');

        $targetUser->refresh();

        $this->assertSame($organization->id, $targetUser->organization_id);
        $this->assertEqualsCanonicalizing(
            [$userRoleId, $adminRoleId],
            $targetUser->roles()->pluck('roles.id')->all(),
        );
    }

    public function test_admin_can_update_user_access_in_batch(): void
    {
        [$admin, $firstTargetUser] = $this->createAdminAndTargetUser();
        $secondTargetUser = User::factory()->create();
        $secondTargetUser->roles()->attach(Role::where('name', 'user')->value('id'));

        $organization = Organization::create([
            'name' => 'Internal',
            'slug' => 'internal',
            'type' => 'internal',
            'is_active' => true,
        ]);

        $userRoleId = (int) Role::where('name', 'user')->value('id');

        $response = $this
            ->actingAs($admin)
            ->from('/admin/users')
            ->post(route('admin.users.batch-update-access'), [
                'user_ids' => [$firstTargetUser->id, $secondTargetUser->id],
                'organization_id' => $organization->id,
                'role_ids' => [$userRoleId],
            ]);

        $response
            ->assertRedirect('/admin/users')
            ->assertSessionHas('success');

        $this->assertSame($organization->id, $firstTargetUser->fresh()->organization_id);
        $this->assertSame($organization->id, $secondTargetUser->fresh()->organization_id);
        $this->assertSame([$userRoleId], $firstTargetUser->fresh()->roles()->pluck('roles.id')->all());
        $this->assertSame([$userRoleId], $secondTargetUser->fresh()->roles()->pluck('roles.id')->all());
    }

    public function test_admin_can_filter_only_pending_verification_users_with_encrypted_state(): void
    {
        [$admin] = $this->createAdminAndTargetUser();

        User::factory()->create([
            'name' => 'Pending User',
            'username' => 'pending_user',
            'email' => 'pending@example.test',
            'admin_verified_at' => null,
            'admin_verified_by' => null,
        ]);

        User::factory()->create([
            'name' => 'Verified User',
            'username' => 'verified_user',
            'email' => 'verified@example.test',
            'admin_verified_at' => now(),
            'admin_verified_by' => $admin->id,
        ]);

        $state = app(EncryptedStateService::class)->encryptArray([
            'page' => 1,
            'user_id' => null,
            'pending_only' => true,
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
                ->where('pendingOnlyActive', true)
                ->where('users.data.0.username', 'pending_user')
                ->missing('users.data.1')
            );
    }

    public function test_admin_can_toggle_user_admin_verification_status(): void
    {
        [$admin, $targetUser] = $this->createAdminAndTargetUser();

        $targetUser->forceFill([
            'admin_verified_at' => null,
            'admin_verified_by' => null,
        ])->save();

        $response = $this
            ->actingAs($admin)
            ->from('/admin/users')
            ->post(route('admin.users.toggle-admin-verification', $targetUser));

        $response
            ->assertRedirect('/admin/users')
            ->assertSessionHas('success');

        $targetUser->refresh();

        $this->assertNotNull($targetUser->admin_verified_at);
        $this->assertSame($admin->id, $targetUser->admin_verified_by);

        $response = $this
            ->actingAs($admin)
            ->from('/admin/users')
            ->post(route('admin.users.toggle-admin-verification', $targetUser));

        $response
            ->assertRedirect('/admin/users')
            ->assertSessionHas('success');

        $targetUser->refresh();

        $this->assertNull($targetUser->admin_verified_at);
        $this->assertNull($targetUser->admin_verified_by);
    }

    public function test_unverified_user_is_logged_out_when_accessing_protected_dashboard(): void
    {
        $this->seed(RoleSeeder::class);

        $user = User::factory()->create([
            'email_verified_at' => now(),
            'two_factor_confirmed_at' => now(),
            'admin_verified_at' => null,
            'admin_verified_by' => null,
        ]);
        $user->roles()->attach(Role::where('name', 'user')->value('id'));

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('username');

        $this->assertGuest();
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
