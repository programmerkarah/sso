<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\TrustedDevice;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
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
     * Ensure admin can reset a user's password and receive a temporary password flash.
     */
    public function test_admin_can_reset_user_password(): void
    {
        [$admin, $targetUser] = $this->createAdminAndTargetUser();

        $response = $this
            ->actingAs($admin)
            ->from('/admin/users')
            ->post(route('admin.users.reset-password', $targetUser));

        $targetUser->refresh();

        $response
            ->assertRedirect('/admin/users')
            ->assertSessionHas('success')
            ->assertSessionHas('temporaryPassword');

        $temporaryPassword = session('temporaryPassword');

        $this->assertTrue(Hash::check($temporaryPassword, $targetUser->password));
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
