<?php

namespace Tests\Feature;

use App\Models\TrustedDevice;
use App\Models\User;
use App\Services\TrustedDeviceManager;
use Carbon\CarbonInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class LoginSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_without_two_factor_is_logged_in_and_redirected_to_security_setup(): void
    {
        $user = User::factory()->create([
            'admin_verified_at' => now(),
            'email_verified_at' => now(),
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ]);

        $oauthAuthorizeUrl = '/oauth/authorize?client_id=test-client&redirect_uri='.urlencode('https://app.example.test/auth/callback').'&response_type=code&state=test-state';

        $response = $this
            ->withSession(['url.intended' => $oauthAuthorizeUrl])
            ->post('/login', [
                'username' => $user->username,
                'password' => 'password',
            ]);

        $response->assertRedirect(route('settings.security'));
        $response->assertSessionHas('url.intended', $oauthAuthorizeUrl);
        $this->assertAuthenticatedAs($user);
    }

    public function test_user_without_two_factor_can_open_security_setup_but_not_dashboard(): void
    {
        $user = User::factory()->create([
            'admin_verified_at' => now(),
            'email_verified_at' => now(),
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ]);

        $this->actingAs($user)
            ->get(route('settings.security'))
            ->assertOk();

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertRedirect(route('settings.security'));
    }

    /**
     * Ensure a user with 2FA enabled is challenged on an untrusted device.
     */
    public function test_user_with_two_factor_enabled_is_challenged_on_a_new_device(): void
    {
        $user = $this->createTwoFactorUser(lastLoginAt: now());

        $response = $this->post('/login', [
            'username' => $user->username,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('two-factor.login'));
    }

    /**
     * Ensure a trusted device skips the 2FA challenge when the last login is recent.
     */
    public function test_trusted_device_with_recent_login_skips_two_factor_challenge(): void
    {
        $user = $this->createTwoFactorUser(lastLoginAt: now()->subDay());
        [$cookieValue] = $this->createTrustedDeviceCookie($user);

        $response = $this
            ->withCookie(TrustedDeviceManager::COOKIE_NAME, $cookieValue)
            ->withHeaders($this->deviceHeaders())
            ->post('/login', [
                'username' => $user->username,
                'password' => 'password',
            ]);

        $response->assertRedirect('/dashboard');
    }

    /**
     * Ensure the user is re-challenged if they have not logged in for more than seven days.
     */
    public function test_stale_login_requires_two_factor_even_on_a_trusted_device(): void
    {
        $user = $this->createTwoFactorUser(lastLoginAt: now()->subDays(8));
        [$cookieValue] = $this->createTrustedDeviceCookie($user);

        $response = $this
            ->withCookie(TrustedDeviceManager::COOKIE_NAME, $cookieValue)
            ->withHeaders($this->deviceHeaders())
            ->post('/login', [
                'username' => $user->username,
                'password' => 'password',
            ]);

        $response->assertRedirect(route('two-factor.login'));
    }

    public function test_trusted_device_remains_valid_with_minor_user_agent_change(): void
    {
        $user = $this->createTwoFactorUser(lastLoginAt: now()->subDay());
        [$cookieValue] = $this->createTrustedDeviceCookie($user, $this->deviceHeaders());

        $minorUpdateHeaders = [
            ...$this->deviceHeaders(),
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/146.0.1.2',
        ];

        $response = $this
            ->withCookie(TrustedDeviceManager::COOKIE_NAME, $cookieValue)
            ->withHeaders($minorUpdateHeaders)
            ->post('/login', [
                'username' => $user->username,
                'password' => 'password',
            ]);

        $response->assertRedirect('/dashboard');
    }

    public function test_trusted_device_remains_valid_with_browser_major_update(): void
    {
        $user = $this->createTwoFactorUser(lastLoginAt: now()->subDay());
        [$cookieValue] = $this->createTrustedDeviceCookie($user, $this->deviceHeaders());

        $majorUpdateHeaders = [
            ...$this->deviceHeaders(),
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/147.0.0.0',
            'accept-language' => 'id,en-US;q=0.9',
        ];

        $response = $this
            ->withCookie(TrustedDeviceManager::COOKIE_NAME, $cookieValue)
            ->withHeaders($majorUpdateHeaders)
            ->post('/login', [
                'username' => $user->username,
                'password' => 'password',
            ]);

        $response->assertRedirect('/dashboard');
    }

    /**
     * Ensure a user flagged for forced password change is redirected immediately after login.
     */
    public function test_user_with_forced_password_change_is_redirected_after_login(): void
    {
        $user = User::factory()->create([
            'password_change_required' => true,
        ]);

        $response = $this->post('/login', [
            'username' => $user->username,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('settings.change-password'));
    }

    private function createTwoFactorUser(?CarbonInterface $lastLoginAt): User
    {
        return User::factory()->create([
            'two_factor_secret' => encrypt('test-secret'),
            'two_factor_recovery_codes' => encrypt(json_encode([])),
            'two_factor_confirmed_at' => now(),
            'last_login_at' => $lastLoginAt,
        ]);
    }

    /**
     * @return array{0:string,1:string}
     */
    private function createTrustedDeviceCookie(User $user, ?array $headers = null): array
    {
        $headers ??= $this->deviceHeaders();
        $token = str_repeat('a', 80);
        $fingerprint = app(TrustedDeviceManager::class)->fingerprint($this->requestFromHeaders($headers));

        TrustedDevice::create([
            'user_id' => $user->id,
            'device_fingerprint' => $fingerprint,
            'token_hash' => hash('sha256', $token),
            'user_agent' => $headers['User-Agent'],
            'last_used_at' => now(),
            'expires_at' => now()->addDays(TrustedDeviceManager::TRUST_DAYS),
        ]);

        return [json_encode([
            'user_id' => $user->id,
            'token' => $token,
        ], JSON_THROW_ON_ERROR), $token];
    }

    /**
     * @param  array<string, string>  $headers
     */
    private function requestFromHeaders(array $headers): Request
    {
        return Request::create('/', 'GET', [], [], [], [
            'HTTP_USER_AGENT' => $headers['User-Agent'],
            'HTTP_ACCEPT_LANGUAGE' => $headers['accept-language'],
        ]);
    }

    /**
     * @return array<string, string>
     */
    private function deviceHeaders(): array
    {
        return [
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/146.0.0.0',
            'sec-ch-ua-platform' => '"Windows"',
            'sec-ch-ua-mobile' => '?0',
            'accept-language' => 'id-ID,id;q=0.9',
        ];
    }
}
