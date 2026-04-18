<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Organization;
use App\Support\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationController extends Controller
{
    public function index(): Response
    {
        $applications = Application::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'allowed_organization_types']);

        $organizations = Organization::query()
            ->withCount('users')
            ->latest()
            ->get()
            ->map(fn (Organization $org) => $this->transform($org, $applications))
            ->values()
            ->all();

        return Inertia::render('Admin/Organizations/Index', [
            'organizations' => $organizations,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Organizations/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:100', 'regex:/^[a-z0-9_]+$/'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $organization = Organization::create($validated);

        ActivityLogger::logByRequest(
            request: $request,
            event: 'admin.organizations.created',
            category: 'organization_management',
            description: 'Organisasi baru berhasil ditambahkan.',
            user: $request->user(),
            metadata: ['organization_id' => $organization->id, 'organization_name' => $organization->name],
        );

        return redirect()
            ->route('admin.organizations.index')
            ->with('success', 'Organisasi berhasil ditambahkan!');
    }

    public function edit(Organization $organization): Response
    {
        return Inertia::render('Admin/Organizations/Edit', [
            'organization' => $this->transform($organization),
        ]);
    }

    public function update(Request $request, Organization $organization): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:100', 'regex:/^[a-z0-9_]+$/'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $organization->update($validated);

        ActivityLogger::logByRequest(
            request: $request,
            event: 'admin.organizations.updated',
            category: 'organization_management',
            description: 'Data organisasi berhasil diperbarui.',
            user: $request->user(),
            metadata: ['organization_id' => $organization->id, 'organization_name' => $organization->name],
        );

        return redirect()
            ->route('admin.organizations.index')
            ->with('success', 'Organisasi berhasil diperbarui!');
    }

    public function toggleActive(Request $request, Organization $organization): RedirectResponse
    {
        $organization->update(['is_active' => ! $organization->is_active]);

        $statusLabel = $organization->is_active ? 'diaktifkan' : 'dinonaktifkan';

        ActivityLogger::logByRequest(
            request: $request,
            event: 'admin.organizations.toggled',
            category: 'organization_management',
            description: "Organisasi berhasil {$statusLabel}.",
            user: $request->user(),
            metadata: ['organization_id' => $organization->id, 'is_active' => $organization->is_active],
        );

        return redirect()
            ->route('admin.organizations.index')
            ->with('success', "Organisasi berhasil {$statusLabel}!");
    }

    /**
     * @return array<string, mixed>
     */
    private function transform(Organization $organization, $applications = null): array
    {
        $eligibleApplications = collect($applications)
            ->filter(fn (Application $application) => $application->allowsOrganizationType($organization->type))
            ->map(fn (Application $application) => [
                'id' => $application->id,
                'name' => $application->name,
            ])
            ->values();

        return [
            'id' => $organization->id,
            'name' => $organization->name,
            'slug' => $organization->slug,
            'type' => $organization->type,
            'description' => $organization->description,
            'is_active' => $organization->is_active,
            'users_count' => $organization->users_count ?? 0,
            'eligible_applications_count' => $eligibleApplications->count(),
            'eligible_applications' => $eligibleApplications->all(),
            'created_at' => $organization->created_at,
            'updated_at' => $organization->updated_at,
        ];
    }
}
