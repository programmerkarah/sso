<?php

namespace App\Http\Controllers;

use App\Models\Application;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationCatalogController extends Controller
{
    public function index(): Response
    {
        $applications = Application::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'description', 'domain', 'logo_url'])
            ->map(fn (Application $application) => [
                'id' => $application->id,
                'name' => $application->name,
                'description' => $application->description,
                'landing_url' => $this->resolveLandingUrl($application->domain),
                'logo_url' => $application->logo_url,
            ])
            ->values()
            ->all();

        return Inertia::render('Applications/Index', [
            'applications' => $applications,
        ]);
    }

    private function resolveLandingUrl(string $domain): string
    {
        if (str_starts_with($domain, 'http://') || str_starts_with($domain, 'https://')) {
            return $domain;
        }

        return 'https://'.$domain;
    }
}
