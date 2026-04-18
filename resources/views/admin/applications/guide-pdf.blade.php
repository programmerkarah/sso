@php
    $allowedTypes = $application->allowed_organization_types ?? [];
    $allowedTypesText = count($allowedTypes) > 0 ? implode(', ', $allowedTypes) : 'semua organisasi aktif';
    $allowedTypesEnv = count($allowedTypes) > 0 ? implode(',', $allowedTypes) : 'internal';
    $clientId = $application->oauthClient?->id ?? 'your-client-id';
    $clientSecret = $application->oauth_client_secret ?? 'regenerate-secret-first';

    $envSnippet = <<<ENV
SSO_BASE_URL={$appUrl}
SSO_CLIENT_ID={$clientId}
SSO_CLIENT_SECRET={$clientSecret}
SSO_REDIRECT_URI={$application->callback_url}
SSO_REGISTER_URL={$appUrl}/register
SSO_USER_ENDPOINT=/api/user
SSO_ALLOWED_ORGANIZATION_TYPES={$allowedTypesEnv}
ENV;

    $routesSnippet = <<<'PHP'
Route::get('/auth/sso/redirect', [SsoOAuthController::class, 'redirect'])->name('sso.redirect');
Route::get('/auth/sso/callback', [SsoOAuthController::class, 'callback'])->name('sso.callback');
Route::post('/auth/sso/logout', [SsoOAuthController::class, 'logout'])->name('sso.logout');
PHP;

    $redirectSnippet = <<<'PHP'
public function redirect(Request $request): RedirectResponse
{
    $state = Str::random(40);
    $request->session()->put('sso_oauth_state', $state);

    $query = http_build_query([
        'client_id' => config('services.sso.client_id'),
        'redirect_uri' => route('sso.callback'),
        'response_type' => 'code',
        'scope' => '',
        'state' => $state,
    ]);

    return redirect()->away(rtrim(config('services.sso.base_url'), '/').'/oauth/authorize?'.$query);
}
PHP;

    $callbackSnippet = implode("\n", [
        'public function callback(Request $request): RedirectResponse',
        '{',
        "    abort_if(",
        "        \$request->session()->pull('sso_oauth_state') !== \$request->string('state')->toString(),",
        '        403,',
        '    );',
        '',
        "    \$tokenResponse = Http::asForm()->acceptJson()->post('{$appUrl}/oauth/token', [",
        "        'grant_type' => 'authorization_code',",
        "        'client_id' => config('services.sso.client_id'),",
        "        'client_secret' => config('services.sso.client_secret'),",
        "        'redirect_uri' => route('sso.callback'),",
        "        'code' => \$request->string('code')->toString(),",
        '    ]);',
        '',
        "    \$accessToken = (string) \$tokenResponse->json('access_token');",
        '',
        "    \$profile = Http::withToken(\$accessToken)",
        '        ->acceptJson()',
        "        ->get('{$appUrl}/api/user')",
        '        ->json();',
        '}',
    ]);

    $guardSnippet = <<<'PHP'
private function isAllowedOrganizationType(?string $organizationType): bool
{
    $allowedTypes = config('services.sso.allowed_organization_types', []);

    if ($allowedTypes === []) {
        return true;
    }

    return is_string($organizationType)
        && $organizationType !== ''
        && in_array($organizationType, $allowedTypes, true);
}
PHP;

    $syncSnippet = <<<'PHP'
$user->forceFill([
    'sso_user_id' => data_get($profile, 'id'),
    'name' => data_get($profile, 'name'),
    'username' => data_get($profile, 'username'),
    'email' => data_get($profile, 'email'),
    'password' => data_get($profile, 'password_hash'),
    'email_verified_at' => data_get($profile, 'email_verified_at'),
    'two_factor_secret' => filled(data_get($profile, 'two_factor.secret'))
        ? Fortify::currentEncrypter()->encrypt(data_get($profile, 'two_factor.secret'))
        : null,
    'two_factor_recovery_codes' => filled(data_get($profile, 'two_factor.secret'))
        ? Fortify::currentEncrypter()->encrypt(json_encode(data_get($profile, 'two_factor.recovery_codes', [])))
        : null,
    'two_factor_confirmed_at' => data_get($profile, 'two_factor.confirmed_at'),
])->save();
PHP;

    $profileSnippet = <<<'JSON'
{
  "id": 20,
  "name": "Rahmat Zikri",
  "username": "rhmtzikri",
  "email": "rahmatzikribps@gmail.com",
  "password_hash": "$2y$12$....",
  "email_verified_at": "2026-04-17T22:22:11.000000Z",
  "password_change_required": false,
  "last_login_at": "2026-04-19T01:22:47.000000Z",
  "organization_type": "internal",
  "organization": {
    "id": 1,
    "name": "Internal",
    "slug": "internal",
    "type": "internal"
  },
  "two_factor_enabled": true,
  "two_factor": {
    "secret": "BASE32SECRET",
    "recovery_codes": ["code-1", "code-2"],
    "confirmed_at": "2026-04-19T01:22:47.000000Z"
  }
}
JSON;

    $periodicSnippet = implode("\n", [
        'class SyncUsersFromSso extends Command',
        '{',
        '    public function handle(): int',
        '    {',
        "        \$response = Http::withToken(\$adminAccessToken)->get('{$appUrl}/api/users');",
        '',
        "        foreach (\$response->json() as \$profile) {",
        '            User::query()->updateOrCreate(',
        "                ['sso_user_id' => data_get(\$profile, 'id')],",
        '                [',
        "                    'name' => data_get(\$profile, 'name'),",
        "                    'username' => data_get(\$profile, 'username'),",
        "                    'email' => data_get(\$profile, 'email'),",
        "                    'email_verified_at' => data_get(\$profile, 'email_verified_at'),",
        '                ],',
        '            );',
        '        }',
        '',
        '        return self::SUCCESS;',
        '    }',
        '}',
    ]);
@endphp
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Panduan Integrasi OAuth2 - {{ $application->name }}</title>
    <style>
        @page {
            margin: 22mm 16mm;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            line-height: 1.55;
            color: #1f2937;
        }

        h1,
        h2 {
            color: #111827;
            margin: 0;
        }

        h1 {
            font-size: 20px;
            padding-bottom: 8px;
            border-bottom: 2px solid #dbeafe;
        }

        h2 {
            margin-top: 18px;
            font-size: 14px;
            page-break-after: avoid;
        }

        p {
            margin: 6px 0 0;
        }

        ul {
            margin: 8px 0 0 18px;
            padding: 0;
        }

        li {
            margin-top: 4px;
        }

        .summary,
        .note {
            background: #f8fafc;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 10px 12px;
            margin-top: 10px;
        }

        .section {
            margin-top: 14px;
        }

        .code-block {
            margin-top: 8px;
            background: #0f172a;
            color: #f8fafc;
            border-radius: 8px;
            padding: 10px 12px;
            font-family: DejaVu Sans Mono, monospace;
            font-size: 10px;
            line-height: 1.5;
            white-space: pre-wrap;
            word-break: break-word;
            page-break-inside: auto;
        }

        .muted {
            color: #6b7280;
        }

        .footer {
            margin-top: 18px;
            font-size: 10px;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <h1>Panduan Integrasi OAuth2 + Sinkronisasi User - {{ $application->name }}</h1>
    <p class="muted">Dokumen ini menjelaskan implementasi integrasi aplikasi dengan SSO, termasuk guard organisasi dan sinkronisasi data user lokal.</p>

    <div class="summary">
        <p><strong>Callback URL:</strong> {{ $application->callback_url }}</p>
        <p><strong>Client ID:</strong> {{ $application->oauthClient?->id ?? 'Belum tersedia' }}</p>
        <p><strong>Client Secret:</strong> {{ $application->oauth_client_secret ?? 'Belum tersedia / perlu regenerasi' }}</p>
        <p><strong>Authorize Endpoint:</strong> {{ $appUrl }}/oauth/authorize</p>
        <p><strong>Token Endpoint:</strong> {{ $appUrl }}/oauth/token</p>
        <p><strong>Profile Endpoint:</strong> {{ $appUrl }}/api/user</p>
        <p><strong>Allowed Organization Types:</strong> {{ $allowedTypesText }}</p>
    </div>

    <div class="section">
        <h2>1. Konfigurasi Environment</h2>
        <div class="code-block">{{ $envSnippet }}</div>
    </div>

    <div class="section">
        <h2>2. Route Minimal di Aplikasi Client</h2>
        <div class="code-block">{{ $routesSnippet }}</div>
    </div>

    <div class="section">
        <h2>3. Redirect ke SSO</h2>
        <div class="code-block">{{ $redirectSnippet }}</div>
    </div>

    <div class="section">
        <h2>4. Callback, Token Exchange, dan Fetch Profile</h2>
        <div class="code-block">{{ $callbackSnippet }}</div>
    </div>

    <div class="section">
        <h2>5. Guard Organisasi</h2>
        <p>SSO memblokir authorize untuk organisasi yang tidak eligible, tetapi aplikasi client tetap harus memvalidasi ulang saat callback.</p>
        <div class="code-block">{{ $guardSnippet }}</div>
    </div>

    <div class="section">
        <h2>6. Sinkronisasi User Lokal Saat Login</h2>
        <p>Minimal sinkronkan nama, username, email, password hash, dan email verified. Jika client memakai 2FA lokal, simpan ulang secret dan recovery code dengan enkripsi milik aplikasi client.</p>
        <div class="note">
            <strong>Warning keamanan role:</strong> jangan langsung memberi role CRUD berdasarkan payload SSO atau jenis organisasi.
            Untuk user baru, gunakan role lokal paling minim risiko seperti <strong>Guest</strong> atau role read-only serupa,
            lalu minta approval admin aplikasi sebelum melakukan elevasi role.
        </div>
        <div class="code-block">{{ $syncSnippet }}</div>
    </div>

    <div class="section">
        <h2>7. Contoh Payload Profile</h2>
        <div class="code-block">{{ $profileSnippet }}</div>
    </div>

    <div class="section">
        <h2>8. Strategi Sinkronisasi Data</h2>
        <ul>
            <li><strong>Minimal sync:</strong> sinkronkan user saat login. Ini cukup untuk mayoritas aplikasi.</li>
            <li><strong>Extended sync:</strong> tambahkan password hash, 2FA, dan metadata keamanan lain jika schema lokal mendukung.</li>
            <li><strong>Role safety:</strong> default-kan user baru ke role minim risiko seperti Guest sampai admin lokal menyetujui role tambahan.</li>
            <li><strong>Periodic sync:</strong> gunakan command/job terjadwal jika aplikasi perlu mirror user SSO walau user belum login.</li>
        </ul>
        <div class="code-block">{{ $periodicSnippet }}</div>
    </div>

    <div class="section">
        <h2>9. Troubleshooting</h2>
        <ul>
            <li><strong>invalid_client</strong>: client ID/secret salah atau belum diperbarui setelah regenerasi secret.</li>
            <li><strong>redirect_uri_mismatch</strong>: callback URL di aplikasi client tidak cocok dengan konfigurasi SSO.</li>
            <li><strong>Akses ditolak setelah login</strong>: cek organization type user dan konfigurasi <strong>SSO_ALLOWED_ORGANIZATION_TYPES</strong>.</li>
            <li><strong>2FA lokal tidak ikut aktif</strong>: pastikan client menyimpan ulang <strong>two_factor.secret</strong> dan <strong>two_factor.recovery_codes</strong> dengan enkripsi lokal.</li>
            <li><strong>unsupported_grant_type</strong>: authorize endpoint dibuka langsung tanpa parameter OAuth lengkap.</li>
        </ul>
    </div>

    <div class="note">
        <strong>Catatan:</strong> gunakan endpoint aplikasi client seperti <strong>/auth/sso/redirect</strong> agar query authorize selalu dibentuk dengan benar.
    </div>

    <p class="footer">Dokumen ini dibuat otomatis dari konfigurasi aplikasi di panel admin SSO pada {{ $generatedAt->format('d M Y H:i') }}.</p>
</body>
</html>