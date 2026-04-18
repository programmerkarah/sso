<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class CsrfTokenRefreshTest extends TestCase
{
    use RefreshDatabase;

    public function test_csrf_token_endpoint_regenerates_token(): void
    {
        $this->startSession();

        $firstToken = csrf_token();

        $response = $this->get(route('csrf.token'));

        $response->assertOk();
        $response->assertJsonStructure(['token']);

        $newToken = $response->json('token');

        $this->assertNotSame($firstToken, $newToken);
        $this->assertSame($newToken, session()->token());
    }

    public function test_inertia_request_with_invalid_csrf_token_redirects_using_inertia_location(): void
    {
        Route::post('/__token-mismatch-test', function () {
            throw new TokenMismatchException('Test token mismatch');
        });

        $this->startSession();

        $response = $this
            ->withHeader('X-Inertia', 'true')
            ->withHeader('X-Requested-With', 'XMLHttpRequest')
            ->withHeader('referer', route('settings.change-password'))
            ->post('/__token-mismatch-test');

        $response->assertStatus(409);
        $response->assertHeader('X-Inertia-Location', route('settings.change-password'));

        $this->assertNotEmpty(session()->token());
    }
}
