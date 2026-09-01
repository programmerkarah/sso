<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Application;
use App\Models\Organization;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Passport\Client;
use Laravel\Passport\Contracts\AuthorizationViewResponse;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Tests\TestCase;

class PassportAuthorizationViewBindingTest extends TestCase
{
    use RefreshDatabase;

    public function test_passport_authorization_view_response_contract_is_bound(): void
    {
        $this->assertTrue($this->app->bound(AuthorizationViewResponse::class));
        $this->assertInstanceOf(AuthorizationViewResponse::class, $this->app->make(AuthorizationViewResponse::class));
    }

    public function test_oauth_authorize_route_does_not_fail_with_binding_resolution_exception(): void
    {
        try {
            $response = $this->get('/oauth/authorize');

            $this->assertNotSame(500, $response->status());
        } catch (\Throwable $exception) {
            if ($exception instanceof HttpExceptionInterface) {
                $this->assertNotSame(500, $exception->getStatusCode());

                return;
            }

            $this->assertStringNotContainsString(
                AuthorizationViewResponse::class,
                $exception->getMessage()
            );
        }
    }

    public function test_user_authorizing_same_oauth_application_revokes_previous_active_tokens(): void
    {
        $this->seed(RoleSeeder::class);

        $organization = Organization::query()->create([
            'name' => 'Internal',
            'slug' => 'internal-revoke-old-token',
            'type' => 'internal',
            'is_active' => true,
        ]);

        $user = User::factory()->create([
            'organization_id' => $organization->id,
            'admin_verified_at' => now(),
            'email_verified_at' => now(),
            'two_factor_confirmed_at' => now(),
        ]);
        $user->roles()->attach(Role::where('name', 'user')->value('id'));

        Application::query()->create([
            'name' => 'Aplikasi Internal',
            'slug' => 'aplikasi-internal-revoke',
            'description' => 'Hanya internal.',
            'domain' => 'internal-revoke.example.test',
            'callback_url' => 'https://internal-revoke.example.test/auth/callback',
            'logo_url' => null,
            'oauth_client_id' => 'client-internal-revoke',
            'oauth_client_secret' => 'secret-internal-revoke',
            'is_active' => true,
            'allowed_organization_types' => ['internal'],
        ]);

        $passportClient = Client::create([
            'id' => 'client-internal-revoke',
            'owner_type' => null,
            'owner_id' => null,
            'name' => 'Aplikasi Internal',
            'secret' => 'secret-internal-revoke',
            'provider' => null,
            'redirect_uris' => ['https://internal-revoke.example.test/auth/callback'],
            'grant_types' => ['authorization_code'],
            'revoked' => false,
        ]);

        $oldTokenId = 'old-token-'.uniqid();
        $newerTokenId = 'new-token-'.uniqid();

        DB::table('oauth_access_tokens')->insert([
            [
                'id' => $oldTokenId,
                'user_id' => $user->id,
                'client_id' => $passportClient->id,
                'name' => 'Aplikasi Internal',
                'scopes' => '[]',
                'revoked' => false,
                'created_at' => now()->subDay(),
                'updated_at' => now()->subDay(),
                'expires_at' => now()->addDay(),
            ],
            [
                'id' => $newerTokenId,
                'user_id' => $user->id,
                'client_id' => $passportClient->id,
                'name' => 'Aplikasi Internal',
                'scopes' => '[]',
                'revoked' => false,
                'created_at' => now(),
                'updated_at' => now(),
                'expires_at' => now()->addDay(),
            ],
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/oauth/authorize?client_id='.$passportClient->id.'&redirect_uri='.urlencode('https://internal-revoke.example.test/auth/callback').'&response_type=code&state=oauth-state');

        $response->assertOk();

        $this->assertDatabaseHas('oauth_access_tokens', ['id' => $oldTokenId, 'revoked' => true]);
        $this->assertDatabaseHas('oauth_access_tokens', ['id' => $newerTokenId, 'revoked' => true]);
    }

    public function test_user_gets_flash_message_when_forcing_login_to_disallowed_application(): void
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
            'two_factor_secret' => encrypt('test-secret'),
            'two_factor_recovery_codes' => encrypt(json_encode(['code-1'])),
            'two_factor_confirmed_at' => now(),
        ]);
        $user->roles()->attach(Role::where('name', 'user')->value('id'));

        Application::query()->create([
            'name' => 'Aplikasi Vendor',
            'slug' => 'aplikasi-vendor',
            'description' => 'Hanya vendor.',
            'domain' => 'vendor.example.test',
            'callback_url' => 'https://vendor.example.test/auth/callback',
            'logo_url' => null,
            'oauth_client_id' => 'client-vendor',
            'oauth_client_secret' => 'secret-vendor',
            'is_active' => true,
            'allowed_organization_types' => ['vendor'],
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/oauth/authorize?client_id=client-vendor');

        $response
            ->assertRedirect(route('dashboard'))
            ->assertSessionHas('error', 'Akun Anda tidak memiliki akses ke aplikasi Aplikasi Vendor berdasarkan organisasi yang terdaftar.');
    }

    public function test_unverified_user_is_blocked_from_oauth_authorization_flow(): void
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
            'admin_verified_at' => null,
            'admin_verified_by' => null,
        ]);
        $user->roles()->attach(Role::where('name', 'user')->value('id'));

        Application::query()->create([
            'name' => 'Aplikasi Internal',
            'slug' => 'aplikasi-internal',
            'description' => 'Hanya internal.',
            'domain' => 'internal.example.test',
            'callback_url' => 'https://internal.example.test/auth/callback',
            'logo_url' => null,
            'oauth_client_id' => 'client-internal',
            'oauth_client_secret' => 'secret-internal',
            'is_active' => true,
            'allowed_organization_types' => ['internal'],
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/oauth/authorize?client_id=client-internal');

        $response
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('username');

        $this->assertGuest();

        $this->assertDatabaseHas('activity_logs', [
            'event' => 'oauth.login.request',
            'category' => 'oauth',
            'status' => 'success',
        ]);

        $oauthLog = ActivityLog::query()
            ->where('event', 'oauth.login.request')
            ->latest('id')
            ->first();

        $this->assertNotNull($oauthLog);
        $this->assertSame('client-internal', data_get($oauthLog?->metadata, 'oauth_client_id'));
        $this->assertSame('Aplikasi Internal', data_get($oauthLog?->metadata, 'application_name'));
    }

    public function test_user_with_unverified_email_is_blocked_from_oauth_authorization_flow(): void
    {
        $this->seed(RoleSeeder::class);

        $organization = Organization::query()->create([
            'name' => 'Internal',
            'slug' => 'internal-email-unverified',
            'type' => 'internal',
            'is_active' => true,
        ]);

        $user = User::factory()->unverified()->create([
            'organization_id' => $organization->id,
            'admin_verified_at' => now(),
            'two_factor_confirmed_at' => now(),
        ]);
        $user->roles()->attach(Role::where('name', 'user')->value('id'));

        Application::query()->create([
            'name' => 'Aplikasi Internal Email',
            'slug' => 'aplikasi-internal-email',
            'description' => 'Hanya internal.',
            'domain' => 'internal-email.example.test',
            'callback_url' => 'https://internal-email.example.test/auth/callback',
            'logo_url' => null,
            'oauth_client_id' => 'client-internal-email',
            'oauth_client_secret' => 'secret-internal-email',
            'is_active' => true,
            'allowed_organization_types' => ['internal'],
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/oauth/authorize?client_id=client-internal-email&redirect_uri=https%3A%2F%2Fapp.example.test%2Fcallback&state=oauth-state');

        $response->assertRedirect(route('verification.notice'));
        $response->assertSessionHasErrors('username');
        $this->assertStringNotContainsString('app.example.test', $response->headers->get('Location', ''));
    }

    public function test_user_without_confirmed_two_factor_is_blocked_from_oauth_authorization_flow(): void
    {
        $this->seed(RoleSeeder::class);

        $organization = Organization::query()->create([
            'name' => 'Internal',
            'slug' => 'internal-without-2fa',
            'type' => 'internal',
            'is_active' => true,
        ]);

        $user = User::factory()->create([
            'organization_id' => $organization->id,
            'admin_verified_at' => now(),
            'email_verified_at' => now(),
            'two_factor_confirmed_at' => null,
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
        ]);
        $user->roles()->attach(Role::where('name', 'user')->value('id'));

        Application::query()->create([
            'name' => 'Aplikasi Internal 2FA',
            'slug' => 'aplikasi-internal-2fa',
            'description' => 'Hanya internal.',
            'domain' => 'internal-2fa.example.test',
            'callback_url' => 'https://internal-2fa.example.test/auth/callback',
            'logo_url' => null,
            'oauth_client_id' => 'client-internal-2fa',
            'oauth_client_secret' => 'secret-internal-2fa',
            'is_active' => true,
            'allowed_organization_types' => ['internal'],
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/oauth/authorize?client_id=client-internal-2fa&redirect_uri=https%3A%2F%2Fapp.example.test%2Fcallback&state=oauth-state');

        $response->assertRedirect(route('settings.security'));
        $response->assertSessionHasErrors('username');
        $this->assertStringNotContainsString('app.example.test', $response->headers->get('Location', ''));
    }
}
