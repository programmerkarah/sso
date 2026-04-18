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

class ApplicationCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_regular_user_can_view_application_catalog_with_public_fields_only(): void
    {
        $this->seed(RoleSeeder::class);

        $user = User::factory()->create([
            'two_factor_confirmed_at' => now(),
        ]);
        $user->roles()->attach(Role::where('name', 'user')->value('id'));

        Application::create([
            'name' => 'Aplikasi Aktif',
            'slug' => 'aplikasi-aktif',
            'description' => 'Deskripsi publik aplikasi aktif',
            'domain' => 'aktif.example.test',
            'callback_url' => 'https://rahasia.example.test/callback-aktif',
            'logo_url' => 'https://aktif.example.test/logo.png',
            'oauth_client_id' => 'client-aktif',
            'oauth_client_secret' => 'rahasia-aktif',
            'is_active' => true,
        ]);

        Application::create([
            'name' => 'Aplikasi Nonaktif',
            'slug' => 'aplikasi-nonaktif',
            'description' => 'Tidak boleh tampil',
            'domain' => 'nonaktif.example.test',
            'callback_url' => 'https://rahasia.example.test/callback-nonaktif',
            'logo_url' => null,
            'oauth_client_id' => 'client-nonaktif',
            'oauth_client_secret' => 'rahasia-nonaktif',
            'is_active' => false,
        ]);

        $response = $this
            ->actingAs($user)
            ->get(route('applications.index'));

        $response
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Applications/Index')
                ->has('applications', 1)
                ->where('applications.0.name', 'Aplikasi Aktif')
                ->where('applications.0.description', 'Deskripsi publik aplikasi aktif')
                ->where('applications.0.landing_url', 'https://aktif.example.test')
                ->where('applications.0.launch_url', 'https://rahasia.example.test/auth/sso/redirect')
                ->where('applications.0.logo_url', 'https://aktif.example.test/logo.png')
            );

        $response->assertDontSee('callback-aktif');
        $response->assertDontSee('rahasia-aktif');
        $response->assertDontSee('Aplikasi Nonaktif');
    }

    public function test_regular_user_only_sees_applications_eligible_for_their_organization(): void
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

        Application::create([
            'name' => 'Aplikasi Umum',
            'slug' => 'aplikasi-umum',
            'description' => 'Bisa diakses semua organisasi.',
            'domain' => 'umum.example.test',
            'callback_url' => 'https://umum.example.test/auth/callback',
            'logo_url' => null,
            'oauth_client_id' => 'client-umum',
            'oauth_client_secret' => 'rahasia-umum',
            'is_active' => true,
            'allowed_organization_types' => null,
        ]);

        Application::create([
            'name' => 'Aplikasi Internal',
            'slug' => 'aplikasi-internal',
            'description' => 'Hanya untuk internal.',
            'domain' => 'internal.example.test',
            'callback_url' => 'https://internal.example.test/auth/callback',
            'logo_url' => null,
            'oauth_client_id' => 'client-internal',
            'oauth_client_secret' => 'rahasia-internal',
            'is_active' => true,
            'allowed_organization_types' => ['internal'],
        ]);

        Application::create([
            'name' => 'Aplikasi Vendor',
            'slug' => 'aplikasi-vendor',
            'description' => 'Tidak boleh tampil.',
            'domain' => 'vendor.example.test',
            'callback_url' => 'https://vendor.example.test/auth/callback',
            'logo_url' => null,
            'oauth_client_id' => 'client-vendor',
            'oauth_client_secret' => 'rahasia-vendor',
            'is_active' => true,
            'allowed_organization_types' => ['vendor'],
        ]);

        $response = $this
            ->actingAs($user)
            ->get(route('applications.index'));

        $response
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Applications/Index')
                ->has('applications', 2)
                ->where('applications.0.name', 'Aplikasi Internal')
                ->where('applications.1.name', 'Aplikasi Umum')
            );

        $response->assertDontSee('Aplikasi Vendor');
    }
}
