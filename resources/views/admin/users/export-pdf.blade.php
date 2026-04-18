<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Data Pengguna SSO</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            color: #111827;
            font-size: 12px;
        }

        .header {
            margin-bottom: 24px;
        }

        .title {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 4px;
        }

        .subtitle {
            color: #4b5563;
            font-size: 11px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            border: 1px solid #d1d5db;
            padding: 8px 10px;
            text-align: left;
        }

        th {
            background: #eff6ff;
            font-weight: 700;
        }

        .number {
            width: 44px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Data Pengguna Single Sign-On</div>
        <div class="subtitle">Diekspor pada {{ $generatedAt->format('d M Y H:i') }}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th class="number">No</th>
                <th>Nama</th>
                <th>Username</th>
                <th>Email</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($users as $index => $user)
                <tr>
                    <td class="number">{{ $index + 1 }}</td>
                    <td>{{ $user->name }}</td>
                    <td>{{ $user->username }}</td>
                    <td>{{ $user->email }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4">Tidak ada data pengguna.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>