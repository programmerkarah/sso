<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <title>Persetujuan Akses Aplikasi</title>
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            font-family: "Instrument Sans", "Segoe UI", sans-serif;
            background: #020617;
            color: #f8fafc;
        }
        .page { min-height: 100vh; display: grid; place-items: center; padding: 32px 16px; }
        .shell { width: 100%; max-width: 560px; }
        .brand { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; color: #cbd5e1; }
        .brand img { width: 40px; height: 40px; object-fit: contain; }
        .brand strong { display: block; color: #fff; font-size: 14px; }
        .brand span { display: block; margin-top: 2px; font-size: 12px; color: #64748b; }
        .card { background: #0f172a; border: 1px solid #1e293b; border-radius: 18px; padding: 28px; box-shadow: 0 24px 60px rgba(0,0,0,.24); }
        h1 { margin: 0; font-size: 24px; line-height: 1.3; }
        .subtitle { margin: 8px 0 0; color: #94a3b8; font-size: 14px; line-height: 1.6; }
        .meta { margin-top: 24px; border: 1px solid #1e293b; border-radius: 14px; overflow: hidden; }
        .meta-item { margin: 0; padding: 14px 16px; border-bottom: 1px solid #1e293b; font-size: 14px; color: #cbd5e1; }
        .meta-item:last-child { border-bottom: 0; }
        .meta-item strong { color: #fff; }
        .scope-list { margin: 0; padding: 0 16px 14px 34px; color: #94a3b8; font-size: 14px; }
        .scope-list li { margin: 6px 0; }
        .actions { margin-top: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .button { width: 100%; border: 0; border-radius: 11px; padding: 12px 16px; font-size: 14px; font-weight: 700; cursor: pointer; }
        .button-approve { background: #0284c7; color: #fff; }
        .button-approve:hover { background: #0ea5e9; }
        .button-deny { background: #1e293b; color: #cbd5e1; }
        .button-deny:hover { background: #334155; }
        .footer-note { margin: 18px 0 0; font-size: 12px; line-height: 1.6; color: #64748b; }
        @media (max-width: 520px) { .card { padding: 22px; } .actions { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
<div class="page">
    <div class="shell">
        <div class="brand">
            <img src="/favicon.svg" alt="SSO BPS Kota Sawahlunto">
            <div><strong>SSO BPS Kota Sawahlunto</strong><span>Persetujuan akses aplikasi</span></div>
        </div>
        <div class="card">
            <h1>Izinkan akses ke akun Anda?</h1>
            <p class="subtitle">Periksa aplikasi dan akses yang diminta sebelum melanjutkan.</p>

            <div class="meta">
                <p class="meta-item"><strong>Aplikasi:</strong> {{ $client->name }}</p>
                <p class="meta-item"><strong>Pengguna:</strong> {{ $user->name }}</p>
                @if (!empty($scopes))
                    <p class="meta-item"><strong>Akses yang diminta</strong></p>
                    <ul class="scope-list">
                        @foreach ($scopes as $scope)
                            <li>{{ $scope->description ?: $scope->id }}</li>
                        @endforeach
                    </ul>
                @endif
            </div>

            <div class="actions">
                <form method="post" action="{{ route('passport.authorizations.approve') }}">
                    @csrf
                    <input type="hidden" name="state" value="{{ $request->state }}">
                    <input type="hidden" name="client_id" value="{{ $client->getKey() }}">
                    <input type="hidden" name="auth_token" value="{{ $authToken }}">
                    <button type="submit" class="button button-approve">Izinkan akses</button>
                </form>
                <form method="post" action="{{ route('passport.authorizations.deny') }}">
                    @csrf
                    @method('DELETE')
                    <input type="hidden" name="state" value="{{ $request->state }}">
                    <input type="hidden" name="client_id" value="{{ $client->getKey() }}">
                    <input type="hidden" name="auth_token" value="{{ $authToken }}">
                    <button type="submit" class="button button-deny">Batalkan</button>
                </form>
            </div>
            <p class="footer-note">Hanya izinkan aplikasi yang Anda kenal dan gunakan untuk pekerjaan.</p>
        </div>
    </div>
</div>
</body>
</html>
