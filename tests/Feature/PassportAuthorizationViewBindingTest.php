<?php

declare(strict_types=1);

namespace Tests\Feature;

use Laravel\Passport\Contracts\AuthorizationViewResponse;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Tests\TestCase;

class PassportAuthorizationViewBindingTest extends TestCase
{
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
}
