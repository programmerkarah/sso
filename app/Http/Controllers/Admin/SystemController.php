<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RestoreDatabaseRequest;
use App\Models\ActivityLog;
use App\Services\EncryptedStateService;
use App\Support\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\Process\Process;

class SystemController extends Controller
{
    public function index(Request $request, EncryptedStateService $encryptedState): Response
    {
        $state = $this->resolveState($request, $encryptedState);

        $currentPage = max(1, (int) ($state['page'] ?? 1));
        $statusFilter = $this->normalizeFilterValue($state['status'] ?? null);
        $categoryFilter = $this->normalizeFilterValue($state['category'] ?? null);

        $logsQuery = ActivityLog::query();

        if ($statusFilter !== null) {
            $logsQuery->where('status', $statusFilter);
        }

        if ($categoryFilter !== null) {
            $logsQuery->where('category', $categoryFilter);
        }

        $logsPaginator = $logsQuery
            ->with('user:id,name,username,email')
            ->orderByDesc('occurred_at')
            ->orderByDesc('id')
            ->paginate(25, ['*'], 'page', $currentPage);

        $logs = [
            'data' => $logsPaginator->getCollection()
                ->map(function (ActivityLog $log) {
                    return [
                        'id' => $log->id,
                        'event' => $log->event,
                        'category' => $log->category,
                        'status' => $log->status,
                        'description' => $log->description,
                        'ip_address' => $log->ip_address,
                        'device_id' => $log->device_id,
                        'user_agent' => $log->user_agent,
                        'metadata' => $log->metadata,
                        'occurred_at' => $log->occurred_at,
                        'user' => $log->user ? [
                            'id' => $log->user->id,
                            'name' => $log->user->name,
                            'username' => $log->user->username,
                            'email' => $log->user->email,
                        ] : null,
                    ];
                })
                ->values()
                ->all(),
            'current_page' => $logsPaginator->currentPage(),
            'from' => $logsPaginator->firstItem(),
            'last_page' => $logsPaginator->lastPage(),
            'per_page' => $logsPaginator->perPage(),
            'to' => $logsPaginator->lastItem(),
            'total' => $logsPaginator->total(),
            'prev_page_token' => $logsPaginator->currentPage() > 1
                ? $encryptedState->encryptArray([
                    'page' => $logsPaginator->currentPage() - 1,
                    'status' => $statusFilter,
                    'category' => $categoryFilter,
                ])
                : null,
            'next_page_token' => $logsPaginator->hasMorePages()
                ? $encryptedState->encryptArray([
                    'page' => $logsPaginator->currentPage() + 1,
                    'status' => $statusFilter,
                    'category' => $categoryFilter,
                ])
                : null,
            'links' => collect(range(1, $logsPaginator->lastPage()))
                ->map(fn (int $page) => [
                    'label' => (string) $page,
                    'token' => $encryptedState->encryptArray([
                        'page' => $page,
                        'status' => $statusFilter,
                        'category' => $categoryFilter,
                    ]),
                    'active' => $page === $logsPaginator->currentPage(),
                ])
                ->all(),
        ];

        $statuses = ActivityLog::query()
            ->select('status')
            ->distinct()
            ->orderBy('status')
            ->pluck('status')
            ->filter(fn ($value) => is_string($value) && $value !== '')
            ->values();

        $categories = ActivityLog::query()
            ->select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category')
            ->filter(fn ($value) => is_string($value) && $value !== '')
            ->values();

        $currentStateToken = $encryptedState->encryptArray([
            'page' => $currentPage,
            'status' => $statusFilter,
            'category' => $categoryFilter,
        ]);

        $statusOptions = $statuses
            ->map(fn (string $status) => [
                'label' => ucfirst($status),
                'token' => $encryptedState->encryptArray([
                    'page' => 1,
                    'status' => $status,
                    'category' => $categoryFilter,
                ]),
            ]);

        $categoryOptions = $categories
            ->map(fn (string $category) => [
                'label' => self::categoryLabel($category),
                'token' => $encryptedState->encryptArray([
                    'page' => 1,
                    'status' => $statusFilter,
                    'category' => $category,
                ]),
            ]);

        $selectedStatusToken = $statusFilter !== null
            ? $statusOptions->firstWhere('label', ucfirst($statusFilter))['token'] ?? null
            : null;

        $selectedCategoryToken = $categoryFilter !== null
            ? $categoryOptions->firstWhere('label', self::categoryLabel($categoryFilter))['token'] ?? null
            : null;

        return Inertia::render('Admin/System/Index', [
            'logs' => $logs,
            'filters' => [
                'status' => $statusFilter,
                'category' => $categoryFilter,
                'current_token' => $currentStateToken,
                'selected_status_token' => $selectedStatusToken,
                'selected_category_token' => $selectedCategoryToken,
                'status_options' => $statusOptions->all(),
                'category_options' => $categoryOptions->all(),
                'clear_status_token' => $encryptedState->encryptArray([
                    'page' => 1,
                    'status' => null,
                    'category' => $categoryFilter,
                ]),
                'clear_category_token' => $encryptedState->encryptArray([
                    'page' => 1,
                    'status' => $statusFilter,
                    'category' => null,
                ]),
                'clear_token' => $encryptedState->encryptArray([
                    'page' => 1,
                    'status' => null,
                    'category' => null,
                ]),
            ],
            'database' => $this->databaseInfo(),
            'server' => $this->serverStatus(),
            'backups' => $this->listBackups(),
        ]);
    }

    public function backup(): RedirectResponse
    {
        $backupPath = storage_path('app/backups');

        if (! File::exists($backupPath)) {
            File::makeDirectory($backupPath, 0755, true);
        }

        $filename = 'backup-'.now()->format('Ymd-His').'.sql';
        $fullPath = $backupPath.DIRECTORY_SEPARATOR.$filename;

        try {
            $dumpOutput = $this->dumpDatabase();
            $fallbackUsed = false;
        } catch (\Throwable $primaryException) {
            $fallbackUsed = true;

            try {
                $dumpOutput = $this->dumpDatabaseUsingLaravelFallback();

                ActivityLogger::log(
                    event: 'database.backup.fallback',
                    category: 'system',
                    description: 'Berhasil membuat backup database menggunakan mode fallback SQL karena mysqldump gagal.',
                    user: request()->user(),
                    metadata: ['error' => $primaryException->getMessage()],
                    status: 'warning',
                );
            } catch (\Throwable $fallbackException) {
                ActivityLogger::log(
                    event: 'database.backup.failed',
                    category: 'system',
                    description: 'Gagal membuat backup database pada mysqldump dan fallback SQL.',
                    user: request()->user(),
                    metadata: [
                        'mysqldump_error' => $primaryException->getMessage(),
                        'fallback_error' => $fallbackException->getMessage(),
                    ],
                    status: 'error',
                );

                return back()->with(
                    'error',
                    'Gagal membuat backup database. Detail: '.$primaryException->getMessage().' | Fallback: '.$fallbackException->getMessage(),
                );
            }
        }

        try {
            File::put($fullPath, $dumpOutput);

            ActivityLogger::log(
                event: 'database.backup.created',
                category: 'system',
                description: "Berhasil membuat backup database {$filename}.",
                user: request()->user(),
                metadata: [
                    'file' => $filename,
                    'backup_mode' => $fallbackUsed ? 'fallback' : 'mysqldump',
                ],
            );

            $message = $fallbackUsed
                ? 'Backup database berhasil dibuat menggunakan mode fallback: '.$filename
                : 'Backup database berhasil dibuat: '.$filename;

            return back()->with('success', $message);
        } catch (\Throwable $exception) {
            ActivityLogger::log(
                event: 'database.backup.failed',
                category: 'system',
                description: 'Gagal membuat backup database.',
                user: request()->user(),
                metadata: ['error' => $exception->getMessage()],
                status: 'error',
            );

            return back()->with('error', 'Gagal membuat backup database: '.$exception->getMessage());
        }
    }

    public function downloadBackup(string $filename)
    {
        $safeFilename = basename($filename);
        $fullPath = storage_path('app/backups'.DIRECTORY_SEPARATOR.$safeFilename);

        abort_unless(File::exists($fullPath), 404);

        return response()->download($fullPath);
    }

    public function restore(RestoreDatabaseRequest $request): RedirectResponse
    {
        $uploaded = $request->file('backup_file');
        $selectedBackupName = $request->string('backup_name')->toString();

        if (! $uploaded && $selectedBackupName === '') {
            return back()->with('error', 'Pilih backup tersimpan atau unggah file backup terlebih dahulu.');
        }

        try {
            if ($selectedBackupName !== '') {
                $safeFilename = basename($selectedBackupName);
                $storedPath = storage_path('app/backups'.DIRECTORY_SEPARATOR.$safeFilename);

                if (! File::exists($storedPath)) {
                    return back()->with('error', 'File backup tersimpan tidak ditemukan.');
                }

                $sqlContent = File::get($storedPath);
                $sourceName = $safeFilename;
                $sourceType = 'storage';
            } else {
                if (! $uploaded) {
                    return back()->with('error', 'File backup tidak ditemukan.');
                }

                $sqlContent = File::get($uploaded->getRealPath());
                $sourceName = $uploaded->getClientOriginalName();
                $sourceType = 'upload';
            }

            $this->restoreDatabase($sqlContent);

            ActivityLogger::log(
                event: 'database.restore.completed',
                category: 'system',
                description: "Berhasil menjalankan restore database dari {$sourceName}.",
                user: $request->user(),
                metadata: [
                    'file_name' => $sourceName,
                    'source_type' => $sourceType,
                ],
            );

            return back()->with('success', 'Restore database berhasil dijalankan.');
        } catch (\Throwable $exception) {
            ActivityLogger::log(
                event: 'database.restore.failed',
                category: 'system',
                description: 'Gagal menjalankan restore database.',
                user: $request->user(),
                metadata: [
                    'file_name' => $selectedBackupName !== '' ? $selectedBackupName : ($uploaded?->getClientOriginalName() ?? 'unknown'),
                    'source_type' => $selectedBackupName !== '' ? 'storage' : 'upload',
                    'error' => $exception->getMessage(),
                ],
                status: 'error',
            );

            return back()->with('error', 'Restore database gagal. Periksa format file backup dan konfigurasi server.');
        }
    }

    /**
     * @return array<string, mixed>
     */
    private static function categoryLabel(string $category): string
    {
        $labels = [
            'authentication' => 'Autentikasi',
            'user_management' => 'Manajemen User',
            'application_management' => 'Manajemen Aplikasi',
            'system' => 'Sistem',
            'system_management' => 'Manajemen Sistem',
            'security' => 'Keamanan',
            'backup' => 'Backup',
            'restore' => 'Restore',
            'settings' => 'Pengaturan',
            'permission' => 'Perizinan',
            'role' => 'Role',
            'two_factor' => 'Autentikasi Dua Faktor',
            'two_factor_authentication' => 'Autentikasi Dua Faktor',
            'password' => 'Password',
            'profile' => 'Profil',
            'oauth' => 'OAuth',
        ];

        return $labels[$category] ?? ucwords(str_replace('_', ' ', $category));
    }

    private function databaseInfo(): array
    {
        $connection = config('database.default');
        $driver = (string) config('database.connections.'.$connection.'.driver');
        $dbName = (string) config('database.connections.'.$connection.'.database');

        if ($driver === 'mysql' || $driver === 'mariadb') {
            $tableCount = (int) DB::table('information_schema.tables')
                ->where('table_schema', $dbName)
                ->count();

            $dbSizeMb = (float) DB::table('information_schema.tables')
                ->where('table_schema', $dbName)
                ->sum(DB::raw('(data_length + index_length) / 1024 / 1024'));
        } else {
            $tableCount = count(DB::select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"));
            $dbSizeMb = 0;
        }

        return [
            'connection' => $connection,
            'database' => $dbName,
            'table_count' => $tableCount,
            'size_mb' => round($dbSizeMb, 2),
            'user_count' => (int) DB::table('users')->count(),
            'application_count' => (int) DB::table('applications')->count(),
            'backup_disk' => config('filesystems.default'),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serverStatus(): array
    {
        $freeDisk = @disk_free_space(base_path()) ?: 0;
        $totalDisk = @disk_total_space(base_path()) ?: 0;

        return [
            'app_env' => config('app.env'),
            'app_debug' => (bool) config('app.debug'),
            'app_url' => config('app.url'),
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'memory_limit' => ini_get('memory_limit'),
            'timezone' => config('app.timezone'),
            'queue_driver' => config('queue.default'),
            'cache_driver' => config('cache.default'),
            'disk_free_gb' => round($freeDisk / 1024 / 1024 / 1024, 2),
            'disk_total_gb' => round($totalDisk / 1024 / 1024 / 1024, 2),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function listBackups(): array
    {
        $backupsDir = storage_path('app/backups');

        if (! File::exists($backupsDir)) {
            return [];
        }

        return collect(File::files($backupsDir))
            ->filter(fn (\SplFileInfo $file) => $file->getExtension() === 'sql')
            ->sortByDesc(fn (\SplFileInfo $file) => $file->getMTime())
            ->take(30)
            ->map(fn (\SplFileInfo $file) => [
                'name' => $file->getFilename(),
                'size_kb' => round($file->getSize() / 1024, 2),
                'modified_at' => date('Y-m-d H:i:s', $file->getMTime()),
                'download_url' => route('admin.system.backups.download', ['filename' => $file->getFilename()]),
            ])
            ->values()
            ->all();
    }

    private function dumpDatabase(): string
    {
        $connection = config('database.connections.'.config('database.default'));
        $binary = $this->resolveDatabaseBinary('mysqldump');
        $host = $this->normalizeMysqlHost((string) ($connection['host'] ?? '127.0.0.1'));
        $command = [
            $binary,
            '--host='.$host,
            '--protocol=tcp',
            '--port='.(string) ($connection['port'] ?? '3306'),
            '--user='.(string) ($connection['username'] ?? 'root'),
            '--password='.(string) ($connection['password'] ?? ''),
            (string) ($connection['database'] ?? ''),
        ];

        $process = new Process($command);
        $process->setTimeout(300);
        $process->run();

        if (! $process->isSuccessful()) {
            throw new \RuntimeException($process->getErrorOutput() ?: 'Unknown mysqldump error.');
        }

        return $process->getOutput();
    }

    private function restoreDatabase(string $sqlContent): void
    {
        // Filter SQL untuk skip tabel users dan sessions
        $filteredSql = $this->filterBackupSql($sqlContent, ['users', 'sessions']);

        $connection = config('database.connections.'.config('database.default'));
        $binary = $this->resolveDatabaseBinary('mysql');
        $host = $this->normalizeMysqlHost((string) ($connection['host'] ?? '127.0.0.1'));

        // Untuk Windows/XAMPP, gunakan named pipe jika host adalah localhost
        $isLocalhost = in_array($host, ['127.0.0.1', 'localhost'], true);
        $protocol = $isLocalhost && PHP_OS_FAMILY === 'Windows' ? 'pipe' : 'tcp';

        $command = [
            $binary,
            '--host='.$host,
            '--protocol='.$protocol,
            '--port='.(string) ($connection['port'] ?? '3306'),
            '--user='.(string) ($connection['username'] ?? 'root'),
            '--password='.(string) ($connection['password'] ?? ''),
            (string) ($connection['database'] ?? ''),
        ];

        $process = new Process($command);
        $process->setTimeout(300);
        $process->setInput($filteredSql);
        $process->run();

        if (! $process->isSuccessful()) {
            throw new \RuntimeException($process->getErrorOutput() ?: 'Unknown mysql restore error.');
        }
    }

    private function filterBackupSql(string $sqlContent, array $skipTables = []): string
    {
        if (empty($skipTables)) {
            return $sqlContent;
        }

        // Pola untuk mendeteksi blok CREATE TABLE dan INSERT untuk tabel tertentu
        $lines = explode("\n", $sqlContent);
        $filtered = [];
        $currentTable = null;
        $skipCurrentBlock = false;

        foreach ($lines as $line) {
            // Deteksi tabel yang sedang diproses
            if (preg_match('/CREATE TABLE.*?`(\w+)`/i', $line, $matches)) {
                $currentTable = $matches[1];
                $skipCurrentBlock = in_array($currentTable, $skipTables, true);
            } elseif (preg_match('/INSERT INTO.*?`(\w+)`/i', $line, $matches)) {
                $currentTable = $matches[1];
                $skipCurrentBlock = in_array($currentTable, $skipTables, true);
            } elseif (preg_match('/DROP TABLE.*?`(\w+)`/i', $line, $matches)) {
                $currentTable = $matches[1];
                $skipCurrentBlock = in_array($currentTable, $skipTables, true);
            }

            // Reset flag jika menemukan delimiter statement baru
            if (trim($line) === '' || preg_match('/^--/', $line)) {
                // Komentar atau baris kosong, lanjutkan
                if (! $skipCurrentBlock) {
                    $filtered[] = $line;
                }

                continue;
            }

            // Akhir statement (semicolon di akhir baris)
            if (str_ends_with(trim($line), ';')) {
                if (! $skipCurrentBlock) {
                    $filtered[] = $line;
                }

                $skipCurrentBlock = false;
                $currentTable = null;
            } elseif (! $skipCurrentBlock) {
                $filtered[] = $line;
            }
        }

        return implode("\n", $filtered);
    }

    private function resolveDatabaseBinary(string $command): string
    {
        $connection = (array) config('database.connections.'.config('database.default'));

        $configPath = $command === 'mysqldump'
            ? ($connection['mysqldump_path'] ?? null)
            : ($connection['mysql_path'] ?? null);

        $candidates = [];

        if (is_string($configPath) && $configPath !== '') {
            $candidates[] = $configPath;
        }

        if (PHP_OS_FAMILY === 'Windows') {
            $executable = $command.'.exe';

            $candidates[] = base_path('..'.DIRECTORY_SEPARATOR.'mysql'.DIRECTORY_SEPARATOR.'bin'.DIRECTORY_SEPARATOR.$executable);
            $candidates[] = 'C:\\xampp\\mysql\\bin\\'.$executable;
            $candidates[] = 'E:\\xampp\\mysql\\bin\\'.$executable;
            $candidates[] = $executable;
        } else {
            $candidates[] = '/usr/bin/'.$command;
            $candidates[] = '/usr/local/bin/'.$command;
            $candidates[] = $command;
        }

        foreach ($candidates as $candidate) {
            if (! is_string($candidate) || $candidate === '') {
                continue;
            }

            if (str_contains($candidate, DIRECTORY_SEPARATOR)) {
                if (File::exists($candidate)) {
                    return $candidate;
                }

                continue;
            }

            if ($this->isCommandAvailable($candidate)) {
                return $candidate;
            }
        }

        throw new \RuntimeException("Utilitas {$command} tidak ditemukan. Pastikan tersedia di PATH atau konfigurasi database.connections.<default>.{$command}_path.");
    }

    private function isCommandAvailable(string $command): bool
    {
        $probeCommand = PHP_OS_FAMILY === 'Windows'
            ? ['where', $command]
            : ['which', $command];

        $process = new Process($probeCommand);
        $process->setTimeout(10);
        $process->run();

        return $process->isSuccessful();
    }

    private function normalizeMysqlHost(string $host): string
    {
        return in_array(strtolower($host), ['localhost', '::1'], true)
            ? '127.0.0.1'
            : $host;
    }

    private function dumpDatabaseUsingLaravelFallback(): string
    {
        $connection = config('database.default');
        $driver = (string) config('database.connections.'.$connection.'.driver');

        if ($driver === 'mysql' || $driver === 'mariadb') {
            return $this->dumpMysqlUsingSqlQueries();
        }

        if ($driver === 'sqlite') {
            return $this->dumpSqliteUsingSqlQueries();
        }

        throw new \RuntimeException('Fallback backup belum mendukung driver database ini.');
    }

    private function dumpMysqlUsingSqlQueries(): string
    {
        $dump = [];
        $dump[] = '-- Laravel fallback SQL dump';
        $dump[] = '-- Generated at '.now()->toDateTimeString();
        $dump[] = 'SET FOREIGN_KEY_CHECKS=0;';

        $tables = DB::select('SHOW TABLES');

        foreach ($tables as $tableRow) {
            $tableName = (string) array_values((array) $tableRow)[0];
            $escapedTableName = str_replace('`', '``', $tableName);

            $createRows = DB::select('SHOW CREATE TABLE `'.$escapedTableName.'`');
            $createTableSql = (array) ($createRows[0] ?? []);
            $createStatement = (string) ($createTableSql['Create Table'] ?? array_values($createTableSql)[1] ?? '');

            $dump[] = '';
            $dump[] = '-- Table: '.$tableName;
            $dump[] = 'DROP TABLE IF EXISTS `'.$escapedTableName.'`;';
            $dump[] = $createStatement.';';

            $rows = DB::table($tableName)->get();

            foreach ($rows as $row) {
                $arrayRow = (array) $row;
                $columns = array_map(
                    static fn (string $column): string => '`'.str_replace('`', '``', $column).'`',
                    array_keys($arrayRow),
                );

                $values = array_map(fn (mixed $value): string => $this->toSqlValue($value), array_values($arrayRow));

                $dump[] = sprintf(
                    'INSERT INTO `%s` (%s) VALUES (%s);',
                    $escapedTableName,
                    implode(', ', $columns),
                    implode(', ', $values),
                );
            }
        }

        $dump[] = 'SET FOREIGN_KEY_CHECKS=1;';

        return implode(PHP_EOL, $dump).PHP_EOL;
    }

    private function dumpSqliteUsingSqlQueries(): string
    {
        $dump = [];
        $dump[] = '-- Laravel fallback SQLite dump';
        $dump[] = '-- Generated at '.now()->toDateTimeString();
        $dump[] = 'PRAGMA foreign_keys = OFF;';

        $tables = DB::select("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");

        foreach ($tables as $table) {
            $tableName = (string) $table->name;
            $createStatement = (string) $table->sql;
            $escapedTableName = str_replace('`', '``', $tableName);

            $dump[] = '';
            $dump[] = '-- Table: '.$tableName;
            $dump[] = 'DROP TABLE IF EXISTS `'.$escapedTableName.'`;';
            $dump[] = $createStatement.';';

            $rows = DB::table($tableName)->get();

            foreach ($rows as $row) {
                $arrayRow = (array) $row;
                $columns = array_map(
                    static fn (string $column): string => '`'.str_replace('`', '``', $column).'`',
                    array_keys($arrayRow),
                );
                $values = array_map(fn (mixed $value): string => $this->toSqlValue($value), array_values($arrayRow));

                $dump[] = sprintf(
                    'INSERT INTO `%s` (%s) VALUES (%s);',
                    $escapedTableName,
                    implode(', ', $columns),
                    implode(', ', $values),
                );
            }
        }

        $dump[] = 'PRAGMA foreign_keys = ON;';

        return implode(PHP_EOL, $dump).PHP_EOL;
    }

    private function toSqlValue(mixed $value): string
    {
        if ($value === null) {
            return 'NULL';
        }

        if (is_bool($value)) {
            return $value ? '1' : '0';
        }

        if (is_int($value) || is_float($value)) {
            return (string) $value;
        }

        $quoted = DB::connection()->getPdo()->quote((string) $value);

        return $quoted !== false ? $quoted : "'".str_replace("'", "''", (string) $value)."'";
    }

    /**
     * @return array<string, mixed>
     */
    private function resolveState(Request $request, EncryptedStateService $encryptedState): array
    {
        return $encryptedState->decryptArray($request->string('state')->toString(), [
            'page' => 1,
            'status' => null,
            'category' => null,
        ]);
    }

    private function normalizeFilterValue(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed !== '' ? $trimmed : null;
    }
}
