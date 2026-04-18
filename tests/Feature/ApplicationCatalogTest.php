<?php

namespace Tests\Feature;

use App\Models\Application;
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
                ->where('applications.0.logo_url', 'https://aktif.example.test/logo.png')
            );

        $response->assertDontSee('callback-aktif');
        $response->assertDontSee('rahasia-aktif');
        $response->assertDontSee('Aplikasi Nonaktif');
    }
}
