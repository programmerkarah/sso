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

class OrganizationManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_see_eligible_applications_for_each_organization(): void
    {
        $admin = $this->createAdmin();

        $organization = Organization::query()->create([
            'name' => 'Internal',
            'slug' => 'internal',
            'type' => 'internal',
            'description' => 'Pengguna internal',
            'is_active' => true,
        ]);

        Application::query()->create([
            'name' => 'Aplikasi Umum',
            'slug' => 'aplikasi-umum',
            'description' => 'Bisa diakses semua organisasi.',
            'domain' => 'umum.example.test',
            'callback_url' => 'https://umum.example.test/auth/callback',
            'logo_url' => null,
            'is_active' => true,
            'allowed_organization_types' => [],
        ]);

        Application::query()->create([
            'name' => 'Aplikasi Internal',
            'slug' => 'aplikasi-internal',
            'description' => 'Hanya internal.',
            'domain' => 'internal.example.test',
            'callback_url' => 'https://internal.example.test/auth/callback',
            'logo_url' => null,
            'is_active' => true,
            'allowed_organization_types' => ['internal'],
        ]);

        Application::query()->create([
            'name' => 'Aplikasi Vendor',
            'slug' => 'aplikasi-vendor',
            'description' => 'Tidak cocok untuk internal.',
            'domain' => 'vendor.example.test',
            'callback_url' => 'https://vendor.example.test/auth/callback',
            'logo_url' => null,
            'is_active' => true,
            'allowed_organization_types' => ['vendor'],
        ]);

        $response = $this
            ->actingAs($admin)
            ->get(route('admin.organizations.index'));

        $response
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Organizations/Index')
                ->where('organizations.0.id', $organization->id)
                ->where('organizations.0.eligible_applications_count', 2)
                ->where('organizations.0.eligible_applications.0.name', 'Aplikasi Internal')
                ->where('organizations.0.eligible_applications.1.name', 'Aplikasi Umum')
            );
    }

    private function createAdmin(): User
    {
        $this->seed(RoleSeeder::class);

        $admin = User::factory()->create([
            'email_verified_at' => now(),
            'two_factor_confirmed_at' => now(),
        ]);

        $admin->roles()->attach(Role::where('name', 'admin')->value('id'));

        return $admin;
    }
}
