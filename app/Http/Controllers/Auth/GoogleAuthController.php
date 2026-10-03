<?php

namespace App\Http\Controllers\Auth;

use App\Events\SessionDisplaced;
use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\Role;
use App\Models\SocialAccount;
use App\Models\User;
use App\Rules\SecurePassword;
use App\Services\SessionConcurrencyManager;
use App\Services\TrustedDeviceManager;
use App\Support\ActivityLogger;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class GoogleAuthController extends Controller
{
    private const PROVIDER = 'google';

    private const PENDING_SESSION_KEY = 'google.pending_identity';

    private const OAUTH_STATE_SESSION_KEY = 'google.oauth_state';

    public function __construct(
        protected TrustedDeviceManager $trustedDeviceManager,
        protected SessionConcurrencyManager $sessionConcurrencyManager,
    ) {}

    public function redirect(Request $request): RedirectResponse
    {
        return $this->startOAuth($request, 'authenticate');
    }

    public function redirectForLink(Request $request): RedirectResponse
    {
        return $this->startOAuth($request, 'link');
    }

    private function startOAuth(Request $request, string $intent): RedirectResponse
    {
        $clientId = (string) config('services.google.client_id');
        $redirectUri = (string) config('services.google.redirect');

        abort_if($clientId === '' || $redirectUri === '', 503, 'Google OAuth belum dikonfigurasi.');

        $state = Str::random(64);

        $request->session()->put(self::OAUTH_STATE_SESSION_KEY, [
            'value' => $state,
            'intent' => $intent,
            'created_at' => now()->timestamp,
        ]);

        $query = http_build_query([
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'state' => $state,
            'prompt' => 'select_account',
        ]);

        return redirect()->away('https://accounts.google.com/o/oauth2/v2/auth?'.$query);
    }

    public function callback(Request $request): RedirectResponse|Response
    {
        $oauthState = $request->session()->pull(self::OAUTH_STATE_SESSION_KEY);
        $expectedState = is_array($oauthState) ? ($oauthState['value'] ?? null) : null;
        $intent = is_array($oauthState) ? ($oauthState['intent'] ?? 'authenticate') : 'authenticate';
        $createdAt = is_array($oauthState) ? (int) ($oauthState['created_at'] ?? 0) : 0;

        if (
            ! is_string($expectedState)
            || ! hash_equals($expectedState, (string) $request->query('state'))
            || $createdAt < now()->subMinutes(10)->timestamp
        ) {
            return redirect()->route('login')
                ->with('error', 'Sesi Google OAuth tidak valid atau telah kedaluwarsa. Silakan coba lagi.');
        }

        if ($request->filled('error')) {
            return redirect()->route('login')
                ->with('info', 'Proses masuk dengan Google dibatalkan.');
        }

        $identity = $this->fetchGoogleIdentity((string) $request->query('code'));

        if (! $identity) {
            return redirect()->route('login')
                ->with('error', 'Identitas Google tidak dapat diverifikasi. Silakan coba lagi.');
        }

        if ($intent === 'link' && $request->user()) {
            return $this->linkAuthenticatedUser($request, $request->user(), $identity);
        }

        $socialAccount = SocialAccount::query()
            ->with('user')
            ->where('provider', self::PROVIDER)
            ->where('provider_user_id', $identity['sub'])
            ->first();

        if ($socialAccount) {
            $user = $socialAccount->user;

            if (! $this->emailsMatch($user->email, $identity['email'])) {
                return redirect()->route('login')->with(
                    'error',
                    'Email akun Google berbeda dengan email yang terdaftar pada akun SSO. Masuk menggunakan username, lalu ubah email SSO agar sama sebelum menggunakan Google kembali.',
                );
            }

            $socialAccount->forceFill([
                'provider_email' => $identity['email'],
                'provider_email_verified_at' => now(),
                'last_login_at' => now(),
            ])->save();

            return $this->loginLinkedUser($request, $user);
        }

        $request->session()->put(self::PENDING_SESSION_KEY, [
            ...$identity,
            'created_at' => now()->timestamp,
        ]);

        $existingEmailAccount = User::query()
            ->whereRaw('LOWER(email) = ?', [$identity['email']])
            ->exists();

        return Inertia::render('Auth/GoogleContinue', [
            'google' => [
                'name' => $identity['name'],
                'email' => $identity['email'],
            ],
            'existingEmailAccount' => $existingEmailAccount,
        ]);
    }

    public function useExistingAccount(Request $request): RedirectResponse
    {
        $identity = $this->pendingIdentity($request);

        if (! $identity) {
            return redirect()->route('login')
                ->with('error', 'Sesi Google telah kedaluwarsa. Silakan mulai kembali.');
        }

        $request->session()->put('url.intended', route('google.link-pending'));

        return redirect()->route('login')
            ->with('info', 'Masuk dengan username dan password akun SSO Anda untuk membuktikan kepemilikan akun.');
    }

    public function loginLocalWithoutLink(Request $request): RedirectResponse
    {
        $request->session()->forget([
            self::PENDING_SESSION_KEY,
            'url.intended',
        ]);

        return redirect()->route('login')
            ->with('info', 'Silakan masuk menggunakan username dan password akun SSO. Akun Google tidak akan dihubungkan.');
    }

    public function linkPending(Request $request): RedirectResponse
    {
        $identity = $this->pendingIdentity($request);
        /** @var User $user */
        $user = $request->user();

        if (! $identity) {
            return redirect()->route('dashboard')
                ->with('error', 'Sesi Google telah kedaluwarsa. Hubungkan akun Google kembali dari menu Keamanan.');
        }

        if (! $this->emailsMatch($user->email, $identity['email'])) {
            $request->session()->forget(self::PENDING_SESSION_KEY);

            return redirect()->route('settings.security')->with(
                'error',
                "Email Google {$identity['email']} berbeda dengan email SSO {$user->email}. Ubah dan verifikasi email SSO terlebih dahulu agar sama, lalu hubungkan Google kembali.",
            );
        }

        $result = $this->persistLink($user, $identity);

        $request->session()->forget(self::PENDING_SESSION_KEY);

        return redirect()->route('dashboard')->with(
            $result['ok'] ? 'success' : 'error',
            $result['message'],
        );
    }

    public function registrationForm(Request $request): RedirectResponse|Response
    {
        $identity = $this->pendingIdentity($request);

        if (! $identity) {
            return redirect()->route('register')
                ->with('error', 'Sesi Google telah kedaluwarsa. Silakan mulai kembali.');
        }

        $organizations = Organization::query()
            ->where('is_active', true)
            ->get(['id', 'name', 'type'])
            ->values()
            ->all();

        return Inertia::render('Auth/GoogleRegister', [
            'google' => [
                'name' => $identity['name'],
                'email' => $identity['email'],
            ],
            'organizations' => $organizations,
        ]);
    }

    public function register(Request $request): RedirectResponse
    {
        $identity = $this->pendingIdentity($request);

        if (! $identity) {
            return redirect()->route('register')
                ->with('error', 'Sesi Google telah kedaluwarsa. Silakan mulai kembali.');
        }

        $activeOrganizations = Organization::query()->where('is_active', true)->get();
        $hasMultipleOrganizations = $activeOrganizations->count() > 1;

        $rules = [
            'username' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-Z0-9_.]+$/',
                Rule::unique(User::class),
            ],
            'password' => [
                'required',
                'string',
                Password::defaults(),
                'confirmed',
                new SecurePassword($identity['name'], $request->string('username')->toString(), $identity['email']),
            ],
        ];

        if ($hasMultipleOrganizations) {
            $rules['organization_id'] = [
                'required',
                Rule::exists('organizations', 'id')->where('is_active', true),
            ];
        }

        $validated = $request->validate($rules);
        $organizationId = $hasMultipleOrganizations
            ? (int) $validated['organization_id']
            : $activeOrganizations->first()?->id;

        $existingUser = User::query()
            ->whereRaw('LOWER(email) = ?', [$identity['email']])
            ->first();

        if ($existingUser) {
            return back()->withErrors([
                'username' => 'Email Google ini sudah digunakan oleh akun SSO. Pilih "Saya sudah punya akun SSO" untuk menghubungkannya.',
            ]);
        }

        $user = DB::transaction(function () use ($identity, $validated, $organizationId): User {
            $user = User::create([
                'name' => $identity['name'],
                'username' => $validated['username'],
                'email' => $identity['email'],
                'password' => $validated['password'],
                'organization_id' => $organizationId,
                'admin_verified_at' => null,
                'admin_verified_by' => null,
            ]);

            $role = Role::query()->where('name', 'user')->first();

            if ($role) {
                $user->roles()->attach($role->id);
            }

            SocialAccount::create([
                'user_id' => $user->id,
                'provider' => self::PROVIDER,
                'provider_user_id' => $identity['sub'],
                'provider_email' => $identity['email'],
                'provider_email_verified_at' => now(),
                'linked_at' => now(),
            ]);

            return $user;
        });

        event(new Registered($user));

        Auth::guard('web')->login($user);
        $request->session()->regenerate();
        $request->session()->forget(self::PENDING_SESSION_KEY);

        ActivityLogger::logByRequest(
            request: $request,
            event: 'auth.register.google',
            category: 'authentication',
            description: "Berhasil mendaftarkan akun {$user->name} melalui Google.",
            user: $user,
            metadata: ['provider' => self::PROVIDER],
        );

        return redirect()->route('verification.notice')->with(
            'success',
            'Akun berhasil dibuat. Verifikasi email Anda untuk melanjutkan proses aktivasi akun.',
        );
    }

    public function unlink(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $deleted = $user->socialAccounts()
            ->where('provider', self::PROVIDER)
            ->delete();

        if ($deleted) {
            ActivityLogger::logByRequest(
                request: $request,
                event: 'account.google.unlinked',
                category: 'account_security',
                description: "Akun Google dilepas dari akun SSO {$user->username}.",
                user: $user,
            );
        }

        return back()->with(
            $deleted ? 'success' : 'info',
            $deleted ? 'Akun Google berhasil dilepas.' : 'Tidak ada akun Google yang terhubung.',
        );
    }

    public function dismissPrompt(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $user->forceFill([
            'google_link_prompt_dismissed_at' => now(),
        ])->save();

        return back();
    }

    private function fetchGoogleIdentity(string $code): ?array
    {
        if ($code === '') {
            return null;
        }

        $tokenResponse = Http::asForm()
            ->acceptJson()
            ->timeout(15)
            ->post('https://oauth2.googleapis.com/token', [
                'code' => $code,
                'client_id' => config('services.google.client_id'),
                'client_secret' => config('services.google.client_secret'),
                'redirect_uri' => config('services.google.redirect'),
                'grant_type' => 'authorization_code',
            ]);

        if (! $tokenResponse->successful()) {
            return null;
        }

        $accessToken = (string) $tokenResponse->json('access_token');

        if ($accessToken === '') {
            return null;
        }

        $userInfo = Http::withToken($accessToken)
            ->acceptJson()
            ->timeout(15)
            ->get('https://openidconnect.googleapis.com/v1/userinfo');

        if (! $userInfo->successful()) {
            return null;
        }

        $sub = trim((string) $userInfo->json('sub'));
        $email = $this->normalizeEmail((string) $userInfo->json('email'));
        $name = trim((string) $userInfo->json('name'));
        $emailVerified = filter_var(
            $userInfo->json('email_verified'),
            FILTER_VALIDATE_BOOL,
        );

        if ($sub === '' || $email === '' || ! $emailVerified) {
            return null;
        }

        return [
            'sub' => $sub,
            'email' => $email,
            'name' => $name !== '' ? $name : $email,
        ];
    }

    private function linkAuthenticatedUser(Request $request, User $user, array $identity): RedirectResponse
    {
        if (! $this->emailsMatch($user->email, $identity['email'])) {
            return redirect()->route('settings.security')->with(
                'error',
                "Email Google {$identity['email']} berbeda dengan email SSO {$user->email}. Ubah dan verifikasi email SSO terlebih dahulu sebelum menghubungkan akun Google.",
            );
        }

        $result = $this->persistLink($user, $identity);

        return redirect()->route('settings.security')->with(
            $result['ok'] ? 'success' : 'error',
            $result['message'],
        );
    }

    /**
     * @return array{ok:bool,message:string}
     */
    private function persistLink(User $user, array $identity): array
    {
        $providerOwner = SocialAccount::query()
            ->where('provider', self::PROVIDER)
            ->where('provider_user_id', $identity['sub'])
            ->first();

        if ($providerOwner && (int) $providerOwner->user_id !== (int) $user->id) {
            return [
                'ok' => false,
                'message' => 'Akun Google ini sudah terhubung ke akun SSO lain.',
            ];
        }

        $existingGoogle = $user->socialAccounts()
            ->where('provider', self::PROVIDER)
            ->first();

        if ($existingGoogle && $existingGoogle->provider_user_id !== $identity['sub']) {
            return [
                'ok' => false,
                'message' => 'Akun SSO ini sudah terhubung ke akun Google lain. Lepas koneksi lama terlebih dahulu.',
            ];
        }

        $account = SocialAccount::updateOrCreate(
            [
                'provider' => self::PROVIDER,
                'provider_user_id' => $identity['sub'],
            ],
            [
                'user_id' => $user->id,
                'provider_email' => $identity['email'],
                'provider_email_verified_at' => now(),
                'linked_at' => $existingGoogle?->linked_at ?? now(),
            ],
        );

        $user->forceFill(['google_link_prompt_dismissed_at' => now()])->save();

        ActivityLogger::log(
            event: 'account.google.linked',
            category: 'account_security',
            description: "Akun Google berhasil dihubungkan ke akun SSO {$user->username}.",
            user: $user,
            metadata: [
                'social_account_id' => $account->id,
                'provider' => self::PROVIDER,
            ],
        );

        return ['ok' => true, 'message' => 'Akun Google berhasil dihubungkan.'];
    }

    private function loginLinkedUser(Request $request, User $user): RedirectResponse
    {
        if (
            $user->two_factor_secret
            && $user->two_factor_confirmed_at
            && $this->trustedDeviceManager->shouldChallenge($request, $user)
        ) {
            $request->session()->put([
                'login.id' => $user->getKey(),
                'login.remember' => true,
            ]);

            ActivityLogger::log(
                event: 'auth.google.two_factor',
                category: 'authentication',
                description: "Login Google untuk {$user->username} memerlukan 2FA SSO.",
                user: $user,
            );

            return redirect()->route('two-factor.login');
        }

        Auth::guard('web')->login($user, true);
        $request->session()->regenerate();

        $currentTrustedDevice = $this->trustedDeviceManager->finalizeSuccessfulLogin($request, $user);

        $this->sessionConcurrencyManager->activateLatestSession(
            $request,
            (int) $user->id,
            $currentTrustedDevice?->id,
        );

        if ($currentTrustedDevice) {
            $user->trustedDevices()
                ->whereKeyNot($currentTrustedDevice->id)
                ->delete();
        }

        ActivityLogger::logByRequest(
            request: $request,
            event: 'auth.login.google',
            category: 'authentication',
            description: "Berhasil login pengguna {$user->username} melalui Google.",
            user: $user,
        );

        if ($user->mustChangePassword()) {
            return redirect()->route('settings.change-password');
        }

        if (! $user->hasVerifiedEmail()) {
            return redirect()->route('verification.notice');
        }

        if (! $user->isAdminVerified()) {
            return redirect()->route('dashboard');
        }

        if (is_null($user->two_factor_confirmed_at)) {
            return redirect()->route('settings.security')
                ->with('status', 'Aktifkan dan konfirmasi autentikasi dua faktor (2FA) untuk melanjutkan.');
        }

        return redirect()->intended(route('dashboard'));
    }

    private function pendingIdentity(Request $request): ?array
    {
        $identity = $request->session()->get(self::PENDING_SESSION_KEY);

        if (! is_array($identity)) {
            return null;
        }

        $createdAt = (int) ($identity['created_at'] ?? 0);

        if ($createdAt < now()->subMinutes(20)->timestamp) {
            $request->session()->forget(self::PENDING_SESSION_KEY);

            return null;
        }

        if (
            ! isset($identity['sub'], $identity['email'], $identity['name'])
            || ! is_string($identity['sub'])
            || ! is_string($identity['email'])
            || ! is_string($identity['name'])
        ) {
            return null;
        }

        return $identity;
    }

    private function emailsMatch(?string $left, ?string $right): bool
    {
        return $this->normalizeEmail((string) $left) === $this->normalizeEmail((string) $right);
    }

    private function normalizeEmail(string $email): string
    {
        return Str::lower(trim($email));
    }
}
