<?php

namespace Tests\Feature;

use App\Models\TrustedDevice;
use App\Models\User;
use App\Services\TrustedDeviceManager;
use Carbon\CarbonInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginSecurityTest extends TestCase
{
    use RefreshDatabase;

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
    private function createTrustedDeviceCookie(User $user): array
    {
        $token = str_repeat('a', 80);
        $fingerprint = hash('sha256', implode('|', [
            $this->deviceHeaders()['User-Agent'],
            $this->deviceHeaders()['sec-ch-ua-platform'],
            $this->deviceHeaders()['sec-ch-ua-mobile'],
            $this->deviceHeaders()['accept-language'],
        ]));

        TrustedDevice::create([
            'user_id' => $user->id,
            'device_fingerprint' => $fingerprint,
            'token_hash' => hash('sha256', $token),
            'user_agent' => $this->deviceHeaders()['User-Agent'],
            'last_used_at' => now(),
            'expires_at' => now()->addDays(TrustedDeviceManager::TRUST_DAYS),
        ]);

        return [json_encode([
            'user_id' => $user->id,
            'token' => $token,
        ], JSON_THROW_ON_ERROR), $token];
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
