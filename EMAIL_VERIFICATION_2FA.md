# Email Verification & Two-Factor Authentication (2FA)

## Overview

Sistem SSO Sawahlunto sekarang dilengkapi dengan fitur keamanan:
1. **Email Verification**: Pengguna harus memverifikasi email mereka setelah mendaftar
2. **Two-Factor Authentication (2FA)**: Pengguna harus mengaktifkan autentikasi dua faktor untuk mengakses dashboard

## Teknologi

- **Laravel Fortify v1.36**: Menangani autentikasi, verifikasi email, dan 2FA
- **Inertia.js v2**: Interface React yang seamless
- **Google Authenticator / Authy**: Aplikasi autentikator untuk TOTP codes

## Alur Registrasi & Login Baru

### 1. Registrasi
```
User mendaftar → Email verifikasi dikirim → User redirect ke halaman "Verify Email"
```

**Page**: `/email/verify` - `VerifyEmail.tsx`

User akan diminta untuk:
- Mengecek email untuk link verifikasi
- Mengklik link verifikasi di email
- Atau klik tombol "Kirim Ulang Email Verifikasi" jika email tidak diterima

### 2. Setelah Email Terverifikasi
```
Email verified → Login berhasil → Redirect ke /settings/security (jika 2FA belum aktif)
→ Setup 2FA → Akses dashboard granted
```

**Page**: `/settings/security` - `Settings/Security.tsx`

User akan diminta untuk:
1. Klik tombol "Aktifkan 2FA"
2. Scan QR code dengan Google Authenticator/Authy
3. Masukkan kode 6 digit untuk konfirmasi
4. Simpan recovery codes yang ditampilkan

### 3. Login dengan 2FA
```
Username + Password → 2FA Challenge → Masukkan kode 6 digit → Dashboard
```

**Page**: `/two-factor-challenge` - `TwoFactorChallenge.tsx`

User akan diminta:
- Masukkan kode 6 digit dari aplikator atau
- Gunakan recovery code (jika kehilangan akses ke authenticator)

## Halaman & Fitur

### 1. VerifyEmail.tsx
**Route**: `/email/verify`
**Middleware**: `auth`

Fitur:
- Menampilkan pesan instruksi verifikasi email
- Tombol "Kirim Ulang Email Verifikasi" (POST `/email/verification-notification`)
- Tombol "Logout" untuk keluar
- Status message jika link baru berhasil dikirim

### 2. TwoFactorChallenge.tsx
**Route**: `/two-factor-challenge`
**Middleware**: `guest` (Fortify)

Fitur:
- Form input kode autentikasi (6 digit)
- Toggle ke form recovery code
- Submit kode untuk verifikasi (POST `/two-factor-challenge`)

### 3. Settings/Security.tsx
**Route**: `/settings/security`
**Middleware**: `auth, verified`

Fitur:
- Status card menampilkan apakah 2FA aktif/tidak
- **Belum Aktif**:
  - Tombol "Aktifkan 2FA" (POST `/user/two-factor-authentication`)
  - Menampilkan QR code setelah enable
  - Form konfirmasi dengan kode 6 digit (POST `/user/confirmed-two-factor-authentication`)
  - Menampilkan recovery codes setelah konfirmasi
- **Sudah Aktif**:
  - Tombol "Lihat Kode Pemulihan" (GET `/user/two-factor-recovery-codes`)
  - Tombol "Regenerasi Kode" (POST `/user/two-factor-recovery-codes`)
  - Tombol "Nonaktifkan 2FA" (DELETE `/user/two-factor-authentication`)

### 4. Updated AppLayout.tsx
Menambahkan link "Keamanan" dengan icon Shield di navigation menu (desktop & mobile)

## Backend Implementation

### 1. User Model (`app/Models/User.php`)
```php
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, TwoFactorAuthenticatable;
}
```

Atribut 2FA di database:
- `two_factor_secret`: Secret key (encrypted)
- `two_factor_recovery_codes`: Recovery codes (encrypted)
- `two_factor_confirmed_at`: Timestamp konfirmasi 2FA

### 2. Fortify Configuration (`config/fortify.php`)
```php
'username' => 'username', // Login dengan username bukan email
'home' => '/dashboard',
'features' => [
    Features::registration(),
    Features::resetPasswords(),
    Features::emailVerification(), // ✅ AKTIF
    Features::updateProfileInformation(),
    Features::updatePasswords(),
    Features::twoFactorAuthentication([
        'confirm' => true,  // ✅ Konfirmasi wajib
        'confirmPassword' => true, // Password confirmation required
    ]),
],
```

### 3. CreateNewUser Action
Updated untuk include `username` validation:
```php
'username' => ['required', 'string', 'max:255', 'alpha_dash', Rule::unique(User::class)],
```

### 4. EnsureTwoFactorEnabled Middleware
**File**: `app/Http/Middleware/EnsureTwoFactorEnabled.php`
**Alias**: `two-factor`

Mengecek apakah user sudah confirm 2FA. Jika belum, redirect ke `/settings/security`.

### 5. Routes Update
```php
// Dashboard & Admin routes memerlukan verified email + 2FA
Route::get('/dashboard', ...)->middleware(['auth', 'verified', 'two-factor']);
Route::prefix('admin')->middleware(['auth', 'verified', 'two-factor']);

// Settings route hanya perlu verified email
Route::get('/settings/security', ...)->middleware(['auth', 'verified']);
```

## Fortify Endpoints Used

**Authentication:**
- `GET /login` - Login page
- `POST /login` - Handle login
- `GET /register` - Register page
- `POST /register` - Handle registration
- `POST /logout` - Logout

**Email Verification:**
- `GET /email/verify` - Verify email notice page
- `GET /email/verify/{id}/{hash}` - Verification link (dari email)
- `POST /email/verification-notification` - Resend verification email

**Two-Factor Authentication:**
- `GET /two-factor-challenge` - 2FA challenge page (saat login)
- `POST /two-factor-challenge` - Submit 2FA code
- `POST /user/two-factor-authentication` - Enable 2FA
- `POST /user/confirmed-two-factor-authentication` - Confirm 2FA setup
- `GET /user/two-factor-qr-code` - Get QR code SVG
- `GET /user/two-factor-recovery-codes` - Get recovery codes
- `POST /user/two-factor-recovery-codes` - Regenerate recovery codes
- `DELETE /user/two-factor-authentication` - Disable 2FA

## Konfigurasi Email

Agar email verifikasi dapat dikirim, pastikan `.env` dikonfigurasi dengan benar:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io  # atau smtp.gmail.com
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@sso.sawahlunto.go.id
MAIL_FROM_NAME="${APP_NAME}"
```

### Development: Mailtrap
Untuk testing, gunakan [Mailtrap](https://mailtrap.io) (gratis):
1. Daftar di Mailtrap
2. Copy SMTP credentials
3. Update `.env` dengan credentials Mailtrap

### Production: Gmail/SMTP Real
Untuk production, gunakan SMTP server yang sesungguhnya atau layanan email seperti:
- Gmail SMTP
- SendGrid
- Amazon SES
- Mailgun

## Testing Flow

### 1. Test Registrasi & Email Verification
```bash
# 1. Buka browser ke http://localhost/register
# 2. Isi form registrasi (name, username, email, password)
# 3. Submit form
# 4. Expected: Redirect ke /email/verify
# 5. Cek email di Mailtrap/inbox
# 6. Klik link verifikasi
# 7. Expected: Redirect ke /dashboard atau /settings/security
```

### 2. Test 2FA Setup
```bash
# 1. Login atau akses /settings/security
# 2. Klik "Aktifkan 2FA"
# 3. Scan QR code dengan Google Authenticator
# 4. Masukkan kode 6 digit dari app
# 5. Expected: Menampilkan recovery codes
# 6. Simpan recovery codes di tempat aman
# 7. Try access /dashboard - should work now
```

### 3. Test 2FA Login
```bash
# 1. Logout
# 2. Login dengan username + password
# 3. Expected: Redirect ke /two-factor-challenge
# 4. Masukkan kode 6 digit dari Google Authenticator
# 5. Expected: Redirect ke /dashboard
```

### 4. Test 2FA Recovery Code
```bash
# 1. Logout
# 2. Login dengan username + password
# 3. Di halaman /two-factor-challenge, klik "Gunakan kode pemulihan"
# 4. Masukkan salah satu recovery code
# 5. Expected: Redirect ke /dashboard
# Note: Setiap recovery code hanya bisa digunakan 1x
```

## Keamanan

### Recovery Codes
- Disimpan encrypted di database
- Hanya tampil 1x setelah 2FA diaktifkan atau saat regenerasi
- User **HARUS** menyimpan codes ini di tempat aman
- Setiap code hanya bisa digunakan sekali

### Email Verification
- Link verifikasi signed dan expired (default 60 menit)
- Middleware `verified` protects all authenticated routes
- Tidak bisa akses dashboard tanpa verify email

### 2FA Requirements
- Confirm password sebelum enable 2FA
- Harus konfirmasi dengan kode valid sebelum 2FA aktif
- Middleware `two-factor` enforce 2FA di dashboard & admin

## Catatan Penting

1. **AuthController tidak lagi digunakan** untuk login/register. Fortify menangani semua itu.
2. **Pastikan mail configured** untuk email verification berfungsi
3. **User harus save recovery codes** - tidak bisa dilihat lagi setelah page ditutup
4. **2FA wajib** untuk mengakses dashboard dan admin area
5. **Middleware stack**: `auth` → `verified` → `two-factor`

## Troubleshooting

### Email tidak terkirim
- Cek konfigurasi `.env` mail settings
- Test dengan `php artisan tinker` lalu `Mail::raw('Test', fn($m) => $m->to('test@test.com')->subject('Test'));`
- Cek `storage/logs/laravel.log` untuk error

### 2FA Code tidak valid
- Pastikan waktu server sinkron (TOTP bergantung pada waktu akurat)
- Coba regenerate QR code (disable lalu enable lagi)
- Pastikan scan QR code dengan betul

### Stuck di "Verify Email"
- Klik "Kirim Ulang Email Verifikasi"
- Atau verifikasi manual dengan SQL: `UPDATE users SET email_verified_at = NOW() WHERE id = 1;`

### Stuck di "Setup 2FA"
- User bisa logout dan login lagi untuk retry
- Atau disable 2FA requirement sementara dengan comment middleware `two-factor` di routes

## Build Info

**Packages Installed:**
- `laravel/fortify` v1.36.2
- `bacon/bacon-qr-code` v3.1.1 (untuk QR code)
- `pragmarx/google2fa` v9.0.0 (Google Authenticator protocol)

**New Files Created:**
- `resources/js/Pages/Auth/VerifyEmail.tsx`
- `resources/js/Pages/Auth/TwoFactorChallenge.tsx`
- `resources/js/Pages/Settings/Security.tsx`
- `app/Http/Middleware/EnsureTwoFactorEnabled.php`
- `app/Http/Controllers/SettingsController.php`
- `app/Providers/FortifyServiceProvider.php`
- `app/Actions/Fortify/CreateNewUser.php` (updated)
- `config/fortify.php`

**Migration:**
- `2026_04_17_193322_add_two_factor_columns_to_users_table.php`
  - Adds: `two_factor_secret`, `two_factor_recovery_codes`, `two_factor_confirmed_at`

**Build Size:**
- CSS: 87.01 kB (gzip: 15.20 kB)
- JS: 37.64 kB (gzip: 15.06 kB)
