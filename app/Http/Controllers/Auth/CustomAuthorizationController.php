<?php

namespace App\Http\Controllers\Auth;

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
        $webGuard = Auth::guard('web');
        
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
                'is_redirect' => $response instanceof \Illuminate\Http\RedirectResponse,
                'redirect_to' => $response instanceof \Illuminate\Http\RedirectResponse 
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
