<?php

namespace Tests\Feature;

use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
}
