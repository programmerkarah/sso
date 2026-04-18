# SSO 2FA & OAuth Redirect Architecture

## 1. FORTIFY 2FA CONFIGURATION

### Location: [config/fortify.php](config/fortify.php)
```php
// 2FA is ENABLED with options:
'features' => [
    Features::twoFactorAuthentication([
        'confirm' => true,              // Requires password confirmation to enable 2FA
        'confirmPassword' => true,      // Requires password confirmation to confirm 2FA
    ]),
]

// Rate limiters configured:
'limiters' => [
    'login' => 'login',
    'two-factor' => 'two-factor',
],
```

**Key Points:**
- 2FA is mandatory for all authenticated users (must be enabled)
- Uses Laravel Fortify built-in 2FA with TOTP
- Recovery codes supported

---

## 2. 2FA BYPASS/CHALLENGE LOGIC

### Location: [app/Actions/Fortify/RedirectIfTwoFactorRequired.php](app/Actions/Fortify/RedirectIfTwoFactorRequired.php)

**Purpose:** Custom action that determines when 2FA challenge is required

```php
class RedirectIfTwoFactorRequired extends RedirectIfTwoFactorAuthenticatable
{
    // Extends parent class with TrustedDeviceManager
    public function __construct(
        StatefulGuard $guard,
        LoginRateLimiter $limiter,
        TrustedDeviceManager $trustedDeviceManager,  // CRITICAL: Manages device trust
    )

    public function handle($request, $next)
    {
        $user = $this->validateCredentials($request);
        
        if ($this->shouldChallengeTwoFactor($request, $user)) {
            return $this->twoFactorChallengeResponse($request, $user);
        }
        
        return $next($request);  // Skip 2FA if no challenge needed
    }

    protected function shouldChallengeTwoFactor($request, $user): bool
    {
        return optional($user)->two_factor_secret
            && !is_null(optional($user)->two_factor_confirmed_at)
            && in_array(TwoFactorAuthenticatable::class, class_uses_recursive($user))
            && $this->trustedDeviceManager->shouldChallenge($request, $user);
            // ↑ KEY: Delegates to TrustedDeviceManager for bypass logic
    }
}
```

**Registered in:** [app/Providers/FortifyServiceProvider.php](app/Providers/FortifyServiceProvider.php)
```php
Fortify::redirectUserForTwoFactorAuthenticationUsing(RedirectIfTwoFactorRequired::class);
```

---

## 3. TRUSTED DEVICE MANAGER - 2FA BYPASS LOGIC

### Location: [app/Services/TrustedDeviceManager.php](app/Services/TrustedDeviceManager.php)

**Core Logic: When 2FA is SKIPPED**

```php
public function shouldChallenge(Request $request, User $user): bool
{
    // 1. Check if forced 2FA by session concurrency manager
    if ($this->sessionConcurrencyManager->consumeForceTwoFactorFlag($user->id)) {
        return true;  // Force 2FA challenge
    }

    // 2. Check if device is trusted AND last login is fresh
    return !$this->hasValidTrustedDevice($request, $user)
        || $this->requiresFreshTwoFactorConfirmation($user);
}

// Check if device cookie/fingerprint is valid
private function hasValidTrustedDevice(Request $request, User $user): bool
{
    $cookie = $this->getCookiePayload($request);
    
    if (!$cookie || (int) $cookie['user_id'] !== $user->id || blank($cookie['token'])) {
        return false;
    }
    
    return $user->trustedDevices()
        ->where('token_hash', hash('sha256', $cookie['token']))
        ->where('device_fingerprint', $this->fingerprint($request))
        ->where('expires_at', '>', now())
        ->exists();
}

// Check if last login is OLDER than TRUST_DAYS (7 days)
private function requiresFreshTwoFactorConfirmation(User $user): bool
{
    return is_null($user->last_login_at)
        || $user->last_login_at->lt(now()->subDays(self::TRUST_DAYS));
        // ↑ If null OR older than 7 days = REQUIRE 2FA
}
```

**2FA is SKIPPED when:**
- Device is trusted (valid cookie with matching fingerprint)
- AND last login is within 7 days
- AND force 2FA flag is not set

**Device Fingerprint:** Uses browser/device characteristics (not IP)
```php
private function fingerprint(Request $request): string
{
    return hash('sha256', implode('|', [
        (string) $request->userAgent(),
        (string) $request->header('sec-ch-ua-platform'),
        (string) $request->header('sec-ch-ua-mobile'),
        (string) $request->header('accept-language'),
    ]));
}
```

---

## 4. LAST_LOGIN_AT TRACKING

### Database: [database/migrations/2026_04_18_030820_add_last_login_at_to_users_table.php](database/migrations/2026_04_18_030820_add_last_login_at_to_users_table.php)

```php
Schema::table('users', function (Blueprint $table) {
    $table->timestamp('last_login_at')
        ->nullable()
        ->after('two_factor_confirmed_at');
});
```

### User Model: [app/Models/User.php](app/Models/User.php)

```php
protected function casts(): array
{
    return [
        'last_login_at' => 'datetime',
        // ...
    ];
}
```

**WHERE IT'S UPDATED:**
Location: [app/Services/TrustedDeviceManager.php](app/Services/TrustedDeviceManager.php)

```php
public function finalizeSuccessfulLogin(Request $request, User $user): void
{
    $user->forceFill([
        'last_login_at' => now(),
    ])->save();
    
    // Then manage device trust...
}
```

**⚠️ CRITICAL ISSUE:** This method is NOT being called!
- AuthController::login() does NOT call `finalizeSuccessfulLogin()`
- Fortify's parent class RedirectIfTwoFactorAuthenticatable doesn't seem to call it either
- Result: `last_login_at` is NEVER UPDATED during login

---

## 5. SESSION CONCURRENCY MANAGER - FORCE 2FA

### Location: [app/Services/SessionConcurrencyManager.php](app/Services/SessionConcurrencyManager.php)

**Purpose:** Enforce single active session per user (new login = old session invalidated)

```php
public function activateLatestSession(Request $request, int $userId, bool $forceTwoFactorOnNextLogin = false): void
{
    $currentSessionId = $request->session()->getId();
    $previousSessionId = $this->getActiveSessionId($userId);

    Cache::forever($this->cacheKey($userId), $currentSessionId);

    if (is_string($previousSessionId) && $previousSessionId !== '' && $previousSessionId !== $currentSessionId) {
        // Invalidate old session
        DB::table(config('session.table', 'sessions'))
            ->where('id', $previousSessionId)
            ->delete();

        if ($forceTwoFactorOnNextLogin) {
            // Set cache flag to force 2FA on next login
            Cache::forever(self::FORCE_2FA_CACHE_PREFIX.$userId, true);
        }
    }
}

// Used in TrustedDeviceManager
public function consumeForceTwoFactorFlag(int $userId): bool
{
    $key = self::FORCE_2FA_CACHE_PREFIX.$userId;

    if (!Cache::pull($key, false)) {
        return false;
    }

    return true;  // Consumed - will be false on next call
}
```

---

## 6. MIDDLEWARE - 2FA ENFORCEMENT

### Location: [app/Http/Middleware/EnsureTwoFactorEnabled.php](app/Http/Middleware/EnsureTwoFactorEnabled.php)

**Purpose:** Redirect to security settings if 2FA not fully enabled

```php
class EnsureTwoFactorEnabled
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && is_null($user->two_factor_confirmed_at)) {
            return redirect()->route('settings.security')
                ->with('status', 'Anda harus mengaktifkan autentikasi dua faktor untuk melanjutkan.');
        }

        return $next($request);
    }
}
```

**Registered as alias:** `'two-factor'` in [bootstrap/app.php](bootstrap/app.php)

**Applied to routes:**
- `/dashboard`
- `/applications`
- `/admin/*`

### Location: [app/Http/Middleware/EnsureSingleActiveSession.php](app/Http/Middleware/EnsureSingleActiveSession.php)

```php
class EnsureSingleActiveSession
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return $next($request);
        }

        $userId = (int) Auth::id();
        $this->sessionConcurrencyManager->ensureSessionRegistered($request, $userId);

        if ($this->sessionConcurrencyManager->isCurrentSessionActive($request, $userId)) {
            return $next($request);
        }

        // Session is invalid (user logged in elsewhere)
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->withErrors([
            'username' => 'Sesi Anda telah berakhir karena akun digunakan pada perangkat lain.',
        ]);
    }
}
```

---

## 7. OAUTH REDIRECT LOGIC

### Location: [app/Http/Controllers/Auth/CustomAuthorizationController.php](app/Http/Controllers/Auth/CustomAuthorizationController.php)

**Purpose:** Custom Passport OAuth authorization handler

```php
class CustomAuthorizationController extends AuthorizationController
{
    public function authorize(
        ServerRequestInterface $psrRequest,
        Request $request,
        ResponseInterface $psrResponse,
        AuthorizationViewResponse $viewResponse
    ): Response|AuthorizationViewResponse {
        
        // CRITICAL: Save OAuth authorize URL as intended URL if user not logged in
        if ($this->guard->guest()) {
            $request->session()->put('url.intended', $request->fullUrl());
            
            Log::channel('single')->info('=== OAuth: User not authenticated, saving intended URL ===', [
                'intended_url' => $request->fullUrl(),
                'session_id' => $request->session()->getId(),
            ]);
        }
        
        // Extensive debug logging
        Log::channel('single')->info('=== OAuth Authorize Controller BEFORE ===', [
            'guard_check' => Auth::guard('web')->check(),
            'guard_user_id' => Auth::guard('web')->id(),
            'session_id' => $request->session()->getId(),
        ]);

        try {
            // Call parent Passport authorization
            $response = parent::authorize(...);
            
            // Log response details
            Log::channel('single')->info('=== OAuth Authorize Controller AFTER ===', [
                'response_type' => get_class($response),
                'is_redirect' => $response instanceof \Illuminate\Http\RedirectResponse,
                'redirect_to' => $response->getTargetUrl(),
                'status_code' => $response->getStatusCode(),
            ]);
            
            return $response;
        } catch (\Exception $e) {
            Log::channel('single')->error('=== OAuth Authorize Controller EXCEPTION ===', [
                'exception' => get_class($e),
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
```

**Route:** [routes/web.php](routes/web.php)
```php
Route::get('/oauth/authorize', [CustomAuthorizationController::class, 'authorize'])
    ->middleware(['web'])
    ->name('passport.authorizations.authorize.debug');
```

**Redirect Flow:**
1. Unauthenticated user visits `/oauth/authorize?...`
2. CustomAuthorizationController saves URL to `session('url.intended')`
3. Middleware redirects to login
4. After login, Laravel redirects to `url.intended` (back to OAuth flow)
5. OAuth authorization completes and redirects to callback

---

## 8. LOGIN FLOW

### Custom Login: [app/Http/Controllers/AuthController.php](app/Http/Controllers/AuthController.php)

```php
public function login(Request $request)
{
    $request->validate([
        'username' => ['required', 'string'],
        'password' => ['required'],
    ]);

    if (!Auth::attempt($request->only('username', 'password'), $request->boolean('remember'))) {
        throw ValidationException::withMessages([
            'username' => ['Username atau password salah.'],
        ]);
    }

    $request->session()->regenerate();

    if ($request->has('redirect_to')) {
        return redirect($request->redirect_to);
    }

    return redirect()->intended('/dashboard');
}
```

**NOTE:** Does NOT use Fortify's AuthController - implements custom login!

**Issues:**
- Does NOT call `TrustedDeviceManager::finalizeSuccessfulLogin()`
- Does NOT update `last_login_at`
- Does NOT activate session in SessionConcurrencyManager
- Does NOT call `SessionConcurrencyManager::activateLatestSession()`

---

## 9. FORTIFY VIEWS

### Location: [app/Providers/FortifyServiceProvider.php](app/Providers/FortifyServiceProvider.php)

```php
Fortify::loginView(fn () => Inertia::render('Auth/Login'));
Fortify::registerView(fn () => Inertia::render('Auth/Register'));
Fortify::verifyEmailView(fn () => Inertia::render('Auth/VerifyEmail'));
Fortify::twoFactorChallengeView(fn () => Inertia::render('Auth/TwoFactorChallenge'));
Fortify::confirmPasswordView(fn () => Inertia::render('Auth/ConfirmPassword'));
```

---

## 10. TRUSTED DEVICES DATABASE

### Migration: [database/migrations/2026_04_18_030819_create_trusted_devices_table.php](database/migrations/2026_04_18_030819_create_trusted_devices_table.php)

```php
Schema::create('trusted_devices', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('device_fingerprint', 64);
    $table->string('token_hash', 64)->unique();
    $table->text('user_agent')->nullable();
    $table->timestamp('last_used_at')->nullable();
    $table->timestamp('expires_at')->nullable();
    $table->timestamps();

    $table->index(['user_id', 'device_fingerprint']);
});
```

### Model: [app/Models/TrustedDevice.php](app/Models/TrustedDevice.php)

---

## 11. 2FA COLUMNS IN USERS TABLE

### Migration: [database/migrations/2026_04_17_193322_add_two_factor_columns_to_users_table.php](database/migrations/2026_04_17_193322_add_two_factor_columns_to_users_table.php)

```php
$table->text('two_factor_secret')->after('password')->nullable();
$table->text('two_factor_recovery_codes')->after('two_factor_secret')->nullable();
$table->timestamp('two_factor_confirmed_at')->after('two_factor_recovery_codes')->nullable();
```

---

## CRITICAL FINDINGS

### 🔴 Issue #1: `last_login_at` is NEVER Updated

**Problem:** 
- `TrustedDeviceManager::finalizeSuccessfulLogin()` exists but is **never called**
- Custom `AuthController::login()` does not invoke it
- Result: `last_login_at` stays NULL, causing 2FA to be required on EVERY login

**Expected Flow:**
```
1. User logs in → AuthController::login()
2. Should call TrustedDeviceManager::finalizeSuccessfulLogin()
3. This updates last_login_at and manages device trust
4. Next login within 7 days on same device → Skip 2FA
```

**Current Flow:**
```
1. User logs in → AuthController::login()
2. Sets Auth session
3. Redirects to intended URL
4. TrustedDeviceManager::shouldChallenge() checks:
   - last_login_at is NULL → Returns TRUE (require 2FA)
5. 2FA challenge on EVERY login!
```

### 🔴 Issue #2: Single Session Not Enforced During Login

**Problem:**
- `SessionConcurrencyManager::activateLatestSession()` is **never called**
- No logic to invalidate previous sessions
- No logic to force 2FA when logging in from new device

**Affected:**
- Multiple simultaneous sessions allowed
- Old sessions not invalidated

### 🟡 Issue #3: OAuth Redirect Depends on Fortify Middleware

**Details:**
- OAuth authorization redirects unauthenticated user to login
- Must complete ALL auth flow including 2FA
- OAuth callback URL stored in `session('url.intended')`
- Must return after 2FA challenge completes

---

## FLOW DIAGRAMS

### Current 2FA Decision Flow
```
User Login
    ↓
AuthController::login() - validates credentials
    ↓
Auth::attempt() - creates session
    ↓
User redirected or proceeds
    ↓
Access protected route (dashboard, applications)
    ↓
EnsureTwoFactorEnabled middleware
    ↓
Check: user.two_factor_confirmed_at != NULL? 
    - YES → Proceed
    - NO → Redirect to settings/security
    ↓
RedirectIfTwoFactorRequired action (from Fortify)
    ↓
shouldChallengeTwoFactor() checks:
    - Has 2FA secret? YES
    - Confirmed 2FA? YES
    - TrustedDeviceManager::shouldChallenge()?
        ↓
        Check: hasValidTrustedDevice()
        Check: requiresFreshTwoFactorConfirmation()
        - last_login_at NULL or > 7 days? → Challenge 2FA
        - last_login_at recent + valid device? → Skip 2FA
```

### OAuth New Login Flow
```
External app OAuth login
    ↓
GET /oauth/authorize?...
    ↓
CustomAuthorizationController::authorize()
    ↓
Check: User authenticated?
    - NO → Save URL to url.intended, redirect to /login
    - YES → Proceed with authorization
    ↓
User logs in with custom AuthController::login()
    ↓
Session regenerate
    ↓
Redirect to url.intended (back to /oauth/authorize)
    ↓
OAuth challenge/callback flow
```

