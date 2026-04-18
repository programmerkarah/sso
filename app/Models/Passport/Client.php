<?php

declare(strict_types=1);

namespace App\Models\Passport;

use App\Models\Application;
use Illuminate\Contracts\Auth\Authenticatable;
use Laravel\Passport\Client as BaseClient;
use Laravel\Passport\Scope;

class Client extends BaseClient
{
    /**
     * Determine if the client should skip the authorization prompt.
     *
     * @param  array<int, Scope>  $scopes
     */
    public function skipsAuthorization(Authenticatable $user, array $scopes): bool
    {
        return Application::query()
            ->where('oauth_client_id', $this->getKey())
            ->where('is_active', true)
            ->exists();
    }
}
