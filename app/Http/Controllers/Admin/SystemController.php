<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RestoreDatabaseRequest;
use App\Models\ActivityLog;
use App\Support\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\Process\Process;

class SystemController extends Controller
{
    public function index(): Response
    {
        $logs = ActivityLog::query()
            ->with('user:id,name,username,email')
            ->orderByDesc('occurred_at')
            ->orderByDesc('id')
            ->paginate(25)
            ->through(function (ActivityLog $log) {
                return [
                    'id' => $log->id,
                    'event' => $log->event,
                    'category' => $log->category,
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
            });

        return Inertia::render('Admin/System/Index', [
            'logs' => $logs,
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

            File::put($fullPath, $dumpOutput);

            ActivityLogger::log(
                event: 'database.backup.created',
                category: 'system',
                description: 'Backup database berhasil dibuat.',
                user: request()->user(),
                metadata: ['file' => $filename],
            );

            return back()->with('success', 'Backup database berhasil dibuat: '.$filename);
        } catch (\Throwable $exception) {
            ActivityLogger::log(
                event: 'database.backup.failed',
                category: 'system',
                description: 'Gagal membuat backup database.',
                user: request()->user(),
                metadata: ['error' => $exception->getMessage()],
            );

            return back()->with('error', 'Gagal membuat backup database. Pastikan utilitas mysqldump tersedia pada server.');
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

        if (! $uploaded) {
            return back()->with('error', 'File backup tidak ditemukan.');
        }

        try {
            $sqlContent = File::get($uploaded->getRealPath());

            $this->restoreDatabase($sqlContent);

            ActivityLogger::log(
                event: 'database.restore.completed',
                category: 'system',
                description: 'Restore database berhasil dijalankan.',
                user: $request->user(),
                metadata: ['file_name' => $uploaded->getClientOriginalName()],
            );

            return back()->with('success', 'Restore database berhasil dijalankan.');
        } catch (\Throwable $exception) {
            ActivityLogger::log(
                event: 'database.restore.failed',
                category: 'system',
                description: 'Restore database gagal dijalankan.',
                user: $request->user(),
                metadata: [
                    'file_name' => $uploaded->getClientOriginalName(),
                    'error' => $exception->getMessage(),
                ],
            );

            return back()->with('error', 'Restore database gagal. Periksa format file backup dan konfigurasi server.');
        }
    }

    /**
     * @return array<string, mixed>
     */
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
        $command = [
            'mysqldump',
            '--host='.(string) ($connection['host'] ?? '127.0.0.1'),
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
        $connection = config('database.connections.'.config('database.default'));
        $command = [
            'mysql',
            '--host='.(string) ($connection['host'] ?? '127.0.0.1'),
            '--port='.(string) ($connection['port'] ?? '3306'),
            '--user='.(string) ($connection['username'] ?? 'root'),
            '--password='.(string) ($connection['password'] ?? ''),
            (string) ($connection['database'] ?? ''),
        ];

        $process = new Process($command);
        $process->setTimeout(300);
        $process->setInput($sqlContent);
        $process->run();

        if (! $process->isSuccessful()) {
            throw new \RuntimeException($process->getErrorOutput() ?: 'Unknown mysql restore error.');
        }
    }
}
