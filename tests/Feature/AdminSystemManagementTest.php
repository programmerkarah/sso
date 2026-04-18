<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Role;
use App\Models\User;
use App\Services\EncryptedStateService;
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

        ActivityLog::query()->create([
            'user_id' => $admin->id,
            'event' => 'test.event',
            'category' => 'testing',
            'status' => 'warning',
            'description' => 'Log pengujian status',
            'occurred_at' => now(),
        ]);

        $response = $this
            ->actingAs($admin)
            ->get(route('admin.system.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/System/Index')
            ->has('logs.data')
            ->where('logs.data.0.status', 'warning')
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

    public function test_admin_can_filter_system_logs_using_encrypted_state_token(): void
    {
        $this->seed(RoleSeeder::class);

        $admin = User::factory()->create([
            'email_verified_at' => now(),
            'two_factor_confirmed_at' => now(),
        ]);
        $admin->roles()->attach(Role::where('name', 'admin')->value('id'));

        ActivityLog::query()->create([
            'user_id' => $admin->id,
            'event' => 'system.filtered',
            'category' => 'security',
            'status' => 'success',
            'description' => 'Log yang harus tampil.',
            'occurred_at' => now(),
        ]);

        ActivityLog::query()->create([
            'user_id' => $admin->id,
            'event' => 'system.hidden',
            'category' => 'backup',
            'status' => 'warning',
            'description' => 'Log yang harus tersembunyi.',
            'occurred_at' => now()->subMinute(),
        ]);

        $state = app(EncryptedStateService::class)->encryptArray([
            'page' => 1,
            'status' => 'success',
            'category' => 'security',
        ]);

        $response = $this
            ->actingAs($admin)
            ->get(route('admin.system.index', ['state' => $state]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/System/Index')
            ->where('filters.status', 'success')
            ->where('filters.category', 'security')
            ->where('logs.total', 1)
            ->where('logs.data.0.event', 'system.filtered')
            ->has('logs.links')
            ->where('logs.links.0.active', true),
        );
    }
}
