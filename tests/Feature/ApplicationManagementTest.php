<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\Role;
use App\Models\User;
use App\Services\EncryptedStateService;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Passport\Client;
use Tests\TestCase;

class ApplicationManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_application_show_route_uses_encrypted_key_and_shows_stored_secret(): void
    {
        $admin = $this->createAdmin();
        $application = $this->createManagedApplication('secret-for-frontend');

        $url = route('admin.applications.show', $application);

        // Route key must not contain the raw numeric ID
        $this->assertStringNotContainsString('/'.$application->id.'/', $url.'/');
        $this->assertStringNotContainsString('/'.$application->id, rtrim($url, '/'));

        $response = $this->actingAs($admin)->get($url);

        $response
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Applications/Show')
                ->has('application.route_key')
                ->where('application.oauth_client.secret', 'secret-for-frontend')
            );
    }

    public function test_admin_can_paginate_applications_with_encrypted_post_state(): void
    {
        $admin = $this->createAdmin();

        foreach (range(1, 15) as $index) {
            $this->createManagedApplication('secret-'.$index, 'App '.$index);
        }

        $state = app(EncryptedStateService::class)->encryptArray([
            'page' => 2,
        ]);

        $response = $this
            ->actingAs($admin)
            ->post(route('admin.applications.navigate'), [
                'state' => $state,
            ]);

        $response
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Applications/Index')
                ->where('applications.current_page', 2)
                ->where('applications.total', 15)
            );
    }

    public function test_admin_can_refresh_application_secret(): void
    {
        $admin = $this->createAdmin();
        $application = $this->createManagedApplication('initial-secret');

        $refreshUrl = route('admin.applications.refresh-secret', $application);

        $response = $this
            ->actingAs($admin)
            ->from(route('admin.applications.show', $application))
            ->post($refreshUrl);

        $application->refresh();

        // Redirect must be to the show page (accepts any encrypted key for same application)
        $response
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertNotNull($application->oauth_client_secret);
        $this->assertNotSame('initial-secret', $application->oauth_client_secret);
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

    private function createManagedApplication(string $plainSecret, string $name = 'Portal Layanan'): Application
    {
        $client = Client::create([
            'id' => (string) fake()->uuid(),
            'owner_type' => null,
            'owner_id' => null,
            'name' => $name,
            'secret' => $plainSecret,
            'provider' => null,
            'redirect_uris' => ['https://example.test/callback'],
            'grant_types' => ['authorization_code'],
            'revoked' => false,
        ]);

        return Application::create([
            'name' => $name,
            'slug' => fake()->slug(),
            'description' => 'Aplikasi pengujian',
            'domain' => 'example.test',
            'callback_url' => 'https://example.test/callback',
            'logo_url' => null,
            'oauth_client_id' => $client->getKey(),
            'oauth_client_secret' => $plainSecret,
            'is_active' => true,
        ]);
    }
}
