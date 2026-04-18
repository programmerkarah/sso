<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationCatalogController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User|null $user */
        $user = Auth::user();
        $isAdmin = $user?->isAdmin() ?? false;
        $organizationType = $user?->organization?->type;

        $query = Application::query()->orderBy('name');

        if (! $isAdmin) {
            $query
                ->where('is_active', true)
                ->eligibleForOrganizationType($organizationType);
        }

        $applications = $query
            ->get(['id', 'name', 'description', 'domain', 'callback_url', 'logo_url', 'is_active'])
            ->map(fn (Application $application) => [
                'id' => $application->id,
                'name' => $application->name,
                'description' => $application->description,
                'landing_url' => $application->landingUrl(),
                'launch_url' => $application->launchUrl(),
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
}
