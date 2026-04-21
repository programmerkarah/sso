<?php

namespace App\Http\Middleware;

use App\Models\Application;
use App\Models\User;
use App\Support\ActivityLogger;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class LogFinalResponse
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($this->shouldTrackOAuthRequest($request)) {
            $clientId = $this->resolveClientId($request);
            $application = $this->resolveApplication($clientId);
            $status = $response->getStatusCode() >= 500
                ? 'error'
                : ($response->getStatusCode() >= 400 ? 'warning' : 'success');
            $description = match ($status) {
                'error' => 'Gagal memproses permintaan OAuth2 dari aplikasi/client.',
                'warning' => 'Permintaan OAuth2 diproses dengan peringatan atau penolakan.',
                default => 'Berhasil memproses permintaan OAuth2 dari aplikasi/client.',
            };

            /** @var User|null $user */
            $user = $request->user();

            ActivityLogger::logByRequest(
                request: $request,
                event: 'oauth.request',
                category: 'oauth',
                description: $description,
                user: $user,
                metadata: [
                    'oauth_client_id' => $clientId,
                    'application_id' => $application?->id,
                    'application_name' => $application?->name,
                    'application_domain' => $application?->domain,
                    'response_status_code' => $response->getStatusCode(),
                    'is_redirect' => $response->isRedirection(),
                    'redirect_location' => $response->headers->get('Location'),
                ],
                status: $status,
            );

            Log::channel('single')->info('=== FINAL Response (After All Middleware) ===', [
                'url' => $request->fullUrl(),
                'response_type' => get_class($response),
                'status_code' => $response->getStatusCode(),
                'is_redirect' => $response->isRedirection(),
                'location_header' => $response->headers->get('Location'),
                'content_preview' => substr($response->getContent(), 0, 500),
                'oauth_client_id' => $clientId,
                'application_name' => $application?->name,
            ]);
        }

        return $response;
    }

    private function shouldTrackOAuthRequest(Request $request): bool
    {
        return $request->is('oauth/authorize')
            || $request->is('oauth/token')
            || $request->is('api/user')
            || $request->is('api/users');
    }

    private function resolveClientId(Request $request): ?string
    {
        $clientId = $request->query('client_id');

        if (! is_string($clientId) || $clientId === '') {
            $clientId = $request->input('client_id');
        }

        return is_string($clientId) && $clientId !== '' ? $clientId : null;
    }

    private function resolveApplication(?string $clientId): ?Application
    {
        if (! is_string($clientId) || $clientId === '') {
            return null;
        }

        return Application::query()->where('oauth_client_id', $clientId)->first();
    }
}
