<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Passport\ClientRepository;
use Laravel\Passport\Client;

class ApplicationController extends Controller
{
    public function __construct(public ClientRepository $clients) {}

    public function index()
    {
        $applications = Application::with('oauthClient')->latest()->paginate(10);

        return Inertia::render('Admin/Applications/Index', [
            'applications' => $applications,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Applications/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'domain' => ['required', 'string', 'max:255'],
            'callback_url' => ['required', 'url', 'max:255'],
            'logo_url' => ['nullable', 'url', 'max:255'],
        ]);

        $clients = app(ClientRepository::class);

        // Create OAuth2 Client
        $client = Client::create([
            'id' => (string) Str::uuid(), // karena PK UUID
            'owner_type' => null,
            'owner_id' => null,
            'name' => $validated['name'],
            'secret' => Str::random(40), // atau null kalau public client
            'provider' => null,
            'redirect_uris' => [$validated['callback_url']],
            'grant_types' => ['authorization_code'], // paling umum untuk OAuth login
            'revoked' => false,
        ]);

        // Create Application
        $application = Application::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'],
            'domain' => $validated['domain'],
            'callback_url' => $validated['callback_url'],
            'logo_url' => $validated['logo_url'],
            'oauth_client_id' => $client->getKey(),
            'is_active' => true,
        ]);

        return redirect()
            ->route('admin.applications.show', $application)
            ->with('success', 'Aplikasi berhasil didaftarkan!');
    }

    public function show(Application $application)
    {
        $application->load('oauthClient');

        return Inertia::render('Admin/Applications/Show', [
            'application' => $application,
        ]);
    }

    public function edit(Application $application)
    {
        return Inertia::render('Admin/Applications/Edit', [
            'application' => $application,
        ]);
    }

    public function update(Request $request, Application $application)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'domain' => ['required', 'string', 'max:255'],
            'callback_url' => ['required', 'url', 'max:255'],
            'logo_url' => ['nullable', 'url', 'max:255'],
            'is_active' => ['boolean'],
        ]);

        $application->update($validated);

        // Update OAuth Client callback URL
        if ($application->oauthClient) {
            $application->oauthClient->update([
                'redirect_uris' => [$validated['callback_url']], // ✅ array
            ]);
            $application->oauthClient->save();
        }

        return redirect()
            ->route('admin.applications.show', $application)
            ->with('success', 'Aplikasi berhasil diperbarui!');
    }

    public function destroy(Application $application)
    {
        // Delete OAuth Client (will cascade to tokens)
        if ($application->oauthClient) {
            $application->oauthClient->delete();
        }

        $application->delete();

        return redirect()
            ->route('admin.applications.index')
            ->with('success', 'Aplikasi berhasil dihapus!');
    }
}
