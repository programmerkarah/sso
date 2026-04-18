<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\Organization;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardPrivilegesTest extends TestCase
{
    use RefreshDatabase;

    public function test_regular_user_receives_non_admin_privileges_in_dashboard_props(): void
    {
        $this->seed(RoleSeeder::class);

        $user = User::factory()->create();
        $user->forceFill([
            'two_factor_confirmed_at' => now(),
        ])->save();
        $user->roles()->attach(Role::where('name', 'user')->value('id'));

        $response = $this->actingAs($user)->get('/dashboard');

        $response
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('auth.user.isAdmin', false)
                ->where('auth.can.manageApplications', false)
                ->where('availableApplications', [])
            );
    }

    public function test_regular_user_dashboard_only_receives_applications_allowed_for_their_organization(): void
    {
        $this->seed(RoleSeeder::class);

        $organization = Organization::query()->create([
            'name' => 'Internal',
            'slug' => 'internal',
            'type' => 'internal',
            'is_active' => true,
        ]);

        $user = User::factory()->create([
            'organization_id' => $organization->id,
            'two_factor_confirmed_at' => now(),
        ]);
        $user->roles()->attach(Role::where('name', 'user')->value('id'));

        Application::query()->create([
            'name' => 'Aplikasi Umum',
            'slug' => 'aplikasi-umum',
            'description' => 'Terbuka untuk semua organisasi.',
            'domain' => 'umum.example.test',
            'callback_url' => 'https://umum.example.test/auth/callback',
            'logo_url' => null,
            'oauth_client_id' => 'client-umum',
            'oauth_client_secret' => 'secret-umum',
            'is_active' => true,
            'allowed_organization_types' => [],
        ]);

        Application::query()->create([
            'name' => 'Aplikasi Internal',
            'slug' => 'aplikasi-internal',
            'description' => 'Hanya untuk internal.',
            'domain' => 'internal.example.test',
            'callback_url' => 'https://internal.example.test/auth/callback',
            'logo_url' => null,
            'oauth_client_id' => 'client-internal',
            'oauth_client_secret' => 'secret-internal',
            'is_active' => true,
            'allowed_organization_types' => ['internal'],
        ]);

        Application::query()->create([
            'name' => 'Aplikasi Vendor',
            'slug' => 'aplikasi-vendor',
            'description' => 'Tidak boleh tampil.',
            'domain' => 'vendor.example.test',
            'callback_url' => 'https://vendor.example.test/auth/callback',
            'logo_url' => null,
            'oauth_client_id' => 'client-vendor',
            'oauth_client_secret' => 'secret-vendor',
            'is_active' => true,
            'allowed_organization_types' => ['vendor'],
        ]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('applicationsCount', 2)
                ->where('organizationType', 'internal')
                ->where('availableApplications.0.name', 'Aplikasi Internal')
                ->where('availableApplications.1.name', 'Aplikasi Umum')
            );

        $response->assertDontSee('Aplikasi Vendor');
    }

    public function test_admin_receives_application_management_privileges_in_dashboard_props(): void
    {
        $this->seed(RoleSeeder::class);

        $user = User::factory()->create();
        $user->forceFill([
            'two_factor_confirmed_at' => now(),
        ])->save();
        $user->roles()->attach(Role::where('name', 'admin')->value('id'));

        $response = $this->actingAs($user)->get('/dashboard');

        $response
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('auth.user.isAdmin', true)
                ->where('auth.can.manageApplications', true)
            );
    }

    public function test_admin_dashboard_receives_pending_verification_users_list(): void
    {
        $this->seed(RoleSeeder::class);

        $admin = User::factory()->create();
        $admin->forceFill([
            'two_factor_confirmed_at' => now(),
        ])->save();
        $admin->roles()->attach(Role::where('name', 'admin')->value('id'));

        User::factory()->create([
            'name' => 'Pending Approval',
            'username' => 'pending_approval',
            'email' => 'pending.approval@example.test',
            'admin_verified_at' => null,
            'admin_verified_by' => null,
        ]);

        $response = $this->actingAs($admin)->get('/dashboard');

        $response
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('pendingVerificationUsers.0.username', 'pending_approval')
            );
    }
}
