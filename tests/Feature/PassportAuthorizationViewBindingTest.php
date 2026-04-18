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
            'event' => 'oauth.request',
            'category' => 'oauth',
            'status' => 'success',
        ]);

        $oauthLog = ActivityLog::query()
            ->where('event', 'oauth.request')
            ->latest('id')
            ->first();

        $this->assertNotNull($oauthLog);
        $this->assertSame('client-internal', data_get($oauthLog?->metadata, 'oauth_client_id'));
        $this->assertSame('Aplikasi Internal', data_get($oauthLog?->metadata, 'application_name'));
    }
}
