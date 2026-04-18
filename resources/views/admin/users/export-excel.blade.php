<table border="1">
    <thead>
        <tr>
            <th>No</th>
            <th>Nama</th>
            <th>Username</th>
            <th>Email</th>
        </tr>
    </thead>
    <tbody>
        @forelse ($users as $index => $user)
            <tr>
                <td>{{ $index + 1 }}</td>
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