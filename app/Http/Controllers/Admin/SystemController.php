<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CreateBackupRequest;
use App\Http\Requests\Admin\RestoreDatabaseRequest;
use App\Http\Requests\Admin\UpdateBackupMetadataRequest;
use App\Models\ActivityLog;
use App\Services\EncryptedStateService;
use App\Support\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
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

    public function databaseTables(Request $request, EncryptedStateService $encryptedState): Response
    {
        $state = $this->resolveDatabaseTableState($request, $encryptedState);
        $search = trim((string) ($state['search'] ?? ''));
        $selectedTable = trim((string) ($state['table'] ?? ''));
        $currentPage = max(1, (int) ($state['page'] ?? 1));

        $tables = collect($this->listDatabaseTables())
            ->filter(function (array $table) use ($search) {
                if ($search === '') {
                    return true;
                }

                return str_contains(Str::lower($table['name']), Str::lower($search));
            })
            ->values();

        $tableNames = $tables->pluck('name')->all();
        $activeTable = in_array($selectedTable, $tableNames, true)
            ? $selectedTable
            : ($tableNames[0] ?? null);

        $currentStateToken = $encryptedState->encryptArray([
            'search' => $search,
            'table' => $activeTable,
            'page' => $currentPage,
        ]);

        $tableEntries = $tables->map(fn (array $table) => [
            ...$table,
            'token' => $encryptedState->encryptArray([
                'search' => $search,
                'table' => $table['name'],
                'page' => 1,
            ]),
        ])->values();

        $tableColumns = $activeTable ? $this->describeDatabaseTable($activeTable) : [];
        $primaryKey = $this->resolvePrimaryKeyColumn($tableColumns);

        return Inertia::render('Admin/System/DatabaseTables', [
            'database' => $this->databaseInfo(),
            'filters' => [
                'search' => $search,
                'table' => $activeTable,
                'current_token' => $currentStateToken,
            ],
            'tables' => $tableEntries->all(),
            'selected_table' => $activeTable ? [
                'name' => $activeTable,
                'primary_key' => $primaryKey,
                'columns' => $tableColumns,
                'rows' => $this->previewDatabaseTable(
                    tableName: $activeTable,
                    columns: $tableColumns,
                    page: $currentPage,
                    search: $search,
                    encryptedState: $encryptedState,
                ),
            ] : null,
        ]);
    }

    public function navigateDatabaseTables(Request $request, EncryptedStateService $encryptedState): RedirectResponse
    {
        $token = $encryptedState->encryptArray([
            'search' => trim($request->string('search')->toString()),
            'table' => trim($request->string('table')->toString()) ?: null,
            'page' => max(1, (int) $request->integer('page', 1)),
        ]);

        return redirect()->route('admin.system.database-tables', ['state' => $token]);
    }

    public function updateDatabaseTableRow(Request $request, EncryptedStateService $encryptedState): RedirectResponse
    {
        $rowToken = $request->string('row_token')->toString();
        $rowState = $encryptedState->decryptArray($rowToken, []);

        $tableName = trim((string) ($rowState['table'] ?? ''));
        $primaryKey = trim((string) ($rowState['primary_key'] ?? ''));
        $rowKey = (string) ($rowState['row_key'] ?? '');
        $returnState = is_string($rowState['return_state'] ?? null)
            ? $rowState['return_state']
            : null;

        if ($tableName === '' || $primaryKey === '' || $rowKey === '') {
            return back()->with('error', 'Token edit data tabel tidak valid.');
        }

        $tableColumns = $this->describeDatabaseTable($tableName);
        $allowedColumns = collect($tableColumns)
            ->pluck('name')
            ->filter(fn ($column) => is_string($column) && $column !== $primaryKey)
            ->values()
            ->all();

        $payload = $request->input('values', []);

        if (! is_array($payload)) {
            return back()->with('error', 'Data edit tabel tidak valid.');
        }

        $updates = collect($payload)
            ->filter(function ($value, $column) use ($allowedColumns, $tableColumns) {
                if (! is_string($column) || ! in_array($column, $allowedColumns, true)) {
                    return false;
                }

                $columnDefinition = collect($tableColumns)
                    ->first(fn (array $item) => ($item['name'] ?? null) === $column);

                return ! is_array($columnDefinition) || $this->isAllowedEditableColumn($column, $columnDefinition);
            })
            ->map(function ($value, $column) use ($tableColumns) {
                $columnDefinition = collect($tableColumns)
                    ->first(fn (array $item) => ($item['name'] ?? null) === $column);

                return $this->normalizeSubmittedColumnValue($value, is_array($columnDefinition) ? $columnDefinition : []);
            })
            ->all();

        if ($updates === []) {
            return back()->with('error', 'Tidak ada perubahan yang bisa disimpan.');
        }

        DB::table($tableName)
            ->where($primaryKey, $this->castPrimaryKeyValue($rowKey, $tableColumns, $primaryKey))
            ->update($updates);

        ActivityLogger::log(
            event: 'database.table.row.updated',
            category: 'system',
            description: "Berhasil memperbarui data tabel {$tableName}.",
            user: $request->user(),
            metadata: [
                'table' => $tableName,
                'primary_key' => $primaryKey,
                'row_key' => $rowKey,
                'updated_columns' => array_keys($updates),
            ],
        );

        return $returnState
            ? redirect()->route('admin.system.database-tables', ['state' => $returnState])->with('success', 'Data tabel berhasil diperbarui.')
            : back()->with('success', 'Data tabel berhasil diperbarui.');
    }

    public function backup(CreateBackupRequest $request): RedirectResponse
    {
        $backupPath = storage_path('app/backups');

        if (! File::exists($backupPath)) {
            File::makeDirectory($backupPath, 0755, true);
        }

        $title = $this->sanitizeBackupTitle($request->string('backup_title')->toString());
        $description = $this->sanitizeBackupDescription($request->string('backup_description')->toString());

        $filename = $this->buildBackupFilename($title);
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
                    'title' => $title,
                    'description' => $description,
                    'backup_mode' => $fallbackUsed ? 'fallback' : 'mysqldump',
                ],
            );

            $metadata = $this->readBackupMetadataMap();
            $metadata[$filename] = [
                'title' => $title,
                'description' => $description,
                'created_at' => now()->toDateTimeString(),
            ];
            $this->writeBackupMetadataMap($metadata);

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

    public function destroyBackup(Request $request, string $filename): RedirectResponse
    {
        $safeFilename = basename($filename);
        $fullPath = storage_path('app/backups'.DIRECTORY_SEPARATOR.$safeFilename);

        if (! File::exists($fullPath) || ! str_ends_with(strtolower($safeFilename), '.sql')) {
            return back()->with('error', 'File backup SQL tidak ditemukan.');
        }

        $metadata = $this->readBackupMetadataMap();
        $backupMetadata = is_array($metadata[$safeFilename] ?? null)
            ? $metadata[$safeFilename]
            : [];

        File::delete($fullPath);

        if (array_key_exists($safeFilename, $metadata)) {
            unset($metadata[$safeFilename]);
            $this->writeBackupMetadataMap($metadata);
        }

        ActivityLogger::log(
            event: 'database.backup.deleted',
            category: 'system',
            description: "Berhasil menghapus backup database {$safeFilename}.",
            user: $request->user(),
            metadata: [
                'file' => $safeFilename,
                'title' => is_string($backupMetadata['title'] ?? null) ? $backupMetadata['title'] : null,
                'description' => is_string($backupMetadata['description'] ?? null) ? $backupMetadata['description'] : null,
            ],
        );

        return back()->with('success', 'Backup database berhasil dihapus.');
    }

    public function updateBackupMetadata(UpdateBackupMetadataRequest $request, string $filename): RedirectResponse
    {
        $safeFilename = basename($filename);
        $fullPath = storage_path('app/backups'.DIRECTORY_SEPARATOR.$safeFilename);

        if (! File::exists($fullPath) || ! str_ends_with(strtolower($safeFilename), '.sql')) {
            return back()->with('error', 'File backup SQL tidak ditemukan.');
        }

        $title = $this->sanitizeBackupTitle($request->string('backup_title')->toString());
        $description = $this->sanitizeBackupDescription($request->string('backup_description')->toString());

        $metadata = $this->readBackupMetadataMap();
        $existingCreatedAt = is_array($metadata[$safeFilename] ?? null) && is_string($metadata[$safeFilename]['created_at'] ?? null)
            ? trim((string) $metadata[$safeFilename]['created_at'])
            : '';

        $metadata[$safeFilename] = [
            'title' => $title,
            'description' => $description,
            'created_at' => $existingCreatedAt !== '' ? $existingCreatedAt : now()->toDateTimeString(),
        ];

        $this->writeBackupMetadataMap($metadata);

        ActivityLogger::log(
            event: 'database.backup.metadata.updated',
            category: 'system',
            description: "Berhasil memperbarui metadata backup {$safeFilename}.",
            user: $request->user(),
            metadata: [
                'file' => $safeFilename,
                'title' => $title,
                'description' => $description,
            ],
        );

        return back()->with('success', 'Metadata backup berhasil diperbarui.');
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
     * @return array<int, array<string, mixed>>
     */
    private function listDatabaseTables(): array
    {
        $connection = config('database.default');
        $driver = (string) config('database.connections.'.$connection.'.driver');
        $databaseName = (string) config('database.connections.'.$connection.'.database');

        if ($driver === 'mysql' || $driver === 'mariadb') {
            return DB::table('information_schema.tables')
                ->where('table_schema', $databaseName)
                ->where('table_type', 'BASE TABLE')
                ->orderBy('table_name')
                ->get([
                    'table_name as name',
                    'engine',
                    'table_rows as row_count',
                    'data_length',
                    'index_length',
                ])
                ->map(function (object $table) use ($databaseName) {
                    $columnCount = (int) DB::table('information_schema.columns')
                        ->where('table_schema', $databaseName)
                        ->where('table_name', $table->name)
                        ->count();

                    return [
                        'name' => (string) $table->name,
                        'engine' => $table->engine,
                        'row_count' => (int) ($table->row_count ?? 0),
                        'column_count' => $columnCount,
                        'size_kb' => round(((int) ($table->data_length ?? 0) + (int) ($table->index_length ?? 0)) / 1024, 2),
                    ];
                })
                ->values()
                ->all();
        }

        if ($driver === 'sqlite') {
            return collect(DB::select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"))
                ->map(function (object $table) {
                    $name = (string) $table->name;
                    $columnCount = count(DB::select('PRAGMA table_info('.$this->quoteSqliteIdentifier($name).')'));
                    $rowCount = (int) DB::table($name)->count();

                    return [
                        'name' => $name,
                        'engine' => 'sqlite',
                        'row_count' => $rowCount,
                        'column_count' => $columnCount,
                        'size_kb' => 0,
                    ];
                })
                ->values()
                ->all();
        }

        return [];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function describeDatabaseTable(string $tableName): array
    {
        $connection = config('database.default');
        $driver = (string) config('database.connections.'.$connection.'.driver');
        $safeTableName = $this->escapeIdentifier($tableName);

        if ($driver === 'mysql' || $driver === 'mariadb') {
            $foreignKeys = $this->listMysqlForeignKeys($tableName);

            return collect(DB::select('SHOW FULL COLUMNS FROM `'.$safeTableName.'`'))
                ->map(function (object $column) use ($foreignKeys) {
                    $columnName = (string) $column->Field;
                    $type = (string) $column->Type;

                    return [
                        'name' => $columnName,
                        'type' => $type,
                        'nullable' => (string) $column->Null === 'YES',
                        'key' => (string) ($column->Key ?? ''),
                        'default' => $column->Default,
                        'extra' => (string) ($column->Extra ?? ''),
                        'enum_values' => $this->parseEnumValues($type),
                        'foreign_key' => $this->buildForeignKeyMetadata($foreignKeys[$columnName] ?? null),
                    ];
                })
                ->values()
                ->all();
        }

        if ($driver === 'sqlite') {
            return collect(DB::select('PRAGMA table_info('.$this->quoteSqliteIdentifier($tableName).')'))
                ->map(fn (object $column) => [
                    'name' => (string) $column->name,
                    'type' => (string) $column->type,
                    'nullable' => (int) $column->notnull === 0,
                    'key' => (int) $column->pk === 1 ? 'PRI' : '',
                    'default' => $column->dflt_value,
                    'extra' => '',
                    'enum_values' => [],
                    'foreign_key' => null,
                ])
                ->values()
                ->all();
        }

        return [];
    }

    /**
     * @return array<string, mixed>
     */
    private function previewDatabaseTable(
        string $tableName,
        array $columns,
        int $page = 1,
        string $search = '',
        ?EncryptedStateService $encryptedState = null,
    ): array
    {
        $perPage = 25;
        $paginator = DB::table($tableName)->paginate($perPage, ['*'], 'page', $page);
        $primaryKey = $this->resolvePrimaryKeyColumn($columns);
        $primaryKeyType = $this->resolveColumnType($columns, $primaryKey);

        return [
            'data' => collect($paginator->items())
                ->map(function (object $row) use ($tableName, $primaryKey, $primaryKeyType, $page, $search, $encryptedState) {
                    $rowData = (array) $row;

                    if (! $encryptedState || ! $primaryKey || ! array_key_exists($primaryKey, $rowData)) {
                        return [
                            ...$rowData,
                            '__row_token' => null,
                        ];
                    }

                    return [
                        ...$rowData,
                        '__row_token' => $encryptedState->encryptArray([
                            'table' => $tableName,
                            'primary_key' => $primaryKey,
                            'row_key' => (string) $rowData[$primaryKey],
                            'primary_key_type' => $primaryKeyType,
                            'return_state' => $encryptedState->encryptArray([
                                'search' => $search,
                                'table' => $tableName,
                                'page' => $page,
                            ]),
                        ]),
                    ];
                })
                ->values()
                ->all(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
            'total' => $paginator->total(),
            'per_page' => $paginator->perPage(),
            'prev_page_token' => $encryptedState && $paginator->currentPage() > 1
                ? $encryptedState->encryptArray([
                    'search' => $search,
                    'table' => $tableName,
                    'page' => $paginator->currentPage() - 1,
                ])
                : null,
            'next_page_token' => $encryptedState && $paginator->hasMorePages()
                ? $encryptedState->encryptArray([
                    'search' => $search,
                    'table' => $tableName,
                    'page' => $paginator->currentPage() + 1,
                ])
                : null,
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

        $metadataMap = $this->readBackupMetadataMap();

        return collect(File::files($backupsDir))
            ->filter(fn (\SplFileInfo $file) => $file->getExtension() === 'sql')
            ->sortByDesc(fn (\SplFileInfo $file) => $file->getMTime())
            ->take(30)
            ->map(function (\SplFileInfo $file) use ($metadataMap) {
                $filename = $file->getFilename();
                $entry = $metadataMap[$filename] ?? [];

                $title = is_array($entry) && isset($entry['title']) && is_string($entry['title'])
                    ? trim($entry['title'])
                    : null;
                $description = is_array($entry) && isset($entry['description']) && is_string($entry['description'])
                    ? trim($entry['description'])
                    : null;

                return [
                    'name' => $filename,
                    'title' => $title !== '' ? $title : null,
                    'description' => $description !== '' ? $description : null,
                    'size_kb' => round($file->getSize() / 1024, 2),
                    'modified_at' => date('Y-m-d H:i:s', $file->getMTime()),
                    'download_url' => route('admin.system.backups.download', ['filename' => $filename]),
                ];
            })
            ->values()
            ->all();
    }

    private function buildBackupFilename(?string $title): string
    {
        $timestamp = now()->format('Ymd-His');

        if (! is_string($title) || $title === '') {
            return 'backup-'.$timestamp.'.sql';
        }

        $slug = Str::slug(Str::limit($title, 40, ''), '-');
        $suffix = $slug !== '' ? '-'.$slug : '';

        return 'backup-'.$timestamp.$suffix.'.sql';
    }

    /**
     * @return array<string, array<string, string>>
     */
    private function readBackupMetadataMap(): array
    {
        $path = $this->backupMetadataPath();

        if (! File::exists($path)) {
            return [];
        }

        $decoded = json_decode((string) File::get($path), true);

        if (! is_array($decoded)) {
            return [];
        }

        return collect($decoded)
            ->filter(fn ($value, $key) => is_string($key) && is_array($value))
            ->map(fn (array $value) => [
                'title' => isset($value['title']) && is_string($value['title']) ? trim($value['title']) : '',
                'description' => isset($value['description']) && is_string($value['description']) ? trim($value['description']) : '',
                'created_at' => isset($value['created_at']) && is_string($value['created_at']) ? trim($value['created_at']) : '',
            ])
            ->all();
    }

    /**
     * @param  array<string, array<string, string>>  $metadata
     */
    private function writeBackupMetadataMap(array $metadata): void
    {
        $path = $this->backupMetadataPath();

        File::put(
            $path,
            json_encode($metadata, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
        );
    }

    private function backupMetadataPath(): string
    {
        return storage_path('app/backups/backup-metadata.json');
    }

    private function escapeIdentifier(string $identifier): string
    {
        return str_replace('`', '``', $identifier);
    }

    private function quoteSqliteIdentifier(string $identifier): string
    {
        return '"'.str_replace('"', '""', $identifier).'"';
    }

    /**
     * @return array<string, array<string, string>>
     */
    private function listMysqlForeignKeys(string $tableName): array
    {
        $connection = config('database.default');
        $databaseName = (string) config('database.connections.'.$connection.'.database');

        return collect(DB::table('information_schema.KEY_COLUMN_USAGE')
            ->where('TABLE_SCHEMA', $databaseName)
            ->where('TABLE_NAME', $tableName)
            ->whereNotNull('REFERENCED_TABLE_NAME')
            ->get([
                'COLUMN_NAME',
                'REFERENCED_TABLE_NAME',
                'REFERENCED_COLUMN_NAME',
            ]))
            ->mapWithKeys(fn (object $key) => [
                (string) $key->COLUMN_NAME => [
                    'table' => (string) $key->REFERENCED_TABLE_NAME,
                    'column' => (string) $key->REFERENCED_COLUMN_NAME,
                ],
            ])
            ->all();
    }

    /**
     * @return array<int, string>
     */
    private function parseEnumValues(string $type): array
    {
        if (! preg_match('/^enum\((.*)\)$/i', $type, $matches)) {
            return [];
        }

        preg_match_all("/'((?:[^'\\]|\\.)*)'/", $matches[1], $valueMatches);

        return collect($valueMatches[1] ?? [])
            ->map(fn (string $value) => stripcslashes($value))
            ->values()
            ->all();
    }

    /**
     * @param  array<string, string>|null  $reference
     * @return array<string, mixed>|null
     */
    private function buildForeignKeyMetadata(?array $reference): ?array
    {
        if (! $reference) {
            return null;
        }

        $referenceTable = $reference['table'] ?? null;
        $referenceColumn = $reference['column'] ?? null;

        if (! is_string($referenceTable) || ! is_string($referenceColumn) || $referenceTable === '' || $referenceColumn === '') {
            return null;
        }

        $labelColumn = $this->resolveReferenceLabelColumn($referenceTable, $referenceColumn);
        $query = DB::table($referenceTable)->orderBy($labelColumn ?? $referenceColumn);
        $rows = $labelColumn && $labelColumn !== $referenceColumn
            ? $query->get([$referenceColumn, $labelColumn])
            : $query->get([$referenceColumn]);

        return [
            'table' => $referenceTable,
            'column' => $referenceColumn,
            'label_column' => $labelColumn,
            'options' => collect($rows)
                ->map(function (object $row) use ($referenceColumn, $labelColumn) {
                    $value = $row->{$referenceColumn};
                    $labelSource = $labelColumn ? ($row->{$labelColumn} ?? $value) : $value;

                    return [
                        'value' => $value,
                        'label' => is_scalar($labelSource) || $labelSource === null
                            ? (string) $labelSource
                            : json_encode($labelSource, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                    ];
                })
                ->values()
                ->all(),
        ];
    }

    private function resolveReferenceLabelColumn(string $tableName, string $fallbackColumn): ?string
    {
        $availableColumns = collect($this->describeReferenceTableColumns($tableName));
        $preferredColumns = ['name', 'title', 'label', 'display_name', 'username', 'email', 'code', 'slug'];

        foreach ($preferredColumns as $candidate) {
            if ($availableColumns->contains($candidate)) {
                return $candidate;
            }
        }

        return $availableColumns->contains($fallbackColumn) ? $fallbackColumn : null;
    }

    /**
     * @return array<int, string>
     */
    private function describeReferenceTableColumns(string $tableName): array
    {
        $safeTableName = $this->escapeIdentifier($tableName);

        return collect(DB::select('SHOW COLUMNS FROM `'.$safeTableName.'`'))
            ->map(fn (object $column) => (string) $column->Field)
            ->values()
            ->all();
    }

    private function normalizeSubmittedColumnValue(mixed $value, array $columnDefinition): mixed
    {
        if (is_array($value) || is_object($value)) {
            $value = json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }

        if ($value === '' && ($columnDefinition['nullable'] ?? false)) {
            return null;
        }

        $enumValues = is_array($columnDefinition['enum_values'] ?? null)
            ? $columnDefinition['enum_values']
            : [];

        if ($enumValues !== [] && $value !== null && ! in_array((string) $value, $enumValues, true)) {
            abort(422, 'Nilai enum yang dipilih tidak valid.');
        }

        $foreignKey = is_array($columnDefinition['foreign_key'] ?? null)
            ? $columnDefinition['foreign_key']
            : null;

        if ($foreignKey && $value !== null) {
            $referenceTable = $foreignKey['table'] ?? null;
            $referenceColumn = $foreignKey['column'] ?? null;

            if (is_string($referenceTable) && is_string($referenceColumn)) {
                $exists = DB::table($referenceTable)
                    ->where($referenceColumn, $value)
                    ->exists();

                if (! $exists) {
                    abort(422, 'Referensi foreign key yang dipilih tidak valid.');
                }
            }
        }

        return $value;
    }

    private function isAllowedEditableColumn(string $columnName, array $columnDefinition): bool
    {
        $type = Str::lower((string) ($columnDefinition['type'] ?? ''));
        $isTimestampType = str_contains($type, 'timestamp') || str_contains($type, 'datetime');

        if (! $isTimestampType) {
            return true;
        }

        return in_array($columnName, ['created_at', 'updated_at'], true);
    }

    private function resolvePrimaryKeyColumn(array $columns): ?string
    {
        $primaryKey = collect($columns)->first(fn (array $column) => ($column['key'] ?? '') === 'PRI');

        return is_array($primaryKey) && is_string($primaryKey['name'] ?? null)
            ? $primaryKey['name']
            : null;
    }

    private function resolveColumnType(array $columns, ?string $columnName): ?string
    {
        if (! $columnName) {
            return null;
        }

        $column = collect($columns)->first(fn (array $item) => ($item['name'] ?? null) === $columnName);

        return is_array($column) && is_string($column['type'] ?? null)
            ? $column['type']
            : null;
    }

    private function castPrimaryKeyValue(string $value, array $columns, string $primaryKey): mixed
    {
        $type = Str::lower((string) $this->resolveColumnType($columns, $primaryKey));

        if ($type !== '' && (str_contains($type, 'int') || str_contains($type, 'decimal') || str_contains($type, 'float') || str_contains($type, 'double'))) {
            return is_numeric($value) ? $value + 0 : $value;
        }

        return $value;
    }

    /**
     * @return array<string, mixed>
     */
    private function resolveDatabaseTableState(Request $request, EncryptedStateService $encryptedState): array
    {
        return $encryptedState->decryptArray($request->string('state')->toString(), [
            'search' => '',
            'table' => null,
            'page' => 1,
        ]);
    }

    private function sanitizeBackupTitle(string $value): ?string
    {
        $normalized = trim($value);

        return $normalized === '' ? null : Str::limit($normalized, 120, '');
    }

    private function sanitizeBackupDescription(string $value): ?string
    {
        $normalized = trim($value);

        return $normalized === '' ? null : Str::limit($normalized, 500, '');
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
