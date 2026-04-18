<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminSystemManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_open_system_page(): void
    {
        $this->seed(RoleSeeder::class);

        $admin = User::factory()->create([
            'email_verified_at' => now(),
            'two_factor_confirmed_at' => now(),
        ]);
        $admin->roles()->attach(Role::where('name', 'admin')->value('id'));

        $response = $this
            ->actingAs($admin)
            ->get(route('admin.system.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/System/Index')
            ->has('logs.data')
            ->has('database')
            ->has('server')
            ->has('backups'),
        );
    }

    public function test_non_admin_is_redirected_to_dashboard_when_no_previous_page(): void
    {
        $this->seed(RoleSeeder::class);

        $user = User::factory()->create([
            'email_verified_at' => now(),
            'two_factor_confirmed_at' => now(),
        ]);
        $user->roles()->attach(Role::where('name', 'user')->value('id'));

        $response = $this
            ->actingAs($user)
            ->get(route('admin.system.index'));

        $response
            ->assertRedirect(route('dashboard'))
            ->assertSessionHas('error', 'Anda tidak memiliki akses ke halaman tersebut.');
    }

    public function test_non_admin_is_redirected_to_previous_page_when_available(): void
    {
        $this->seed(RoleSeeder::class);

        $user = User::factory()->create([
            'email_verified_at' => now(),
            'two_factor_confirmed_at' => now(),
        ]);
        $user->roles()->attach(Role::where('name', 'user')->value('id'));

        $response = $this
            ->actingAs($user)
            ->from(route('settings.security'))
            ->get(route('admin.system.index'));

        $response
            ->assertRedirect(route('settings.security'))
            ->assertSessionHas('error', 'Anda tidak memiliki akses ke halaman tersebut.');
    }
}
