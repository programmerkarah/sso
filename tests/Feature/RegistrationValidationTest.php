<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use App\Notifications\NewUserPendingVerificationNotification;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class RegistrationValidationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    /** @return array<string, mixed> */
    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'John Doe',
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ], $overrides);
    }

    public function test_username_with_dot_is_accepted(): void
    {
        $response = $this->post('/register', $this->validPayload([
            'username' => 'john.doe',
        ]));

        $this->assertDatabaseHas('users', ['username' => 'john.doe']);
        $response->assertRedirect();
    }

    public function test_username_with_underscore_is_accepted(): void
    {
        $response = $this->post('/register', $this->validPayload([
            'username' => 'john_doe',
        ]));

        $this->assertDatabaseHas('users', ['username' => 'john_doe']);
        $response->assertRedirect();
    }

    public function test_username_with_dash_is_rejected(): void
    {
        $response = $this->post('/register', $this->validPayload([
            'username' => 'john-doe',
        ]));

        $response->assertSessionHasErrors('username');
        $this->assertDatabaseMissing('users', ['username' => 'john-doe']);
    }

    public function test_username_with_special_characters_is_rejected(): void
    {
        foreach (['john@doe', 'john doe', 'john#doe'] as $username) {
            $response = $this->post('/register', $this->validPayload([
                'username' => $username,
                'email' => 'user_'.md5($username).'@example.com',
            ]));

            $response->assertSessionHasErrors('username');
        }
    }

    public function test_plain_alphanumeric_username_is_accepted(): void
    {
        $response = $this->post('/register', $this->validPayload([
            'username' => 'johndoe123',
        ]));

        $this->assertDatabaseHas('users', ['username' => 'johndoe123']);
        $response->assertRedirect();
    }

    public function test_new_registration_requires_admin_verification_before_access(): void
    {
        $this->post('/register', $this->validPayload([
            'username' => 'pendingverify',
            'email' => 'pending.verify@example.com',
        ]));

        $this->assertDatabaseHas('users', [
            'username' => 'pendingverify',
            'email' => 'pending.verify@example.com',
            'admin_verified_at' => null,
        ]);
    }

    public function test_admin_receives_email_notification_when_new_user_is_pending_verification(): void
    {
        Notification::fake();

        $admin = User::factory()->create([
            'email' => 'admin.pending@example.test',
        ]);
        $admin->roles()->attach(Role::where('name', 'admin')->value('id'));

        $this->post('/register', $this->validPayload([
            'username' => 'notify_pending',
            'email' => 'notify.pending@example.com',
        ]));

        Notification::assertSentTo($admin, NewUserPendingVerificationNotification::class);
    }
}
