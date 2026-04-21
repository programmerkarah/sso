<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Organization;
use App\Services\EncryptedStateService;
use App\Support\ActivityLogger;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Passport\Client;
use Laravel\Passport\ClientRepository;

class ApplicationController extends Controller
{
    public function __construct(public ClientRepository $clients) {}

    public function index(Request $request, EncryptedStateService $encryptedState): Response
    {
        $state = $encryptedState->decryptArray($request->string('state')->toString(), [
            'page' => 1,
        ]);

        $currentPage = max(1, (int) ($state['page'] ?? 1));
        $applications = Application::query()
            ->latest()
            ->paginate(10, ['*'], 'page', $currentPage);

        return Inertia::render('Admin/Applications/Index', [
            'applications' => [
                'data' => $applications->getCollection()
                    ->map(fn (Application $application) => $this->transformApplicationSummary($application))
                    ->values()
                    ->all(),
                'current_page' => $applications->currentPage(),
                'from' => $applications->firstItem(),
                'last_page' => $applications->lastPage(),
                'per_page' => $applications->perPage(),
                'to' => $applications->lastItem(),
                'total' => $applications->total(),
                'prev_page_token' => $applications->currentPage() > 1
                    ? $encryptedState->encryptArray(['page' => $applications->currentPage() - 1])
                    : null,
                'next_page_token' => $applications->hasMorePages()
                    ? $encryptedState->encryptArray(['page' => $applications->currentPage() + 1])
                    : null,
                'pages' => collect(range(1, $applications->lastPage()))
                    ->map(fn (int $page) => [
                        'label' => (string) $page,
                        'token' => $encryptedState->encryptArray(['page' => $page]),
                        'active' => $page === $applications->currentPage(),
                    ])
                    ->all(),
            ],
            'stats' => [
                'total' => Application::query()->count(),
                'active' => Application::query()->where('is_active', true)->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Applications/Create', [
            'availableOrganizationTypes' => Organization::query()->where('is_active', true)->pluck('type')->unique()->values()->all(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $availableOrganizationTypes = Organization::query()
            ->where('is_active', true)
            ->pluck('type')
            ->unique()
            ->values()
            ->all();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'domain' => ['required', 'string', 'max:255'],
            'callback_url' => ['required', 'url', 'max:255'],
            'logo_url' => ['nullable', 'url', 'max:255'],
            'allowed_organization_types' => ['nullable', 'array'],
            'allowed_organization_types.*' => ['string', Rule::in($availableOrganizationTypes)],
        ]);

        $allowedOrganizationTypes = collect($validated['allowed_organization_types'] ?? [])
            ->map(fn (mixed $type) => (string) $type)
            ->filter()
            ->unique()
            ->values()
            ->all();

        $clientSecret = Str::random(40);

        $client = Client::create([
            'id' => (string) Str::uuid(),
            'owner_type' => null,
            'owner_id' => null,
            'name' => $validated['name'],
            'secret' => $clientSecret,
            'provider' => null,
            'redirect_uris' => [$validated['callback_url']],
            'grant_types' => ['authorization_code'],
            'revoked' => false,
        ]);

        $application = Application::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'],
            'domain' => $validated['domain'],
            'callback_url' => $validated['callback_url'],
            'logo_url' => $validated['logo_url'],
            'oauth_client_id' => $client->getKey(),
            'oauth_client_secret' => $clientSecret,
            'is_active' => true,
            'allowed_organization_types' => $allowedOrganizationTypes,
        ]);

        ActivityLogger::logByRequest(
            request: $request,
            event: 'admin.applications.created',
            category: 'application_management',
            description: "Berhasil mendaftarkan aplikasi {$application->name}.",
            user: $request->user(),
            metadata: [
                'application_id' => $application->id,
                'application_name' => $application->name,
                'allowed_organization_types' => $allowedOrganizationTypes,
            ],
        );

        return redirect()
            ->route('admin.applications.show', $application)
            ->with('success', 'Aplikasi berhasil didaftarkan!');
    }

    public function show(Application $application): Response
    {
        $application->load('oauthClient');

        return Inertia::render('Admin/Applications/Show', [
            'application' => $this->transformApplicationDetail($application),
            'appUrl' => config('app.url'),
        ]);
    }

    public function guide(Application $application): Response
    {
        $application->load('oauthClient');

        return Inertia::render('Admin/Applications/Guide', [
            'application' => $this->transformApplicationDetail($application),
            'appUrl' => config('app.url'),
        ]);
    }

    public function exportGuidePdf(Request $request, Application $application): HttpResponse
    {
        $application->load('oauthClient');

        $pdf = Pdf::loadView('admin.applications.guide-pdf', [
            'application' => $application,
            'appUrl' => config('app.url'),
            'generatedAt' => now(),
        ])->setPaper('a4', 'portrait');

        ActivityLogger::logByRequest(
            request: $request,
            event: 'admin.applications.guide.pdf.exported',
            category: 'application_management',
            description: "Berhasil mengekspor panduan integrasi aplikasi {$application->name} ke PDF.",
            user: $request->user(),
            metadata: [
                'application_id' => $application->id,
                'application_name' => $application->name,
            ],
        );

        return response($pdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="panduan-integrasi-'.$application->slug.'.pdf"',
        ]);
    }

    public function edit(Application $application): Response
    {
        return Inertia::render('Admin/Applications/Edit', [
            'application' => $this->transformApplicationDetail($application),
            'availableOrganizationTypes' => Organization::query()->where('is_active', true)->pluck('type')->unique()->values()->all(),
        ]);
    }

    public function update(Request $request, Application $application): RedirectResponse
    {
        $availableOrganizationTypes = Organization::query()
            ->where('is_active', true)
            ->pluck('type')
            ->unique()
            ->values()
            ->all();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'domain' => ['required', 'string', 'max:255'],
            'callback_url' => ['required', 'url', 'max:255'],
            'logo_url' => ['nullable', 'url', 'max:255'],
            'is_active' => ['boolean'],
            'allowed_organization_types' => ['nullable', 'array'],
            'allowed_organization_types.*' => ['string', Rule::in($availableOrganizationTypes)],
        ]);

        $validated['allowed_organization_types'] = collect($validated['allowed_organization_types'] ?? [])
            ->map(fn (mixed $type) => (string) $type)
            ->filter()
            ->unique()
            ->values()
            ->all();

        $validated['slug'] = Str::slug($validated['name']);

        $application->update($validated);

        if ($application->oauthClient) {
            $application->oauthClient->update([
                'name' => $validated['name'],
                'redirect_uris' => [$validated['callback_url']],
            ]);
            $application->oauthClient->save();
        }

        ActivityLogger::logByRequest(
            request: $request,
            event: 'admin.applications.updated',
            category: 'application_management',
            description: "Berhasil memperbarui data aplikasi {$application->name}.",
            user: $request->user(),
            metadata: [
                'application_id' => $application->id,
                'application_name' => $application->name,
                'allowed_organization_types' => $validated['allowed_organization_types'],
            ],
        );

        return redirect()
            ->route('admin.applications.show', $application)
            ->with('success', 'Aplikasi berhasil diperbarui!');
    }

    public function toggleActive(Request $request, Application $application): RedirectResponse
    {
        $application->update(['is_active' => ! $application->is_active]);

        $statusLabel = $application->is_active ? 'diaktifkan' : 'dinonaktifkan';

        ActivityLogger::logByRequest(
            request: $request,
            event: 'admin.applications.toggled',
            category: 'application_management',
            description: "Berhasil {$statusLabel} aplikasi {$application->name}.",
            user: $request->user(),
            metadata: [
                'application_id' => $application->id,
                'application_name' => $application->name,
                'is_active' => $application->is_active,
            ],
        );

        return redirect()
            ->route('applications.index')
            ->with('success', "Aplikasi berhasil {$statusLabel}!");
    }

    public function refreshSecret(Request $request, Application $application): RedirectResponse
    {
        if (! $application->oauthClient) {
            ActivityLogger::logByRequest(
                request: $request,
                event: 'admin.applications.secret.refresh.failed',
                category: 'application_management',
                description: "Gagal meregenerasi client secret aplikasi {$application->name} karena client OAuth tidak ditemukan.",
                user: $request->user(),
                metadata: [
                    'application_id' => $application->id,
                    'application_name' => $application->name,
                ],
                status: 'error',
            );

            return back()->with('error', 'Client OAuth untuk aplikasi ini tidak ditemukan.');
        }

        $clientSecret = Str::random(40);

        $application->oauthClient->forceFill([
            'secret' => $clientSecret,
        ])->save();

        $application->forceFill([
            'oauth_client_secret' => $clientSecret,
        ])->save();

        ActivityLogger::logByRequest(
            request: $request,
            event: 'admin.applications.secret.refreshed',
            category: 'application_management',
            description: "Berhasil meregenerasi client secret aplikasi {$application->name}.",
            user: $request->user(),
            metadata: [
                'application_id' => $application->id,
                'application_name' => $application->name,
            ],
        );

        return back()->with('success', 'Client secret berhasil diregenerasi. Simpan secret baru ini di tempat yang aman.');
    }

    public function destroy(Request $request, Application $application): RedirectResponse
    {
        $appId = $application->id;
        $appName = $application->name;

        if ($application->oauthClient) {
            $application->oauthClient->delete();
        }

        $application->delete();

        ActivityLogger::logByRequest(
            request: $request,
            event: 'admin.applications.deleted',
            category: 'application_management',
            description: "Berhasil menghapus aplikasi {$appName}.",
            user: $request->user(),
            metadata: [
                'application_id' => $appId,
                'application_name' => $appName,
            ],
        );

        return redirect()
            ->route('admin.applications.index')
            ->with('success', 'Aplikasi berhasil dihapus!');
    }

    /**
     * @return array<string, mixed>
     */
    private function transformApplicationSummary(Application $application): array
    {
        return [
            'id' => $application->id,
            'route_key' => $application->getRouteKey(),
            'name' => $application->name,
            'slug' => $application->slug,
            'description' => $application->description,
            'domain' => $application->domain,
            'callback_url' => $application->callback_url,
            'logo_url' => $application->logo_url,
            'is_active' => $application->is_active,
            'allowed_organization_types' => $application->allowed_organization_types ?? [],
            'oauth_client_id' => $application->oauth_client_id,
            'created_at' => $application->created_at,
            'updated_at' => $application->updated_at,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function transformApplicationDetail(Application $application): array
    {
        return [
            ...$this->transformApplicationSummary($application),
            'oauth_client' => $application->oauthClient ? [
                'id' => $application->oauthClient->getKey(),
                'secret' => $application->oauth_client_secret,
                'redirect' => $application->callback_url,
            ] : null,
        ];
    }
}
