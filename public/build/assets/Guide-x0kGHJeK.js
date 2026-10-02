import{r as h,j as e,H as f,L as y}from"./app-C8J8ksEQ.js";import{G as o}from"./GlassCard-BaiSiKpM.js";import{A as j,P as _}from"./AppLayout-CI39ETjK.js";import{S as v}from"./ThemeToggle-Bf_Z8d-Q.js";import{A as S}from"./arrow-left-By43xrw8.js";import{D as N}from"./download-BITOo0An.js";import{C as l}from"./circle-check-big-Bp4vmFa-.js";import{C as $}from"./copy-I6ng-T4e.js";/* empty css            */import"./ToastViewport-DCt7q1Id.js";function r({label:a,value:t,copyKey:s,copied:d,onCopy:c}){return e.jsxs("div",{className:"theme-code min-w-0 rounded-xl p-3 sm:p-4",children:[e.jsxs("div",{className:"mb-2 flex flex-wrap items-center justify-between gap-3",children:[e.jsx("p",{className:"text-xs font-semibold uppercase tracking-[0.22em] text-[var(--bps-muted)]",children:a}),e.jsxs("button",{onClick:()=>c(t,s),className:"inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-[var(--bps-surface-soft)] px-3 py-1.5 text-xs font-medium text-[var(--bps-muted)] transition hover:brightness-95 hover:text-[var(--bps-text)]",children:[e.jsx($,{className:"h-3.5 w-3.5"}),d===s?"Tersalin!":"Salin"]})]}),e.jsx(v,{axis:"horizontal",viewportClassName:"pb-2",children:e.jsx("pre",{className:"whitespace-pre-wrap break-all text-xs leading-6 text-[var(--bps-text)]",children:e.jsx("code",{children:t})})})]})}function F({application:a,appUrl:t}){const[s,d]=h.useState(null),c=`${t}/oauth/authorize`,p=`${t}/oauth/token`,m=`${t}/api/user`,u=`${t}/api/users`,k=a.allowed_organization_types.length>0?a.allowed_organization_types.join(", "):"semua organisasi aktif",x=a.allowed_organization_types.length>0?a.allowed_organization_types.join(","):"internal",i=h.useMemo(()=>({env:`SSO_BASE_URL=${t}
SSO_CLIENT_ID=${a.oauth_client?.id??"your-client-id"}
SSO_CLIENT_SECRET=${a.oauth_client?.secret??"regenerate-secret-first"}
SSO_REDIRECT_URI=${a.callback_url}
SSO_REGISTER_URL=${t}/register
SSO_USER_ENDPOINT=/api/user
SSO_ALLOWED_ORGANIZATION_TYPES=${x}`,routes:`Route::get('/auth/sso/redirect', [SsoOAuthController::class, 'redirect'])->name('sso.redirect');
Route::get('/auth/sso/callback', [SsoOAuthController::class, 'callback'])->name('sso.callback');
Route::post('/auth/sso/logout', [SsoOAuthController::class, 'logout'])->name('sso.logout');`,redirect:`public function redirect(Request $request): RedirectResponse
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
}`,callback:`public function callback(Request $request): RedirectResponse
{
    abort_if($request->session()->pull('sso_oauth_state') !== $request->string('state')->toString(), 403);

    $tokenResponse = Http::asForm()->acceptJson()->post('${p}', [
        'grant_type' => 'authorization_code',
        'client_id' => config('services.sso.client_id'),
        'client_secret' => config('services.sso.client_secret'),
        'redirect_uri' => route('sso.callback'),
        'code' => $request->string('code')->toString(),
    ]);

    $accessToken = (string) $tokenResponse->json('access_token');
    $profile = Http::withToken($accessToken)->acceptJson()->get('${m}')->json();

    // lanjutkan ke guard organisasi + sync user lokal
}`,organization:`private function isAllowedOrganizationType(?string $organizationType): bool
{
    $allowedTypes = config('services.sso.allowed_organization_types', []);

    if ($allowedTypes === []) {
        return true;
    }

    return is_string($organizationType)
        && $organizationType !== ''
        && in_array($organizationType, $allowedTypes, true);
}

$organizationType = data_get($profile, 'organization.type')
    ?? data_get($profile, 'organization_type');

if (! $this->isAllowedOrganizationType($organizationType)) {
    return redirect()->route('login')->with('error', 'Akun Anda tidak diizinkan mengakses aplikasi ini berdasarkan organisasi.');
}`,sync:`private function resolveSsoSynchronizationAttributes(array $profile): array
{
    return [
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
    ];
}

$user->forceFill([
    'sso_user_id' => data_get($profile, 'id'),
    ...array_filter($this->resolveSsoSynchronizationAttributes($profile), fn ($value) => ! is_null($value)),
])->save();

// Jangan auto-elevate role dari payload SSO atau jenis organisasi.
// Jika user baru butuh role awal, gunakan role paling minim risiko
// seperti Guest dan minta admin aplikasi melakukan approval/elevasi manual.`,profile:`{
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
}`,periodic:`// Opsi 1: cukup sync saat login (disarankan untuk mayoritas aplikasi)
// Opsi 2: sinkronisasi periodik untuk kebutuhan identity mirror

class SyncUsersFromSso extends Command
{
    public function handle(): int
    {
        $response = Http::withToken($adminAccessToken)->get('${u}');

        foreach ($response->json() as $profile) {
            User::query()->updateOrCreate(
                ['sso_user_id' => data_get($profile, 'id')],
                [
                    'name' => data_get($profile, 'name'),
                    'username' => data_get($profile, 'username'),
                    'email' => data_get($profile, 'email'),
                    'email_verified_at' => data_get($profile, 'email_verified_at'),
                ],
            );
        }

        return self::SUCCESS;
    }
}`}),[x,t,a.callback_url,a.oauth_client?.id,a.oauth_client?.secret,u,m,p]),n=(g,b)=>{navigator.clipboard.writeText(g),d(b),setTimeout(()=>d(null),2e3)};return e.jsxs(j,{children:[e.jsx(f,{title:`Panduan - ${a.name}`}),e.jsxs("div",{className:"space-y-6",children:[e.jsx(_,{title:"Panduan integrasi",description:`Panduan OAuth2 dan sinkronisasi pengguna untuk ${a.name}.`,actions:e.jsxs(e.Fragment,{children:[e.jsxs(y,{href:`/admin/applications/${a.route_key}`,className:"inline-flex items-center gap-2 rounded-lg border border-[var(--bps-border)] px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-[var(--bps-text)]",children:[e.jsx(S,{className:"h-4 w-4"})," Detail aplikasi"]}),e.jsxs("a",{href:`/admin/applications/${a.route_key}/guide/export-pdf`,className:"inline-flex items-center gap-2 rounded-lg border border-[var(--bps-border)] px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-[var(--bps-text)]",children:[e.jsx(N,{className:"h-4 w-4"})," PDF"]})]})}),e.jsxs("div",{className:"grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(420px,0.8fr)]",children:[e.jsxs(o,{className:"space-y-6 p-4 sm:p-6",children:[e.jsxs("section",{className:"space-y-3",children:[e.jsx("h2",{className:"text-xl font-bold text-[var(--bps-text)]",children:"1. Ringkasan Kontrak Integrasi"}),e.jsxs("div",{className:"rounded-xl border border-[var(--bps-border)] bg-[var(--bps-surface-soft)] p-4 text-sm leading-7 text-[var(--bps-muted)]",children:[e.jsxs("p",{children:[e.jsx("span",{className:"font-semibold text-[var(--bps-text)]",children:"Authorize endpoint:"})," ",c]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-semibold text-[var(--bps-text)]",children:"Token endpoint:"})," ",p]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-semibold text-[var(--bps-text)]",children:"Profile endpoint:"})," ",m]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-semibold text-[var(--bps-text)]",children:"Allowed organization types:"})," ",k]}),e.jsx("p",{className:"mt-2 text-[var(--bps-text)]/65",children:"Aplikasi client harus memvalidasi organisasi user saat callback dan menyinkronkan data lokal setiap kali user login via SSO."})]})]}),e.jsxs("section",{className:"space-y-3",children:[e.jsx("h2",{className:"text-xl font-bold text-[var(--bps-text)]",children:"2. Konfigurasi Environment"}),e.jsx("p",{className:"text-sm text-[var(--bps-muted)]",children:"Simpan kredensial SSO di server aplikasi client. Sertakan allow-list organisasi di aplikasi agar guard di client konsisten dengan kebijakan akses di SSO."}),e.jsx(r,{label:".env",value:i.env,copyKey:"env",copied:s,onCopy:n})]}),e.jsxs("section",{className:"space-y-3",children:[e.jsx("h2",{className:"text-xl font-bold text-[var(--bps-text)]",children:"3. Tahap 1: Daftarkan Route Client"}),e.jsx("p",{className:"text-sm text-[var(--bps-muted)]",children:"Minimal ada endpoint redirect, callback, dan logout lokal. Endpoint redirect adalah pintu masuk resmi untuk login SSO."}),e.jsx(r,{label:"routes/web.php",value:i.routes,copyKey:"routes",copied:s,onCopy:n})]}),e.jsxs("section",{className:"space-y-3",children:[e.jsx("h2",{className:"text-xl font-bold text-[var(--bps-text)]",children:"4. Tahap 2: Buat Redirect ke SSO"}),e.jsx("p",{className:"text-sm text-[var(--bps-muted)]",children:"Simpan state acak di session, lalu bangun query OAuth lengkap. Jangan arahkan user ke authorize URL kosong."}),e.jsx(r,{label:"SsoOAuthController::redirect()",value:i.redirect,copyKey:"redirect",copied:s,onCopy:n})]}),e.jsxs("section",{className:"space-y-3",children:[e.jsx("h2",{className:"text-xl font-bold text-[var(--bps-text)]",children:"5. Tahap 3: Callback, Token Exchange, dan Fetch Profile"}),e.jsx("p",{className:"text-sm text-[var(--bps-muted)]",children:"Verifikasi state, tukar authorization code menjadi access token, lalu ambil profil user dari endpoint profile."}),e.jsx(r,{label:"SsoOAuthController::callback()",value:i.callback,copyKey:"callback",copied:s,onCopy:n})]}),e.jsxs("section",{className:"space-y-3",children:[e.jsx("h2",{className:"text-xl font-bold text-[var(--bps-text)]",children:"6. Tahap 4: Guard Organisasi"}),e.jsx("p",{className:"text-sm text-[var(--bps-muted)]",children:"SSO sudah memblokir authorize untuk organisasi yang tidak cocok. Client tetap perlu memvalidasi ulang agar user tidak bisa masuk jika konfigurasi lokal lebih ketat."}),e.jsx(r,{label:"Guard organization type",value:i.organization,copyKey:"organization",copied:s,onCopy:n})]}),e.jsxs("section",{className:"space-y-3",children:[e.jsx("h2",{className:"text-xl font-bold text-[var(--bps-text)]",children:"7. Tahap 5: Sinkronisasi User Lokal di Setiap Login"}),e.jsx("p",{className:"text-sm text-[var(--bps-muted)]",children:"Setelah profil diterima, sinkronkan field lokal yang dibutuhkan aplikasi. Minimal: nama, username, email, email verified, dan password hash. Jika aplikasi mendukung 2FA lokal, salin data 2FA dari payload profile dan enkripsi ulang dengan key aplikasi client."}),e.jsxs("div",{className:"theme-warning rounded-xl p-4 text-sm leading-7",children:[e.jsx("p",{className:"font-semibold text-current",children:"Warning keamanan role"}),e.jsx("p",{children:"Jangan jadikan data organisasi atau payload SSO sebagai alasan untuk langsung memberi role CRUD. Untuk user baru, pakai role lokal paling minim risiko seperti Guest atau role read-only serupa, lalu minta approval admin aplikasi sebelum role dinaikkan."})]}),e.jsx(r,{label:"Helper sinkronisasi user",value:i.sync,copyKey:"sync",copied:s,onCopy:n})]}),e.jsxs("section",{className:"space-y-3",children:[e.jsx("h2",{className:"text-xl font-bold text-[var(--bps-text)]",children:"8. Payload Profil dari SSO"}),e.jsx("p",{className:"text-sm text-[var(--bps-muted)]",children:"Kontrak profile saat ini mendukung sinkronisasi identity, password hash, organization, dan two-factor. Gunakan ini sebagai acuan implementasi di aplikasi client."}),e.jsx(r,{label:"GET /api/user",value:i.profile,copyKey:"profile",copied:s,onCopy:n})]}),e.jsxs("section",{className:"space-y-3",children:[e.jsx("h2",{className:"text-xl font-bold text-[var(--bps-text)]",children:"9. Panduan Sinkronisasi Data Sesuai Kebutuhan"}),e.jsxs("div",{className:"space-y-3 rounded-xl border border-[var(--bps-border)] bg-[var(--bps-surface-soft)] p-4 text-sm leading-7 text-[var(--bps-muted)]",children:[e.jsxs("p",{children:[e.jsx("span",{className:"font-semibold text-[var(--bps-text)]",children:"Minimal sync:"})," ","lakukan sinkronisasi saat login untuk nama, username, email, password hash, email verified, dan organization type."]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-semibold text-[var(--bps-text)]",children:"Extended sync:"})," ","tambahkan sinkronisasi 2FA lokal jika aplikasi client juga memakai Fortify atau mekanisme 2FA serupa."]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-semibold text-[var(--bps-text)]",children:"Periodic sync:"})," ","jika aplikasi perlu mirror user SSO secara berkala, buat command/job terjadwal dan gunakan endpoint daftar user atau endpoint admin khusus."]})]}),e.jsx(r,{label:"Contoh periodic sync",value:i.periodic,copyKey:"periodic",copied:s,onCopy:n})]})]}),e.jsxs("div",{className:"space-y-6",children:[e.jsxs(o,{className:"p-4 sm:p-6",children:[e.jsx("h2",{className:"text-lg font-bold text-[var(--bps-text)]",children:"Checklist Implementasi"}),e.jsxs("ul",{className:"mt-3 space-y-2 text-sm text-[var(--bps-muted)]",children:[e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx(l,{className:"mt-0.5 h-4 w-4 text-[#61a95a]"})," ","Callback URL di client sama persis dengan yang didaftarkan di SSO."]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx(l,{className:"mt-0.5 h-4 w-4 text-[#61a95a]"})," ","Client ID dan secret disimpan di environment server."]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx(l,{className:"mt-0.5 h-4 w-4 text-[#61a95a]"})," ","Client memvalidasi organization type saat callback."]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx(l,{className:"mt-0.5 h-4 w-4 text-[#61a95a]"})," ","Sinkronisasi user lokal dijalankan di setiap login SSO."]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx(l,{className:"mt-0.5 h-4 w-4 text-[#61a95a]"})," ","User baru tidak langsung diberi role tinggi; mulai dari Guest/read-only lalu elevasi manual."]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx(l,{className:"mt-0.5 h-4 w-4 text-[#61a95a]"})," ","Jika 2FA lokal dipakai, secret dan recovery codes dienkripsi ulang dengan key aplikasi client."]})]})]}),e.jsxs(o,{className:"p-4 sm:p-6",children:[e.jsx("h2",{className:"text-lg font-bold text-[var(--bps-text)]",children:"Aturan Organization"}),e.jsxs("div",{className:"mt-3 space-y-3 text-sm leading-7 text-[var(--bps-muted)]",children:[e.jsx("p",{children:"1. SSO admin mengatur allowed organization types di konfigurasi aplikasi."}),e.jsx("p",{children:"2. Halaman katalog `/applications` hanya menampilkan aplikasi yang eligible untuk organisasi user."}),e.jsx("p",{children:"3. Endpoint authorize juga memblokir user jika organization type tidak diizinkan."}),e.jsx("p",{children:"4. Aplikasi client tetap harus menerapkan allow-list sendiri karena tiap aplikasi bisa punya aturan lokal tambahan."})]})]}),e.jsxs(o,{className:"p-4 sm:p-6",children:[e.jsx("h2",{className:"text-lg font-bold text-[var(--bps-text)]",children:"Troubleshooting Cepat"}),e.jsxs("div",{className:"mt-3 space-y-3 text-sm leading-7 text-[var(--bps-muted)]",children:[e.jsxs("p",{children:["Jika mendapat"," ",e.jsx("span",{className:"font-mono text-[var(--bps-text)]",children:"invalid_client"}),", sinkronkan ulang client ID/secret setelah secret diregenerasi di SSO."]}),e.jsxs("p",{children:["Jika mendapat"," ",e.jsx("span",{className:"font-mono text-[var(--bps-text)]",children:"redirect_uri_mismatch"}),", cocokkan callback URL di aplikasi client dengan konfigurasi admin SSO."]}),e.jsxs("p",{children:["Jika user berhasil login di SSO tapi ditolak di client, cek nilai"," ",e.jsx("span",{className:"font-mono text-[var(--bps-text)]",children:"SSO_ALLOWED_ORGANIZATION_TYPES"})," ","dan organization type pada profile."]}),e.jsxs("p",{children:["Jika 2FA lokal tidak ikut aktif, pastikan aplikasi client membaca payload"," ",e.jsx("span",{className:"font-mono text-[var(--bps-text)]",children:"two_factor.secret"})," ","dan menyimpannya ulang dengan enkripsi lokal, bukan menyalin ciphertext dari SSO."]}),e.jsxs("p",{children:["Jika muncul"," ",e.jsx("span",{className:"font-mono text-[var(--bps-text)]",children:"unsupported_grant_type"}),", user membuka authorize endpoint tanpa parameter OAuth lengkap. Selalu masuk melalui"," ",e.jsx("span",{className:"font-mono text-[var(--bps-text)]",children:"/auth/sso/redirect"}),"."]})]})]}),e.jsxs(o,{children:[e.jsx("h2",{className:"text-lg font-bold text-[var(--bps-text)]",children:"Catatan Operasional"}),e.jsxs("ul",{className:"mt-3 space-y-2 text-sm leading-7 text-[var(--bps-muted)]",children:[e.jsx("li",{children:"1. Profile sync on-login adalah opsi paling sederhana dan cukup untuk sebagian besar aplikasi."}),e.jsx("li",{children:"2. Periodic sync cocok untuk aplikasi yang perlu mirror user walaupun user belum login."}),e.jsxs("li",{children:["3. Password yang disinkronkan adalah"," ",e.jsx("span",{className:"font-mono text-[var(--bps-text)]",children:"hash"}),", bukan plaintext."]}),e.jsx("li",{children:"4. Role lokal sebaiknya tidak diambil mentah dari payload SSO; gunakan default role minim risiko seperti Guest sampai ada approval lokal."}),e.jsx("li",{children:"5. Untuk aplikasi tanpa kolom 2FA lokal, cukup sync field identity/security yang tersedia."}),e.jsx("li",{children:"6. Setelah deploy perubahan payload profile, restart server app/client dan bersihkan cache konfigurasi bila perlu."})]})]})]})]})]})]})}export{F as default};
