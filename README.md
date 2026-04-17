# SSO Sawahlunto - Single Sign-On Portal

Portal SSO (Single Sign-On) untuk mengelola autentikasi terpusat aplikasi-aplikasi pada domain sawahlunto.io.

## Fitur

- ✅ Registrasi dan login pengguna
- ✅ OAuth2 authentication menggunakan Laravel Passport
- ✅ Manajemen aplikasi yang terdaftar
- ✅ Client ID dan Client Secret untuk setiap aplikasi
- ✅ Dashboard admin untuk mengelola aplikasi
- ✅ API endpoint untuk mendapatkan informasi user
- ✅ Modern UI dengan React + TypeScript + Tailwind CSS
- ✅ SPA (Single Page Application) dengan Inertia.js

## Teknologi

### Backend
- Laravel 12
- Laravel Passport 13 (OAuth2)
- Laravel Inertia 3
- MySQL
- PHP 8.2

### Frontend
- React 19
- TypeScript 6
- Inertia.js 3
- Tailwind CSS v4
- Lucide React (Icons)
- Vite 7
- Ziggy (Laravel Routes di JavaScript)

## Instalasi

### 1. Clone atau Copy Project

Project sudah ada di folder `e:\xampp\htdocs\sso`

### 2. Konfigurasi Database

Database `sso_sawahlunto` sudah dibuat dan migrasi sudah dijalankan.

### 3. Environment

File `.env` sudah dikonfigurasi:
```
APP_NAME="SSO Sawahlunto"
APP_URL=http://sso.sawahlunto.test

DB_DATABASE=sso_sawahlunto
```

### 4. Install Dependencies

```bash
# Backend dependencies (sudah terinstall)
composer install

# Frontend dependencies (sudah terinstall)
npm install
```

### 5. Jalankan Aplikasi

Untuk development, jalankan 2 server:

**Terminal 1 - Laravel Server:**
```bash
cd e:\xampp\htdocs\sso
php artisan serve --port=8001
```

**Terminal 2 - Vite Dev Server:**
```bash
cd e:\xampp\htdocs\sso
npm run dev
```

Akses aplikasi: `http://localhost:8001`

### 6. Build untuk Production

```bash
npm run build
```

## Penggunaan

### 1. Registrasi Akun

- Buka halaman utama SSO
- Klik "Daftar Akun Baru"
- Isi nama, email, dan password
- Submit form

### 2. Login

- Klik "Masuk"
- Masukkan email dan password
- Akses dashboard

### 3. Tambah Aplikasi Baru

Dari dashboard:
- Klik "Aplikasi" di menu
- Klik "Tambah Aplikasi"
- Isi informasi aplikasi:
  - **Nama**: Nama aplikasi (contoh: "Manajemen Mitra")
  - **Deskripsi**: Deskripsi singkat
  - **Domain**: Domain aplikasi (contoh: "mitra.sawahlunto.io")
  - **Callback URL**: URL callback OAuth (contoh: "http://mitra.sawahlunto.test/auth/callback")
  - **Logo URL**: (opsional) URL logo aplikasi
- Submit form
- Simpan **Client ID** dan **Client Secret** yang ditampilkan

## Integrasi dengan Aplikasi Client

### Konfigurasi di Aplikasi Client

Tambahkan ke `.env` aplikasi client:

```env
SSO_CLIENT_ID=9d9a...
SSO_CLIENT_SECRET=OpEk...
SSO_REDIRECT_URI=http://your-app.test/auth/callback
SSO_BASE_URL=http://localhost:8001
SSO_AUTHORIZE_URL=http://localhost:8001/oauth/authorize
SSO_TOKEN_URL=http://localhost:8001/oauth/token
SSO_USERINFO_URL=http://localhost:8001/api/user
```

### Flow OAuth2 Authorization Code

1. **Redirect ke SSO untuk Login**:
```php
$query = http_build_query([
    'client_id' => env('SSO_CLIENT_ID'),
    'redirect_uri' => env('SSO_REDIRECT_URI'),
    'response_type' => 'code',
    'scope' => '',
]);

return redirect(env('SSO_AUTHORIZE_URL').'?'.$query);
```

2. **Handle Callback (Tukar Code dengan Token)**:
```php
$response = Http::asForm()->post(env('SSO_TOKEN_URL'), [
    'grant_type' => 'authorization_code',
    'client_id' => env('SSO_CLIENT_ID'),
    'client_secret' => env('SSO_CLIENT_SECRET'),
    'redirect_uri' => env('SSO_REDIRECT_URI'),
    'code' => $request->code,
]);

$accessToken = $response->json()['access_token'];
```

3. **Dapatkan Data User**:
```php
$response = Http::withToken($accessToken)->get(env('SSO_USERINFO_URL'));

$user = $response->json();
// Create or update user di aplikasi Anda
```

## Endpoint API

### GET /api/user

Mendapatkan informasi user yang sedang login.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Response**:
```json
{
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "email_verified_at": null,
    "created_at": "2026-04-17T18:30:00.000000Z",
    "updated_at": "2026-04-17T18:30:00.000000Z"
}
```

### POST /oauth/authorize

Endpoint untuk authorization code grant.

### POST /oauth/token

Endpoint untuk menukar authorization code dengan access token.

**Parameters**:
- `grant_type`: "authorization_code"
- `client_id`: Client ID aplikasi
- `client_secret`: Client Secret aplikasi
- `redirect_uri`: Callback URL
- `code`: Authorization code dari callback

## Struktur Database

### Table: users
- id
- name
- email
- email_verified_at
- password
- remember_token
- created_at, updated_at

### Table: applications
- id
- name
- slug
- description
- domain
- callback_url
- logo_url
- is_active
- oauth_client_id
- created_at, updated_at

### Table: oauth_clients (Laravel Passport)
- id
- user_id
- name
- secret
- redirect
- created_at, updated_at

### Table: oauth_access_tokens (Laravel Passport)
- id
- user_id
- client_id
- scopes
- revoked
- expires_at
- created_at, updated_at

## Keamanan

- Password di-hash menggunakan bcrypt
- OAuth2 tokens terenkripsi
- CSRF protection aktif
- HTTPS direkomendasikan untuk production

## License

Proprietary - BPS Kota Sawahlunto

## Support

Untuk bantuan atau pertanyaan, hubungi tim IT BPS Kota Sawahlunto.
<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework. You can also check out [Laravel Learn](https://laravel.com/learn), where you will be guided through building a modern Laravel application.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
