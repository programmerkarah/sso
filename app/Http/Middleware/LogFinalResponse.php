<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class LogFinalResponse
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($request->is('oauth/*')) {
            Log::channel('single')->info('=== FINAL Response (After All Middleware) ===', [
                'url' => $request->fullUrl(),
                'response_type' => get_class($response),
                'status_code' => $response->getStatusCode(),
                'is_redirect' => $response->isRedirection(),
                'location_header' => $response->headers->get('Location'),
                'content_preview' => substr($response->getContent(), 0, 500),
            ]);
        }

        return $response;
    }
}
