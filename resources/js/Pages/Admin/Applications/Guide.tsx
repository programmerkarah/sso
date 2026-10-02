import { ArrowLeft, CheckCircle, Copy, Download } from 'lucide-react';

import { useMemo, useState } from 'react';

import { Head, Link } from '@inertiajs/react';

import Button from '@/Components/Button';
import GlassCard from '@/Components/GlassCard';
import PageHeader from '@/Components/PageHeader';
import ScrollArea from '@/Components/ScrollArea';
import AppLayout from '@/Layouts/AppLayout';
import { Application } from '@/types';

interface GuideProps {
    application: Application;
    appUrl: string;
}

type CopyKey =
    | 'env'
    | 'routes'
    | 'redirect'
    | 'callback'
    | 'organization'
    | 'sync'
    | 'profile'
    | 'periodic';

function CodeBlock({
    label,
    value,
    copyKey,
    copied,
    onCopy,
}: {
    label: string;
    value: string;
    copyKey: CopyKey;
    copied: CopyKey | null;
    onCopy: (value: string, key: CopyKey) => void;
}) {
    return (
        <div className="min-w-0 rounded-xl bg-black/40 p-3 sm:p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--bps-text)]/45">
                    {label}
                </p>
                <button
                    onClick={() => onCopy(value, copyKey)}
                    className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-[var(--bps-surface-soft)] px-3 py-1.5 text-xs font-medium text-[var(--bps-muted)] transition hover:brightness-95 hover:text-[var(--bps-text)]"
                >
                    <Copy className="h-3.5 w-3.5" />
                    {copied === copyKey ? 'Tersalin!' : 'Salin'}
                </button>
            </div>
            <ScrollArea axis="horizontal" viewportClassName="pb-2">
                <pre className="whitespace-pre-wrap break-all text-xs leading-6 text-[var(--bps-text)]/90">
                    <code>{value}</code>
                </pre>
            </ScrollArea>
        </div>
    );
}

export default function Guide({ application, appUrl }: GuideProps) {
    const [copied, setCopied] = useState<CopyKey | null>(null);

    const authorizeEndpoint = `${appUrl}/oauth/authorize`;
    const tokenEndpoint = `${appUrl}/oauth/token`;
    const profileEndpoint = `${appUrl}/api/user`;
    const bulkUsersEndpoint = `${appUrl}/api/users`;
    const allowedOrganizationTypes =
        application.allowed_organization_types.length > 0
            ? application.allowed_organization_types.join(', ')
            : 'semua organisasi aktif';
    const allowedOrganizationTypesEnv =
        application.allowed_organization_types.length > 0
            ? application.allowed_organization_types.join(',')
            : 'internal';

    const snippets = useMemo(
        () => ({
            env: `SSO_BASE_URL=${appUrl}\nSSO_CLIENT_ID=${application.oauth_client?.id ?? 'your-client-id'}\nSSO_CLIENT_SECRET=${application.oauth_client?.secret ?? 'regenerate-secret-first'}\nSSO_REDIRECT_URI=${application.callback_url}\nSSO_REGISTER_URL=${appUrl}/register\nSSO_USER_ENDPOINT=/api/user\nSSO_ALLOWED_ORGANIZATION_TYPES=${allowedOrganizationTypesEnv}`,
            routes: `Route::get('/auth/sso/redirect', [SsoOAuthController::class, 'redirect'])->name('sso.redirect');\nRoute::get('/auth/sso/callback', [SsoOAuthController::class, 'callback'])->name('sso.callback');\nRoute::post('/auth/sso/logout', [SsoOAuthController::class, 'logout'])->name('sso.logout');`,
            redirect: `public function redirect(Request $request): RedirectResponse\n{\n    $state = Str::random(40);\n    $request->session()->put('sso_oauth_state', $state);\n\n    $query = http_build_query([\n        'client_id' => config('services.sso.client_id'),\n        'redirect_uri' => route('sso.callback'),\n        'response_type' => 'code',\n        'scope' => '',\n        'state' => $state,\n    ]);\n\n    return redirect()->away(rtrim(config('services.sso.base_url'), '/').'/oauth/authorize?'.$query);\n}`,
            callback: `public function callback(Request $request): RedirectResponse\n{\n    abort_if($request->session()->pull('sso_oauth_state') !== $request->string('state')->toString(), 403);\n\n    $tokenResponse = Http::asForm()->acceptJson()->post('${tokenEndpoint}', [\n        'grant_type' => 'authorization_code',\n        'client_id' => config('services.sso.client_id'),\n        'client_secret' => config('services.sso.client_secret'),\n        'redirect_uri' => route('sso.callback'),\n        'code' => $request->string('code')->toString(),\n    ]);\n\n    $accessToken = (string) $tokenResponse->json('access_token');\n    $profile = Http::withToken($accessToken)->acceptJson()->get('${profileEndpoint}')->json();\n\n    // lanjutkan ke guard organisasi + sync user lokal\n}`,
            organization: `private function isAllowedOrganizationType(?string $organizationType): bool\n{\n    $allowedTypes = config('services.sso.allowed_organization_types', []);\n\n    if ($allowedTypes === []) {\n        return true;\n    }\n\n    return is_string($organizationType)\n        && $organizationType !== ''\n        && in_array($organizationType, $allowedTypes, true);\n}\n\n$organizationType = data_get($profile, 'organization.type')\n    ?? data_get($profile, 'organization_type');\n\nif (! $this->isAllowedOrganizationType($organizationType)) {\n    return redirect()->route('login')->with('error', 'Akun Anda tidak diizinkan mengakses aplikasi ini berdasarkan organisasi.');\n}`,
            sync: `private function resolveSsoSynchronizationAttributes(array $profile): array\n{\n    return [\n        'name' => data_get($profile, 'name'),\n        'username' => data_get($profile, 'username'),\n        'email' => data_get($profile, 'email'),\n        'password' => data_get($profile, 'password_hash'),\n        'email_verified_at' => data_get($profile, 'email_verified_at'),\n        'two_factor_secret' => filled(data_get($profile, 'two_factor.secret'))\n            ? Fortify::currentEncrypter()->encrypt(data_get($profile, 'two_factor.secret'))\n            : null,\n        'two_factor_recovery_codes' => filled(data_get($profile, 'two_factor.secret'))\n            ? Fortify::currentEncrypter()->encrypt(json_encode(data_get($profile, 'two_factor.recovery_codes', [])))\n            : null,\n        'two_factor_confirmed_at' => data_get($profile, 'two_factor.confirmed_at'),\n    ];\n}\n\n$user->forceFill([\n    'sso_user_id' => data_get($profile, 'id'),\n    ...array_filter($this->resolveSsoSynchronizationAttributes($profile), fn ($value) => ! is_null($value)),\n])->save();\n\n// Jangan auto-elevate role dari payload SSO atau jenis organisasi.\n// Jika user baru butuh role awal, gunakan role paling minim risiko\n// seperti Guest dan minta admin aplikasi melakukan approval/elevasi manual.`,
            profile: `{
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
}`,
            periodic: `// Opsi 1: cukup sync saat login (disarankan untuk mayoritas aplikasi)\n// Opsi 2: sinkronisasi periodik untuk kebutuhan identity mirror\n\nclass SyncUsersFromSso extends Command\n{\n    public function handle(): int\n    {\n        $response = Http::withToken($adminAccessToken)->get('${bulkUsersEndpoint}');\n\n        foreach ($response->json() as $profile) {\n            User::query()->updateOrCreate(\n                ['sso_user_id' => data_get($profile, 'id')],\n                [\n                    'name' => data_get($profile, 'name'),\n                    'username' => data_get($profile, 'username'),\n                    'email' => data_get($profile, 'email'),\n                    'email_verified_at' => data_get($profile, 'email_verified_at'),\n                ],\n            );\n        }\n\n        return self::SUCCESS;\n    }\n}`,
        }),
        [
            allowedOrganizationTypesEnv,
            appUrl,
            application.callback_url,
            application.oauth_client?.id,
            application.oauth_client?.secret,
            bulkUsersEndpoint,
            profileEndpoint,
            tokenEndpoint,
        ],
    );

    const copyText = (value: string, key: CopyKey) => {
        navigator.clipboard.writeText(value);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <AppLayout>
            <Head title={`Panduan - ${application.name}`} />

            <div className="space-y-6">
                <PageHeader
                    title="Panduan integrasi"
                    description={`Panduan OAuth2 dan sinkronisasi pengguna untuk ${application.name}.`}
                    actions={
                        <>
                            <Link
                                href={`/admin/applications/${application.route_key}`}
                                className="inline-flex items-center gap-2 rounded-lg border border-[var(--bps-border)] px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-[var(--bps-text)]"
                            >
                                <ArrowLeft className="h-4 w-4" /> Detail
                                aplikasi
                            </Link>
                            <a
                                href={`/admin/applications/${application.route_key}/guide/export-pdf`}
                                className="inline-flex items-center gap-2 rounded-lg border border-[var(--bps-border)] px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-[var(--bps-text)]"
                            >
                                <Download className="h-4 w-4" /> PDF
                            </a>
                        </>
                    }
                />

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(420px,0.8fr)]">
                    <GlassCard className="space-y-6 p-4 sm:p-6">
                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-[var(--bps-text)]">
                                1. Ringkasan Kontrak Integrasi
                            </h2>
                            <div className="rounded-xl border border-[var(--bps-border)] bg-slate-900/50 p-4 text-sm leading-7 text-[var(--bps-muted)]">
                                <p>
                                    <span className="font-semibold text-[var(--bps-text)]">
                                        Authorize endpoint:
                                    </span>{' '}
                                    {authorizeEndpoint}
                                </p>
                                <p>
                                    <span className="font-semibold text-[var(--bps-text)]">
                                        Token endpoint:
                                    </span>{' '}
                                    {tokenEndpoint}
                                </p>
                                <p>
                                    <span className="font-semibold text-[var(--bps-text)]">
                                        Profile endpoint:
                                    </span>{' '}
                                    {profileEndpoint}
                                </p>
                                <p>
                                    <span className="font-semibold text-[var(--bps-text)]">
                                        Allowed organization types:
                                    </span>{' '}
                                    {allowedOrganizationTypes}
                                </p>
                                <p className="mt-2 text-[var(--bps-text)]/65">
                                    Aplikasi client harus memvalidasi organisasi
                                    user saat callback dan menyinkronkan data
                                    lokal setiap kali user login via SSO.
                                </p>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-[var(--bps-text)]">
                                2. Konfigurasi Environment
                            </h2>
                            <p className="text-sm text-[var(--bps-muted)]">
                                Simpan kredensial SSO di server aplikasi client.
                                Sertakan allow-list organisasi di aplikasi agar
                                guard di client konsisten dengan kebijakan akses
                                di SSO.
                            </p>
                            <CodeBlock
                                label=".env"
                                value={snippets.env}
                                copyKey="env"
                                copied={copied}
                                onCopy={copyText}
                            />
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-[var(--bps-text)]">
                                3. Tahap 1: Daftarkan Route Client
                            </h2>
                            <p className="text-sm text-[var(--bps-muted)]">
                                Minimal ada endpoint redirect, callback, dan
                                logout lokal. Endpoint redirect adalah pintu
                                masuk resmi untuk login SSO.
                            </p>
                            <CodeBlock
                                label="routes/web.php"
                                value={snippets.routes}
                                copyKey="routes"
                                copied={copied}
                                onCopy={copyText}
                            />
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-[var(--bps-text)]">
                                4. Tahap 2: Buat Redirect ke SSO
                            </h2>
                            <p className="text-sm text-[var(--bps-muted)]">
                                Simpan state acak di session, lalu bangun query
                                OAuth lengkap. Jangan arahkan user ke authorize
                                URL kosong.
                            </p>
                            <CodeBlock
                                label="SsoOAuthController::redirect()"
                                value={snippets.redirect}
                                copyKey="redirect"
                                copied={copied}
                                onCopy={copyText}
                            />
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-[var(--bps-text)]">
                                5. Tahap 3: Callback, Token Exchange, dan Fetch
                                Profile
                            </h2>
                            <p className="text-sm text-[var(--bps-muted)]">
                                Verifikasi state, tukar authorization code
                                menjadi access token, lalu ambil profil user
                                dari endpoint profile.
                            </p>
                            <CodeBlock
                                label="SsoOAuthController::callback()"
                                value={snippets.callback}
                                copyKey="callback"
                                copied={copied}
                                onCopy={copyText}
                            />
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-[var(--bps-text)]">
                                6. Tahap 4: Guard Organisasi
                            </h2>
                            <p className="text-sm text-[var(--bps-muted)]">
                                SSO sudah memblokir authorize untuk organisasi
                                yang tidak cocok. Client tetap perlu memvalidasi
                                ulang agar user tidak bisa masuk jika
                                konfigurasi lokal lebih ketat.
                            </p>
                            <CodeBlock
                                label="Guard organization type"
                                value={snippets.organization}
                                copyKey="organization"
                                copied={copied}
                                onCopy={copyText}
                            />
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-[var(--bps-text)]">
                                7. Tahap 5: Sinkronisasi User Lokal di Setiap
                                Login
                            </h2>
                            <p className="text-sm text-[var(--bps-muted)]">
                                Setelah profil diterima, sinkronkan field lokal
                                yang dibutuhkan aplikasi. Minimal: nama,
                                username, email, email verified, dan password
                                hash. Jika aplikasi mendukung 2FA lokal, salin
                                data 2FA dari payload profile dan enkripsi ulang
                                dengan key aplikasi client.
                            </p>
                            <div className="theme-warning rounded-xl p-4 text-sm leading-7">
                                <p className="font-semibold text-current">
                                    Warning keamanan role
                                </p>
                                <p>
                                    Jangan jadikan data organisasi atau payload
                                    SSO sebagai alasan untuk langsung memberi
                                    role CRUD. Untuk user baru, pakai role lokal
                                    paling minim risiko seperti Guest atau role
                                    read-only serupa, lalu minta approval admin
                                    aplikasi sebelum role dinaikkan.
                                </p>
                            </div>
                            <CodeBlock
                                label="Helper sinkronisasi user"
                                value={snippets.sync}
                                copyKey="sync"
                                copied={copied}
                                onCopy={copyText}
                            />
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-[var(--bps-text)]">
                                8. Payload Profil dari SSO
                            </h2>
                            <p className="text-sm text-[var(--bps-muted)]">
                                Kontrak profile saat ini mendukung sinkronisasi
                                identity, password hash, organization, dan
                                two-factor. Gunakan ini sebagai acuan
                                implementasi di aplikasi client.
                            </p>
                            <CodeBlock
                                label="GET /api/user"
                                value={snippets.profile}
                                copyKey="profile"
                                copied={copied}
                                onCopy={copyText}
                            />
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-[var(--bps-text)]">
                                9. Panduan Sinkronisasi Data Sesuai Kebutuhan
                            </h2>
                            <div className="space-y-3 rounded-xl border border-[var(--bps-border)] bg-slate-900/50 p-4 text-sm leading-7 text-[var(--bps-muted)]">
                                <p>
                                    <span className="font-semibold text-[var(--bps-text)]">
                                        Minimal sync:
                                    </span>{' '}
                                    lakukan sinkronisasi saat login untuk nama,
                                    username, email, password hash, email
                                    verified, dan organization type.
                                </p>
                                <p>
                                    <span className="font-semibold text-[var(--bps-text)]">
                                        Extended sync:
                                    </span>{' '}
                                    tambahkan sinkronisasi 2FA lokal jika
                                    aplikasi client juga memakai Fortify atau
                                    mekanisme 2FA serupa.
                                </p>
                                <p>
                                    <span className="font-semibold text-[var(--bps-text)]">
                                        Periodic sync:
                                    </span>{' '}
                                    jika aplikasi perlu mirror user SSO secara
                                    berkala, buat command/job terjadwal dan
                                    gunakan endpoint daftar user atau endpoint
                                    admin khusus.
                                </p>
                            </div>
                            <CodeBlock
                                label="Contoh periodic sync"
                                value={snippets.periodic}
                                copyKey="periodic"
                                copied={copied}
                                onCopy={copyText}
                            />
                        </section>
                    </GlassCard>

                    <div className="space-y-6">
                        <GlassCard className="p-4 sm:p-6">
                            <h2 className="text-lg font-bold text-[var(--bps-text)]">
                                Checklist Implementasi
                            </h2>
                            <ul className="mt-3 space-y-2 text-sm text-[var(--bps-muted)]">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-4 w-4 text-[#61a95a]" />{' '}
                                    Callback URL di client sama persis dengan
                                    yang didaftarkan di SSO.
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-4 w-4 text-[#61a95a]" />{' '}
                                    Client ID dan secret disimpan di environment
                                    server.
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-4 w-4 text-[#61a95a]" />{' '}
                                    Client memvalidasi organization type saat
                                    callback.
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-4 w-4 text-[#61a95a]" />{' '}
                                    Sinkronisasi user lokal dijalankan di setiap
                                    login SSO.
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-4 w-4 text-[#61a95a]" />{' '}
                                    User baru tidak langsung diberi role tinggi;
                                    mulai dari Guest/read-only lalu elevasi
                                    manual.
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-4 w-4 text-[#61a95a]" />{' '}
                                    Jika 2FA lokal dipakai, secret dan recovery
                                    codes dienkripsi ulang dengan key aplikasi
                                    client.
                                </li>
                            </ul>
                        </GlassCard>

                        <GlassCard className="p-4 sm:p-6">
                            <h2 className="text-lg font-bold text-[var(--bps-text)]">
                                Aturan Organization
                            </h2>
                            <div className="mt-3 space-y-3 text-sm leading-7 text-[var(--bps-muted)]">
                                <p>
                                    1. SSO admin mengatur allowed organization
                                    types di konfigurasi aplikasi.
                                </p>
                                <p>
                                    2. Halaman katalog `/applications` hanya
                                    menampilkan aplikasi yang eligible untuk
                                    organisasi user.
                                </p>
                                <p>
                                    3. Endpoint authorize juga memblokir user
                                    jika organization type tidak diizinkan.
                                </p>
                                <p>
                                    4. Aplikasi client tetap harus menerapkan
                                    allow-list sendiri karena tiap aplikasi bisa
                                    punya aturan lokal tambahan.
                                </p>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-4 sm:p-6">
                            <h2 className="text-lg font-bold text-[var(--bps-text)]">
                                Troubleshooting Cepat
                            </h2>
                            <div className="mt-3 space-y-3 text-sm leading-7 text-[var(--bps-muted)]">
                                <p>
                                    Jika mendapat{' '}
                                    <span className="font-mono text-[var(--bps-text)]">
                                        invalid_client
                                    </span>
                                    , sinkronkan ulang client ID/secret setelah
                                    secret diregenerasi di SSO.
                                </p>
                                <p>
                                    Jika mendapat{' '}
                                    <span className="font-mono text-[var(--bps-text)]">
                                        redirect_uri_mismatch
                                    </span>
                                    , cocokkan callback URL di aplikasi client
                                    dengan konfigurasi admin SSO.
                                </p>
                                <p>
                                    Jika user berhasil login di SSO tapi ditolak
                                    di client, cek nilai{' '}
                                    <span className="font-mono text-[var(--bps-text)]">
                                        SSO_ALLOWED_ORGANIZATION_TYPES
                                    </span>{' '}
                                    dan organization type pada profile.
                                </p>
                                <p>
                                    Jika 2FA lokal tidak ikut aktif, pastikan
                                    aplikasi client membaca payload{' '}
                                    <span className="font-mono text-[var(--bps-text)]">
                                        two_factor.secret
                                    </span>{' '}
                                    dan menyimpannya ulang dengan enkripsi
                                    lokal, bukan menyalin ciphertext dari SSO.
                                </p>
                                <p>
                                    Jika muncul{' '}
                                    <span className="font-mono text-[var(--bps-text)]">
                                        unsupported_grant_type
                                    </span>
                                    , user membuka authorize endpoint tanpa
                                    parameter OAuth lengkap. Selalu masuk
                                    melalui{' '}
                                    <span className="font-mono text-[var(--bps-text)]">
                                        /auth/sso/redirect
                                    </span>
                                    .
                                </p>
                            </div>
                        </GlassCard>

                        <GlassCard>
                            <h2 className="text-lg font-bold text-[var(--bps-text)]">
                                Catatan Operasional
                            </h2>
                            <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--bps-muted)]">
                                <li>
                                    1. Profile sync on-login adalah opsi paling
                                    sederhana dan cukup untuk sebagian besar
                                    aplikasi.
                                </li>
                                <li>
                                    2. Periodic sync cocok untuk aplikasi yang
                                    perlu mirror user walaupun user belum login.
                                </li>
                                <li>
                                    3. Password yang disinkronkan adalah{' '}
                                    <span className="font-mono text-[var(--bps-text)]">
                                        hash
                                    </span>
                                    , bukan plaintext.
                                </li>
                                <li>
                                    4. Role lokal sebaiknya tidak diambil mentah
                                    dari payload SSO; gunakan default role minim
                                    risiko seperti Guest sampai ada approval
                                    lokal.
                                </li>
                                <li>
                                    5. Untuk aplikasi tanpa kolom 2FA lokal,
                                    cukup sync field identity/security yang
                                    tersedia.
                                </li>
                                <li>
                                    6. Setelah deploy perubahan payload profile,
                                    restart server app/client dan bersihkan
                                    cache konfigurasi bila perlu.
                                </li>
                            </ul>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
