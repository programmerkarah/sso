<?php

namespace App\Http\Controllers;

use App\Models\Application;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationCatalogController extends Controller
{
    public function index(Request $request): Response
    {
        $isAdmin = $request->user()?->isAdmin() ?? false;

        $query = Application::query()->orderBy('name');

        if (! $isAdmin) {
            $query->where('is_active', true);
        }

        $applications = $query
            ->get(['id', 'name', 'description', 'domain', 'callback_url', 'logo_url', 'is_active'])
            ->map(fn (Application $application) => [
                'id' => $application->id,
                'name' => $application->name,
                'description' => $application->description,
                'landing_url' => $this->resolveLandingUrl($application->domain),
                'launch_url' => $this->resolveLaunchUrl(
                    callbackUrl: $application->callback_url,
                    landingUrl: $this->resolveLandingUrl($application->domain),
                ),
                'logo_url' => $application->logo_url,
                'is_active' => $application->is_active,
                'toggle_active_url' => $isAdmin
                    ? route('admin.applications.toggle-active', $application)
                    : null,
            ])
            ->values()
            ->all();

        return Inertia::render('Applications/Index', [
            'applications' => $applications,
            'isAdmin' => $isAdmin,
        ]);
    }

    private function resolveLandingUrl(string $domain): string
    {
        if (str_starts_with($domain, 'http://') || str_starts_with($domain, 'https://')) {
            return $domain;
        }

        return 'https://'.$domain;
    }

    private function resolveLaunchUrl(string $callbackUrl, string $landingUrl): string
    {
        $parsedCallbackUrl = parse_url($callbackUrl);

        if (! is_array($parsedCallbackUrl) || ! isset($parsedCallbackUrl['scheme'], $parsedCallbackUrl['host'])) {
            return $landingUrl;
        }

        $origin = $parsedCallbackUrl['scheme'].'://'.$parsedCallbackUrl['host'];

        if (isset($parsedCallbackUrl['port'])) {
            $origin .= ':'.$parsedCallbackUrl['port'];
        }

        return $origin.'/auth/sso/redirect';
    }
}
