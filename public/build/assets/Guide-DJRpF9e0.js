import{r as x,j as e,H as j,L as k}from"./app-CWL2Ix9C.js";import{B as b}from"./Button-CehmB396.js";import{A as _,G as o}from"./AppLayout-1NZZbqL_.js";import{A as w}from"./arrow-left-dBQiRuZD.js";import{D as N}from"./download-DniJiT8R.js";import{C as r}from"./circle-check-big-BuYRtjiz.js";import{C as S}from"./copy-DmOKTGIK.js";/* empty css            */import"./AppIcon-DS1kv0gE.js";import"./ToastViewport-cHskvSws.js";import"./shield-FrmVtm6P.js";function l({label:a,value:i,copyKey:s,copied:d,onCopy:c}){return e.jsxs("div",{className:"min-w-0 rounded-xl bg-black/40 p-3 sm:p-4",children:[e.jsxs("div",{className:"mb-2 flex flex-wrap items-center justify-between gap-3",children:[e.jsx("p",{className:"text-xs font-semibold uppercase tracking-[0.22em] text-white/45",children:a}),e.jsxs("button",{onClick:()=>c(i,s),className:"inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/75 transition hover:bg-white/20 hover:text-white",children:[e.jsx(S,{className:"h-3.5 w-3.5"}),d===s?"Tersalin!":"Salin"]})]}),e.jsx("pre",{className:"overflow-x-auto whitespace-pre-wrap break-all text-xs leading-6 text-white/90",children:e.jsx("code",{children:i})})]})}function P({application:a,appUrl:i}){const[s,d]=x.useState(null),c=`${i}/oauth/authorize`,m=`${i}/oauth/token`,p=`${i}/api/user`,u=`${i}/api/users`,g=a.allowed_organization_types.length>0?a.allowed_organization_types.join(", "):"semua organisasi aktif",h=a.allowed_organization_types.length>0?a.allowed_organization_types.join(","):"internal",t=x.useMemo(()=>({env:`SSO_BASE_URL=${i}
SSO_CLIENT_ID=${a.oauth_client?.id??"your-client-id"}
SSO_CLIENT_SECRET=${a.oauth_client?.secret??"regenerate-secret-first"}
SSO_REDIRECT_URI=${a.callback_url}
SSO_REGISTER_URL=${i}/register
SSO_USER_ENDPOINT=/api/user
SSO_ALLOWED_ORGANIZATION_TYPES=${h}`,routes:`Route::get('/auth/sso/redirect', [SsoOAuthController::class, 'redirect'])->name('sso.redirect');
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

    $tokenResponse = Http::asForm()->acceptJson()->post('${m}', [
        'grant_type' => 'authorization_code',
        'client_id' => config('services.sso.client_id'),
        'client_secret' => config('services.sso.client_secret'),
        'redirect_uri' => route('sso.callback'),
        'code' => $request->string('code')->toString(),
    ]);

    $accessToken = (string) $tokenResponse->json('access_token');
    $profile = Http::withToken($accessToken)->acceptJson()->get('${p}')->json();

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
}`}),[h,i,a.callback_url,a.oauth_client?.id,a.oauth_client?.secret,u,p,m]),n=(f,y)=>{navigator.clipboard.writeText(f),d(y),setTimeout(()=>d(null),2e3)};return e.jsxs(_,{children:[e.jsx(j,{title:`Panduan - ${a.name}`}),e.jsxs("div",{className:"mx-auto max-w-6xl space-y-8 px-1 py-8 sm:px-6 sm:py-12 lg:px-8",children:[e.jsxs("div",{className:"flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",children:[e.jsxs(k,{href:`/admin/applications/${a.route_key}`,className:"inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-xl transition hover:bg-white/20",children:[e.jsx(w,{className:"h-4 w-4"}),"Kembali ke detail aplikasi"]}),e.jsxs("div",{className:"flex flex-wrap items-center gap-2 sm:justify-end",children:[e.jsxs("a",{href:`/admin/applications/${a.route_key}/guide/export-pdf`,className:"inline-flex items-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-500/30",children:[e.jsx(N,{className:"h-4 w-4"}),"Export PDF"]}),e.jsx(k,{href:`/admin/applications/${a.route_key}/edit`,children:e.jsx(b,{children:"Edit Konfigurasi"})})]})]}),e.jsxs("div",{className:"px-1 sm:px-0",children:[e.jsx("h1",{className:"bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-3xl font-black text-transparent drop-shadow-xl sm:text-5xl",children:"Panduan Integrasi OAuth2 + Sinkronisasi User"}),e.jsxs("p",{className:"mt-2 max-w-4xl text-sm text-white/80 sm:text-base",children:["Panduan implementasi ",a.name," ke SSO, termasuk guard organisasi, alur callback, sinkronisasi user lokal di setiap login, dan opsi sinkronisasi lanjutan sesuai kebutuhan aplikasi."]})]}),e.jsxs("div",{className:"grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]",children:[e.jsxs(o,{className:"space-y-6 p-4 sm:p-6",children:[e.jsxs("section",{className:"space-y-3",children:[e.jsx("h2",{className:"text-xl font-bold text-white",children:"1. Ringkasan Kontrak Integrasi"}),e.jsxs("div",{className:"rounded-xl border border-white/15 bg-white/5 p-4 text-sm leading-7 text-white/80",children:[e.jsxs("p",{children:[e.jsx("span",{className:"font-semibold text-white",children:"Authorize endpoint:"})," ",c]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-semibold text-white",children:"Token endpoint:"})," ",m]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-semibold text-white",children:"Profile endpoint:"})," ",p]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-semibold text-white",children:"Allowed organization types:"})," ",g]}),e.jsx("p",{className:"mt-2 text-white/65",children:"Aplikasi client harus memvalidasi organisasi user saat callback dan menyinkronkan data lokal setiap kali user login via SSO."})]})]}),e.jsxs("section",{className:"space-y-3",children:[e.jsx("h2",{className:"text-xl font-bold text-white",children:"2. Konfigurasi Environment"}),e.jsx("p",{className:"text-sm text-white/70",children:"Simpan kredensial SSO di server aplikasi client. Sertakan allow-list organisasi di aplikasi agar guard di client konsisten dengan kebijakan akses di SSO."}),e.jsx(l,{label:".env",value:t.env,copyKey:"env",copied:s,onCopy:n})]}),e.jsxs("section",{className:"space-y-3",children:[e.jsx("h2",{className:"text-xl font-bold text-white",children:"3. Tahap 1: Daftarkan Route Client"}),e.jsx("p",{className:"text-sm text-white/70",children:"Minimal ada endpoint redirect, callback, dan logout lokal. Endpoint redirect adalah pintu masuk resmi untuk login SSO."}),e.jsx(l,{label:"routes/web.php",value:t.routes,copyKey:"routes",copied:s,onCopy:n})]}),e.jsxs("section",{className:"space-y-3",children:[e.jsx("h2",{className:"text-xl font-bold text-white",children:"4. Tahap 2: Buat Redirect ke SSO"}),e.jsx("p",{className:"text-sm text-white/70",children:"Simpan state acak di session, lalu bangun query OAuth lengkap. Jangan arahkan user ke authorize URL kosong."}),e.jsx(l,{label:"SsoOAuthController::redirect()",value:t.redirect,copyKey:"redirect",copied:s,onCopy:n})]}),e.jsxs("section",{className:"space-y-3",children:[e.jsx("h2",{className:"text-xl font-bold text-white",children:"5. Tahap 3: Callback, Token Exchange, dan Fetch Profile"}),e.jsx("p",{className:"text-sm text-white/70",children:"Verifikasi state, tukar authorization code menjadi access token, lalu ambil profil user dari endpoint profile."}),e.jsx(l,{label:"SsoOAuthController::callback()",value:t.callback,copyKey:"callback",copied:s,onCopy:n})]}),e.jsxs("section",{className:"space-y-3",children:[e.jsx("h2",{className:"text-xl font-bold text-white",children:"6. Tahap 4: Guard Organisasi"}),e.jsx("p",{className:"text-sm text-white/70",children:"SSO sudah memblokir authorize untuk organisasi yang tidak cocok. Client tetap perlu memvalidasi ulang agar user tidak bisa masuk jika konfigurasi lokal lebih ketat."}),e.jsx(l,{label:"Guard organization type",value:t.organization,copyKey:"organization",copied:s,onCopy:n})]}),e.jsxs("section",{className:"space-y-3",children:[e.jsx("h2",{className:"text-xl font-bold text-white",children:"7. Tahap 5: Sinkronisasi User Lokal di Setiap Login"}),e.jsx("p",{className:"text-sm text-white/70",children:"Setelah profil diterima, sinkronkan field lokal yang dibutuhkan aplikasi. Minimal: nama, username, email, email verified, dan password hash. Jika aplikasi mendukung 2FA lokal, salin data 2FA dari payload profile dan enkripsi ulang dengan key aplikasi client."}),e.jsxs("div",{className:"rounded-xl border border-amber-300/35 bg-amber-500/10 p-4 text-sm leading-7 text-amber-50/90",children:[e.jsx("p",{className:"font-semibold text-amber-100",children:"Warning keamanan role"}),e.jsx("p",{children:"Jangan jadikan data organisasi atau payload SSO sebagai alasan untuk langsung memberi role CRUD. Untuk user baru, pakai role lokal paling minim risiko seperti Guest atau role read-only serupa, lalu minta approval admin aplikasi sebelum role dinaikkan."})]}),e.jsx(l,{label:"Helper sinkronisasi user",value:t.sync,copyKey:"sync",copied:s,onCopy:n})]}),e.jsxs("section",{className:"space-y-3",children:[e.jsx("h2",{className:"text-xl font-bold text-white",children:"8. Payload Profil dari SSO"}),e.jsx("p",{className:"text-sm text-white/70",children:"Kontrak profile saat ini mendukung sinkronisasi identity, password hash, organization, dan two-factor. Gunakan ini sebagai acuan implementasi di aplikasi client."}),e.jsx(l,{label:"GET /api/user",value:t.profile,copyKey:"profile",copied:s,onCopy:n})]}),e.jsxs("section",{className:"space-y-3",children:[e.jsx("h2",{className:"text-xl font-bold text-white",children:"9. Panduan Sinkronisasi Data Sesuai Kebutuhan"}),e.jsxs("div",{className:"space-y-3 rounded-xl border border-white/15 bg-white/5 p-4 text-sm leading-7 text-white/80",children:[e.jsxs("p",{children:[e.jsx("span",{className:"font-semibold text-white",children:"Minimal sync:"})," ","lakukan sinkronisasi saat login untuk nama, username, email, password hash, email verified, dan organization type."]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-semibold text-white",children:"Extended sync:"})," ","tambahkan sinkronisasi 2FA lokal jika aplikasi client juga memakai Fortify atau mekanisme 2FA serupa."]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-semibold text-white",children:"Periodic sync:"})," ","jika aplikasi perlu mirror user SSO secara berkala, buat command/job terjadwal dan gunakan endpoint daftar user atau endpoint admin khusus."]})]}),e.jsx(l,{label:"Contoh periodic sync",value:t.periodic,copyKey:"periodic",copied:s,onCopy:n})]})]}),e.jsxs("div",{className:"space-y-6",children:[e.jsxs(o,{className:"p-4 sm:p-6",children:[e.jsx("h2",{className:"text-lg font-bold text-white",children:"Checklist Implementasi"}),e.jsxs("ul",{className:"mt-3 space-y-2 text-sm text-white/80",children:[e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx(r,{className:"mt-0.5 h-4 w-4 text-emerald-300"})," ","Callback URL di client sama persis dengan yang didaftarkan di SSO."]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx(r,{className:"mt-0.5 h-4 w-4 text-emerald-300"})," ","Client ID dan secret disimpan di environment server."]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx(r,{className:"mt-0.5 h-4 w-4 text-emerald-300"})," ","Client memvalidasi organization type saat callback."]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx(r,{className:"mt-0.5 h-4 w-4 text-emerald-300"})," ","Sinkronisasi user lokal dijalankan di setiap login SSO."]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx(r,{className:"mt-0.5 h-4 w-4 text-emerald-300"})," ","User baru tidak langsung diberi role tinggi; mulai dari Guest/read-only lalu elevasi manual."]}),e.jsxs("li",{className:"flex items-start gap-2",children:[e.jsx(r,{className:"mt-0.5 h-4 w-4 text-emerald-300"})," ","Jika 2FA lokal dipakai, secret dan recovery codes dienkripsi ulang dengan key aplikasi client."]})]})]}),e.jsxs(o,{className:"p-4 sm:p-6",children:[e.jsx("h2",{className:"text-lg font-bold text-white",children:"Aturan Organization"}),e.jsxs("div",{className:"mt-3 space-y-3 text-sm leading-7 text-white/75",children:[e.jsx("p",{children:"1. SSO admin mengatur allowed organization types di konfigurasi aplikasi."}),e.jsx("p",{children:"2. Halaman katalog `/applications` hanya menampilkan aplikasi yang eligible untuk organisasi user."}),e.jsx("p",{children:"3. Endpoint authorize juga memblokir user jika organization type tidak diizinkan."}),e.jsx("p",{children:"4. Aplikasi client tetap harus menerapkan allow-list sendiri karena tiap aplikasi bisa punya aturan lokal tambahan."})]})]}),e.jsxs(o,{className:"p-4 sm:p-6",children:[e.jsx("h2",{className:"text-lg font-bold text-white",children:"Troubleshooting Cepat"}),e.jsxs("div",{className:"mt-3 space-y-3 text-sm leading-7 text-white/75",children:[e.jsxs("p",{children:["Jika mendapat"," ",e.jsx("span",{className:"font-mono text-white",children:"invalid_client"}),", sinkronkan ulang client ID/secret setelah secret diregenerasi di SSO."]}),e.jsxs("p",{children:["Jika mendapat"," ",e.jsx("span",{className:"font-mono text-white",children:"redirect_uri_mismatch"}),", cocokkan callback URL di aplikasi client dengan konfigurasi admin SSO."]}),e.jsxs("p",{children:["Jika user berhasil login di SSO tapi ditolak di client, cek nilai"," ",e.jsx("span",{className:"font-mono text-white",children:"SSO_ALLOWED_ORGANIZATION_TYPES"})," ","dan organization type pada profile."]}),e.jsxs("p",{children:["Jika 2FA lokal tidak ikut aktif, pastikan aplikasi client membaca payload"," ",e.jsx("span",{className:"font-mono text-white",children:"two_factor.secret"})," ","dan menyimpannya ulang dengan enkripsi lokal, bukan menyalin ciphertext dari SSO."]}),e.jsxs("p",{children:["Jika muncul"," ",e.jsx("span",{className:"font-mono text-white",children:"unsupported_grant_type"}),", user membuka authorize endpoint tanpa parameter OAuth lengkap. Selalu masuk melalui"," ",e.jsx("span",{className:"font-mono text-white",children:"/auth/sso/redirect"}),"."]})]})]}),e.jsxs(o,{children:[e.jsx("h2",{className:"text-lg font-bold text-white",children:"Catatan Operasional"}),e.jsxs("ul",{className:"mt-3 space-y-2 text-sm leading-7 text-white/80",children:[e.jsx("li",{children:"1. Profile sync on-login adalah opsi paling sederhana dan cukup untuk sebagian besar aplikasi."}),e.jsx("li",{children:"2. Periodic sync cocok untuk aplikasi yang perlu mirror user walaupun user belum login."}),e.jsxs("li",{children:["3. Password yang disinkronkan adalah"," ",e.jsx("span",{className:"font-mono text-white",children:"hash"}),", bukan plaintext."]}),e.jsx("li",{children:"4. Role lokal sebaiknya tidak diambil mentah dari payload SSO; gunakan default role minim risiko seperti Guest sampai ada approval lokal."}),e.jsx("li",{children:"5. Untuk aplikasi tanpa kolom 2FA lokal, cukup sync field identity/security yang tersedia."}),e.jsx("li",{children:"6. Setelah deploy perubahan payload profile, restart server app/client dan bersihkan cache konfigurasi bila perlu."})]})]})]})]})]})]})}export{P as default};
