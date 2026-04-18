<?php

namespace App\Http\Controllers\Auth;

use App\Models\Application;
use App\Models\User;
use App\Support\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Passport\Contracts\AuthorizationViewResponse;
use Laravel\Passport\Http\Controllers\AuthorizationController;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Symfony\Component\HttpFoundation\Response;

class CustomAuthorizationController extends AuthorizationController
{
    public function authorize(
        ServerRequestInterface $psrRequest,
        Request $request,
        ResponseInterface $psrResponse,
        AuthorizationViewResponse $viewResponse
    ): Response|AuthorizationViewResponse {
        // CRITICAL: Save OAuth authorize URL as intended URL if user not logged in
        // This ensures user returns to OAuth flow after login
        if ($this->guard->guest()) {
            $request->session()->put('url.intended', $request->fullUrl());

            Log::channel('single')->info('=== OAuth: User not authenticated, saving intended URL ===', [
                'intended_url' => $request->fullUrl(),
                'session_id' => $request->session()->getId(),
            ]);
        }

        $webGuard = Auth::guard('web');

        // Check organization access for authenticated users
        if ($this->guard->check()) {
            $user = $this->guard->user();
            $clientId = $request->query('client_id');

            if ($user instanceof User && ! $user->isAdminVerified()) {
                $this->guard->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()
                    ->route('login')
                    ->withErrors([
                        'username' => 'Akun Anda belum diverifikasi admin SSO. Silakan tunggu persetujuan admin terlebih dahulu.',
                    ]);
            }

            if ($clientId && $user) {
                $application = Application::query()
                    ->where('oauth_client_id', $clientId)
                    ->where('is_active', true)
                    ->first();

                if ($application) {
                    $userOrgType = $user->organization?->type;

                    if (! $application->allowsOrganizationType($userOrgType)) {
                        Log::channel('single')->warning('=== OAuth: User organization not allowed ===', [
                            'user_id' => $user->id,
                            'organization_type' => $userOrgType,
                            'allowed_types' => $application->allowed_organization_types,
                            'application' => $application->name,
                        ]);

                        ActivityLogger::logByRequest(
                            request: $request,
                            event: 'oauth.authorize.denied.organization',
                            category: 'authentication',
                            description: "OAuth authorize ditolak: organisasi pengguna tidak diizinkan untuk aplikasi {$application->name}.",
                            user: $user,
                            metadata: [
                                'application_id' => $application->id,
                                'application_name' => $application->name,
                                'oauth_client_id' => $clientId,
                                'organization_type' => $userOrgType,
                                'allowed_organization_types' => $application->allowed_organization_types,
                            ],
                            status: 'warning',
                        );

                        $redirectUri = $request->query('redirect_uri');
                        $state = $request->query('state', '');

                        if (is_string($redirectUri) && $redirectUri !== '') {
                            $errorUrl = $redirectUri.'?'.http_build_query([
                                'error' => 'access_denied',
                                'error_description' => "Akun Anda tidak memiliki akses ke aplikasi {$application->name} berdasarkan organisasi yang terdaftar.",
                                'state' => $state,
                            ]);

                            return redirect()->away($errorUrl);
                        }

                        return redirect()
                            ->route('dashboard')
                            ->with('error', "Akun Anda tidak memiliki akses ke aplikasi {$application->name} berdasarkan organisasi yang terdaftar.");
                    }
                }
            }
        }

        // Debug logging BEFORE
        Log::channel('single')->info('=== OAuth Authorize Controller BEFORE ===', [
            'session_id' => $request->session()->getId(),
            'guard_check' => Auth::guard('web')->check(),
            'guard_user_id' => Auth::guard('web')->id(),
            'this_guard_check' => $this->guard->check(),
            'this_guard_user_id' => $this->guard->user()?->id,
            'this_guard_class' => get_class($this->guard),
            'this_guard_instance_id' => spl_object_id($this->guard),
            'web_guard_instance_id' => spl_object_id($webGuard),
            'guards_are_same' => spl_object_id($this->guard) === spl_object_id($webGuard),
            'guard_guest_check' => $this->guard->guest(),
        ]);

        try {
            // Call parent
            $response = parent::authorize($psrRequest, $request, $psrResponse, $viewResponse);

            // Debug logging AFTER
            Log::channel('single')->info('=== OAuth Authorize Controller AFTER ===', [
                'response_type' => get_class($response),
                'is_redirect' => $response instanceof RedirectResponse,
                'redirect_to' => $response instanceof RedirectResponse
                    ? $response->getTargetUrl()
                    : null,
                'status_code' => $response->getStatusCode(),
                'content_preview' => substr($response->getContent(), 0, 500),
            ]);

            return $response;
        } catch (\Exception $e) {
            Log::channel('single')->error('=== OAuth Authorize Controller EXCEPTION ===', [
                'exception' => get_class($e),
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            throw $e;
        }
    }
}
