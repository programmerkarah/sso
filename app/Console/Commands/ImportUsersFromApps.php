<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Encryption\Encrypter;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

class ImportUsersFromApps extends Command
{
    /** @var array<int, string> */
    private array $alwaysExcludedColumns = ['id'];

    /** @var array<int, string> */
    private array $twoFactorColumns = [
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
    ];

    protected $signature = 'users:import-from-apps
                            {--mitra-connection= : Nama koneksi database sumber manajemenmitra}
                            {--persediaan-connection= : Nama koneksi database sumber manajemenpersediaan}
                            {--target-connection= : Nama koneksi database target SSO}
                            {--source-table=users : Nama tabel user pada database sumber}
                            {--target-table=users : Nama tabel user pada database target}
                            {--copy-two-factor : Salin data 2FA dengan decrypt source + re-encrypt target}
                            {--mitra-app-key= : APP_KEY milik aplikasi manajemenmitra}
                            {--persediaan-app-key= : APP_KEY milik aplikasi manajemenpersediaan}
                            {--mitra-app-cipher= : Cipher sumber manajemenmitra (default AES-256-CBC)}
                            {--persediaan-app-cipher= : Cipher sumber manajemenpersediaan (default AES-256-CBC)}
                            {--dry-run : Tampilkan rencana import tanpa mengubah data}
                            {--skip-test-users : Lewati user dengan email *@test.com}';

    protected $description = 'Import user dari manajemenmitra dan manajemenpersediaan ke SSO. Prioritas: mitra > persediaan.';

    public function handle(): int
    {
        $mitraConnection = $this->resolveConnectionName('mitra-connection', 'IMPORT_MITRA_CONNECTION', 'mysql_mitra_import');
        $persediaanConnection = $this->resolveConnectionName('persediaan-connection', 'IMPORT_PERSEDIAAN_CONNECTION', 'mysql_persediaan_import');
        $targetConnection = $this->resolveConnectionName('target-connection', 'IMPORT_TARGET_CONNECTION', config('database.default', 'mysql'));
        $sourceTable = (string) $this->option('source-table');
        $targetTable = (string) $this->option('target-table');
        $copyTwoFactor = (bool) $this->option('copy-two-factor') || $this->hasConfiguredTwoFactorKeys();
        $isDryRun = $this->option('dry-run');
        $skipTest = $this->option('skip-test-users');

        $sourceEncrypters = $copyTwoFactor
            ? $this->resolveSourceEncrypters()
            : [];

        $this->info($isDryRun ? 'DRY RUN — tidak ada perubahan yang disimpan.' : 'Memulai import user...');
        $this->line("  Sumber mitra      : {$mitraConnection}.{$sourceTable}");
        $this->line("  Sumber persediaan : {$persediaanConnection}.{$sourceTable}");
        $this->line("  Target SSO        : {$targetConnection}.{$targetTable}");
        $this->line('  Migrasi 2FA       : '.($copyTwoFactor ? 'AKTIF (re-encrypt)' : 'NONAKTIF'));
        $this->newLine();

        $targetInsertColumns = $this->resolveTargetInsertColumns($targetConnection, $targetTable, $copyTwoFactor);
        $mitraImportColumns = $this->resolveImportColumnsForSource($mitraConnection, $sourceTable, $targetInsertColumns);
        $persediaanImportColumns = $this->resolveImportColumnsForSource($persediaanConnection, $sourceTable, $targetInsertColumns);

        $this->ensureRequiredColumns($mitraImportColumns, ['name', 'username', 'email', 'password']);
        $this->ensureRequiredColumns($persediaanImportColumns, ['name', 'username', 'email', 'password']);
        $this->line('  Kolom dikecualikan : '.implode(', ', $this->resolveExcludedColumns($copyTwoFactor)));
        $this->line('  Kolom impor mitra : '.implode(', ', $mitraImportColumns));
        $this->line('  Kolom impor persediaan : '.implode(', ', $persediaanImportColumns));
        $this->newLine();

        // Ambil semua user dari kedua sumber. Keduanya pakai bcrypt, aman dipindah langsung.
        $mitraUsers = $this->fetchUsers($mitraConnection, $sourceTable, 'manajemenmitra', $mitraImportColumns);
        $persediaanUsers = $this->fetchUsers($persediaanConnection, $sourceTable, 'manajemenpersediaan', $persediaanImportColumns);

        // Gabungkan: mitra sebagai prioritas utama.
        // Jika nama sama ada di keduanya, pakai data mitra.
        $merged = $this->mergeByName($mitraUsers, $persediaanUsers);

        if ($skipTest) {
            $before = $merged->count();
            $merged = $merged->reject(fn (array $u) => str_ends_with($u['email'], '@test.com'));
            $skipped = $before - $merged->count();

            if ($skipped > 0) {
                $this->line("  Melewati {$skipped} test user (@test.com).");
            }
        }

        // Ambil nama yang sudah ada di SSO agar tidak duplikat berdasarkan nama
        $existingNames = DB::connection($targetConnection)
            ->table($targetTable)
            ->pluck('name')
            ->map(fn (string $name) => $this->normalizeName($name))
            ->flip()
            ->all();

        $toInsert = $merged->reject(fn (array $u) => isset($existingNames[$this->normalizeName($u['name'])]));
        $toSkip = $merged->filter(fn (array $u) => isset($existingNames[$this->normalizeName($u['name'])]));

        // Tampilkan ringkasan
        $this->table(
            ['Status', 'Email', 'Nama', 'Username', 'Sumber'],
            $toInsert->map(fn (array $u) => ['IMPORT', $u['email'], $u['name'], $u['username'], $u['_source']])
                ->merge(
                    $toSkip->map(fn (array $u) => ['SKIP (sudah ada)', $u['email'], $u['name'], $u['username'], $u['_source']])
                )
                ->values()
                ->all(),
        );

        $this->newLine();
        $this->line("  Total akan diimport : {$toInsert->count()}");
        $this->line("  Total akan dilewati  : {$toSkip->count()}");
        $this->newLine();

        if ($toInsert->isEmpty()) {
            $this->info('Tidak ada user baru untuk diimport.');

            return self::SUCCESS;
        }

        if ($isDryRun) {
            $this->warn('DRY RUN selesai — tidak ada yang disimpan. Jalankan tanpa --dry-run untuk mengeksekusi.');

            return self::SUCCESS;
        }

        if (! $this->confirm("Lanjutkan import {$toInsert->count()} user ke SSO?", true)) {
            $this->info('Import dibatalkan.');

            return self::SUCCESS;
        }

        $now = now()->toDateTimeString();
        $imported = 0;
        $failed = [];

        foreach ($toInsert as $u) {
            try {
                DB::connection($targetConnection)->table($targetTable)->insert(
                    $this->buildInsertPayload($u, $targetInsertColumns, $now, $copyTwoFactor, $sourceEncrypters)
                );
                $imported++;
            } catch (\Throwable $e) {
                $failed[] = ['email' => $u['email'], 'error' => $e->getMessage()];
            }
        }

        $this->info("Berhasil diimport: {$imported} user.");

        if (! empty($failed)) {
            $this->newLine();
            $this->error('Gagal diimport:');
            $this->table(['Email', 'Error'], array_map(fn (array $f) => [$f['email'], $f['error']], $failed));
        }

        return empty($failed) ? self::SUCCESS : self::FAILURE;
    }

    /**
     * @return Collection<int, array<string,mixed>>
     */
    private function fetchUsers(string $connection, string $table, string $sourceLabel, array $columns): Collection
    {
        return DB::connection($connection)
            ->table($table)
            ->select($columns)
            ->get()
            ->map(fn (object $row) => (array) $row + ['_source' => $sourceLabel]);
    }

    /**
     * @return array<int, string>
     */
    private function resolveTargetInsertColumns(string $targetConnection, string $targetTable, bool $copyTwoFactor): array
    {
        $targetColumns = DB::connection($targetConnection)->getSchemaBuilder()->getColumnListing($targetTable);
        $excludedColumns = $this->resolveExcludedColumns($copyTwoFactor);

        return array_values(array_filter(
            $targetColumns,
            fn (string $column) => ! in_array($column, $excludedColumns, true),
        ));
    }

    /**
     * @return array<int, string>
     */
    private function resolveExcludedColumns(bool $copyTwoFactor): array
    {
        if ($copyTwoFactor) {
            return $this->alwaysExcludedColumns;
        }

        return array_merge($this->alwaysExcludedColumns, $this->twoFactorColumns);
    }

    /**
     * @param  array<int, string>  $targetInsertColumns
     * @return array<int, string>
     */
    private function resolveImportColumnsForSource(string $sourceConnection, string $sourceTable, array $targetInsertColumns): array
    {
        $sourceColumns = DB::connection($sourceConnection)->getSchemaBuilder()->getColumnListing($sourceTable);
        $sourceColumnMap = array_flip($sourceColumns);

        return array_values(array_filter(
            $targetInsertColumns,
            fn (string $column) => isset($sourceColumnMap[$column]),
        ));
    }

    /**
     * @param  array<int, string>  $columns
     * @param  array<int, string>  $requiredColumns
     */
    private function ensureRequiredColumns(array $columns, array $requiredColumns): void
    {
        $missing = array_values(array_diff($requiredColumns, $columns));

        if ($missing !== []) {
            throw new \RuntimeException('Kolom wajib tidak ditemukan pada irisan schema: '.implode(', ', $missing));
        }
    }

    /**
     * @param  array<string, mixed>  $user
     * @param  array<int, string>  $columns
     * @param  array<string, Encrypter>  $sourceEncrypters
     * @return array<string, mixed>
     */
    private function buildInsertPayload(
        array $user,
        array $columns,
        string $now,
        bool $copyTwoFactor,
        array $sourceEncrypters = [],
    ): array {
        $payload = [];

        foreach ($columns as $column) {
            if (array_key_exists($column, $user)) {
                $payload[$column] = $user[$column];
            }
        }

        if (array_key_exists('created_at', $payload) && $payload['created_at'] === null) {
            $payload['created_at'] = $now;
        }

        if (array_key_exists('updated_at', $payload) && $payload['updated_at'] === null) {
            $payload['updated_at'] = $now;
        }

        if ($copyTwoFactor) {
            $payload = $this->reencryptTwoFactorValues($payload, $user, $sourceEncrypters);
        }

        return $payload;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @param  array<string, mixed>  $user
     * @param  array<string, Encrypter>  $sourceEncrypters
     * @return array<string, mixed>
     */
    private function reencryptTwoFactorValues(array $payload, array $user, array $sourceEncrypters): array
    {
        $sourceLabel = $user['_source'] ?? null;

        if (! is_string($sourceLabel) || ! isset($sourceEncrypters[$sourceLabel])) {
            throw new \RuntimeException('Encrypter sumber tidak ditemukan untuk data 2FA user.');
        }

        $sourceEncrypter = $sourceEncrypters[$sourceLabel];

        if (! array_key_exists('two_factor_secret', $payload)) {
            return $payload;
        }

        $secret = $payload['two_factor_secret'];

        if (! is_string($secret) || $secret === '') {
            $payload['two_factor_secret'] = null;
            $payload['two_factor_recovery_codes'] = null;
            $payload['two_factor_confirmed_at'] = null;

            return $payload;
        }

        $decryptedSecret = $sourceEncrypter->decryptString($secret);
        $payload['two_factor_secret'] = Crypt::encryptString($decryptedSecret);

        if (array_key_exists('two_factor_recovery_codes', $payload)) {
            $recoveryCodes = $payload['two_factor_recovery_codes'];

            if (is_string($recoveryCodes) && $recoveryCodes !== '') {
                $payload['two_factor_recovery_codes'] = Crypt::encryptString(
                    $sourceEncrypter->decryptString($recoveryCodes)
                );
            } else {
                $payload['two_factor_recovery_codes'] = null;
            }
        }

        return $payload;
    }

    /**
     * Gabungkan dua koleksi user berdasarkan nama ter-normalisasi.
     * Prioritas: primary (mitra) menang atas secondary (persediaan).
     *
     * @param  Collection<int, array<string,mixed>>  $primary
     * @param  Collection<int, array<string,mixed>>  $secondary
     * @return Collection<int, array<string,mixed>>
     */
    private function mergeByName(Collection $primary, Collection $secondary): Collection
    {
        $indexed = $primary->keyBy(fn (array $u) => $this->normalizeName($u['name']));

        foreach ($secondary as $user) {
            $key = $this->normalizeName($user['name']);

            if (! $indexed->has($key)) {
                $indexed->put($key, $user);
            }
        }

        return $indexed->values();
    }

    private function normalizeName(string $name): string
    {
        $trimmed = trim($name);
        $singleSpaced = preg_replace('/\s+/', ' ', $trimmed);

        return mb_strtolower($singleSpaced ?? $trimmed);
    }

    private function resolveConnectionName(string $option, string $envKey, string $default): string
    {
        $fromOption = $this->option($option);

        if (is_string($fromOption) && $fromOption !== '') {
            return $fromOption;
        }

        $fromEnv = env($envKey);

        if (is_string($fromEnv) && $fromEnv !== '') {
            return $fromEnv;
        }

        return $default;
    }

    /**
     * @return array<string, Encrypter>
     */
    private function resolveSourceEncrypters(): array
    {
        $mitraKey = $this->resolveStringOption('mitra-app-key', 'IMPORT_MITRA_APP_KEY');
        $persediaanKey = $this->resolveStringOption('persediaan-app-key', 'IMPORT_PERSEDIAAN_APP_KEY');

        if ($mitraKey === '' || $persediaanKey === '') {
            throw new \RuntimeException(
                'Saat --copy-two-factor aktif, mitra-app-key dan persediaan-app-key (atau env IMPORT_*_APP_KEY) wajib diisi.'
            );
        }

        $mitraCipher = $this->resolveStringOption('mitra-app-cipher', 'IMPORT_MITRA_APP_CIPHER', 'AES-256-CBC');
        $persediaanCipher = $this->resolveStringOption('persediaan-app-cipher', 'IMPORT_PERSEDIAAN_APP_CIPHER', 'AES-256-CBC');

        return [
            'manajemenmitra' => $this->buildEncrypter($mitraKey, $mitraCipher),
            'manajemenpersediaan' => $this->buildEncrypter($persediaanKey, $persediaanCipher),
        ];
    }

    private function resolveStringOption(string $option, string $envKey, string $default = ''): string
    {
        $fromOption = $this->option($option);

        if (is_string($fromOption) && $fromOption !== '') {
            return $fromOption;
        }

        $fromEnv = env($envKey);

        if (is_string($fromEnv) && $fromEnv !== '') {
            return $fromEnv;
        }

        return $default;
    }

    private function buildEncrypter(string $appKey, string $cipher): Encrypter
    {
        $key = str_starts_with($appKey, 'base64:')
            ? base64_decode(substr($appKey, 7), true)
            : $appKey;

        if (! is_string($key) || $key === '') {
            throw new \RuntimeException('APP_KEY sumber tidak valid untuk migrasi 2FA.');
        }

        if (! Encrypter::supported($key, $cipher)) {
            throw new \RuntimeException("Kombinasi key/cipher tidak didukung untuk migrasi 2FA: {$cipher}");
        }

        return new Encrypter($key, $cipher);
    }

    private function hasConfiguredTwoFactorKeys(): bool
    {
        $mitraKey = $this->resolveStringOption('mitra-app-key', 'IMPORT_MITRA_APP_KEY');
        $persediaanKey = $this->resolveStringOption('persediaan-app-key', 'IMPORT_PERSEDIAAN_APP_KEY');

        return $mitraKey !== '' && $persediaanKey !== '';
    }
}
