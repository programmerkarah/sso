<?php

namespace Tests\Feature;

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
            );
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
}
