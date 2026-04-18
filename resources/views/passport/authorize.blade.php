<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Persetujuan Akses Aplikasi</title>
    <style>
        body {
            margin: 0;
            font-family: "Instrument Sans", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #eef2ff 0%, #f8fafc 50%, #ecfeff 100%);
            color: #0f172a;
        }

        .container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem 1rem;
        }

        .card {
            width: 100%;
            max-width: 720px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
            padding: 2rem;
        }

        .title {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 700;
            line-height: 1.25;
        }

        .subtitle {
            margin: 0.5rem 0 0;
            color: #475569;
            font-size: 0.95rem;
        }

        .meta {
            margin-top: 1.5rem;
            padding: 1rem;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            background: #f8fafc;
        }

        .meta-item {
            margin: 0.5rem 0;
            font-size: 0.95rem;
        }

        .scope-list {
            margin: 0.75rem 0 0;
            padding-left: 1.25rem;
        }

        .scope-list li {
            margin: 0.35rem 0;
        }

        .actions {
            margin-top: 1.75rem;
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
        }

        .button {
            border: 0;
            border-radius: 10px;
            padding: 0.7rem 1.25rem;
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
        }

        .button-approve {
            background: #2563eb;
            color: #fff;
        }

        .button-deny {
            background: #e2e8f0;
            color: #0f172a;
        }

        .footer-note {
            margin-top: 1rem;
            font-size: 0.8rem;
            color: #64748b;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="card">
        <h1 class="title">Persetujuan Akses Aplikasi</h1>
        <p class="subtitle">Aplikasi berikut meminta akses ke akun SSO Anda.</p>

        <div class="meta">
            <p class="meta-item"><strong>Aplikasi:</strong> {{ $client->name }}</p>
            <p class="meta-item"><strong>Pengguna:</strong> {{ $user->name }}</p>
            @if (!empty($scopes))
                <p class="meta-item"><strong>Scope yang diminta:</strong></p>
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
                <button type="submit" class="button button-approve">Setujui</button>
            </form>

            <form method="post" action="{{ route('passport.authorizations.deny') }}">
                @csrf
                @method('DELETE')
                <input type="hidden" name="state" value="{{ $request->state }}">
                <input type="hidden" name="client_id" value="{{ $client->getKey() }}">
                <input type="hidden" name="auth_token" value="{{ $authToken }}">
                <button type="submit" class="button button-deny">Tolak</button>
            </form>
        </div>

        <p class="footer-note">Pastikan Anda hanya menyetujui aplikasi yang Anda percaya.</p>
    </div>
</div>
</body>
</html>
