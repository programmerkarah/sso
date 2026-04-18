<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Application;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Passport\Passport;
use Tests\TestCase;

class PassportClientAuthorizationSkipTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    public function test_registered_active_application_client_skips_authorization_prompt(): void
    {
        $client = Passport::client()->forceFill([
            'id' => 'd3544f8e-87ea-4f1c-95fa-a67f168ec8ac',
            'name' => 'SIMANTIK',
            'secret' => 'secret-value',
            'redirect_uris' => ['http://localhost:8001/auth/sso/callback'],
            'grant_types' => ['authorization_code'],
            'revoked' => false,
        ]);
        $client->save();

        Application::query()->create([
            'name' => 'SIMANTIK',
            'slug' => 'simantik',
            'description' => 'Aplikasi persediaan',
            'domain' => 'localhost',
            'callback_url' => 'http://localhost:8001/auth/sso/callback',
            'logo_url' => null,
            'is_active' => true,
            'oauth_client_id' => $client->getKey(),
            'oauth_client_secret' => 'secret-value',
        ]);

        $user = User::factory()->create();

        $this->assertTrue($client->fresh()->skipsAuthorization($user, []));
    }

    public function test_unregistered_or_inactive_client_does_not_skip_authorization_prompt(): void
    {
        $activeClient = Passport::client()->forceFill([
            'id' => 'dba57f95-95f3-48e3-ae66-8e8ff4369c8a',
            'name' => 'Aplikasi Nonaktif',
            'secret' => 'secret-value-2',
            'redirect_uris' => ['http://localhost:8001/auth/sso/callback'],
            'grant_types' => ['authorization_code'],
            'revoked' => false,
        ]);
        $activeClient->save();

        Application::query()->create([
            'name' => 'Aplikasi Nonaktif',
            'slug' => 'aplikasi-nonaktif',
            'description' => 'Aplikasi nonaktif',
            'domain' => 'localhost',
            'callback_url' => 'http://localhost:8001/auth/sso/callback',
            'logo_url' => null,
            'is_active' => false,
            'oauth_client_id' => $activeClient->getKey(),
            'oauth_client_secret' => 'secret-value-2',
        ]);

        $unregisteredClient = Passport::client()->forceFill([
            'id' => '1f061dac-5308-4db0-a3e5-bca7223d3346',
            'name' => 'Tidak Terdaftar',
            'secret' => 'secret-value-3',
            'redirect_uris' => ['http://localhost:8001/auth/sso/callback'],
            'grant_types' => ['authorization_code'],
            'revoked' => false,
        ]);
        $unregisteredClient->save();

        $user = User::factory()->create();

        $this->assertFalse($activeClient->fresh()->skipsAuthorization($user, []));
        $this->assertFalse($unregisteredClient->fresh()->skipsAuthorization($user, []));
    }
}
