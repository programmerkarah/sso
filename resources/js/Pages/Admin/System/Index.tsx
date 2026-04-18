import {
    Activity,
    Database,
    Download,
    HardDrive,
    RefreshCw,
    Server,
    Upload,
    User,
} from 'lucide-react';

import { FormEvent } from 'react';

import { Head, router, useForm } from '@inertiajs/react';

import Button from '@/Components/Button';
import GlassCard from '@/Components/GlassCard';
import AppLayout from '@/Layouts/AppLayout';
import { PageProps } from '@/types';

interface SystemLog {
    id: number;
    event: string;
    category: string;
    description: string;
    ip_address: string | null;
    device_id: string | null;
    user_agent: string | null;
    metadata: Record<string, unknown> | null;
    occurred_at: string;
    user: {
        id: number;
        name: string;
        username: string;
        email: string;
    } | null;
}

interface BackupFile {
    name: string;
    size_kb: number;
    modified_at: string;
    download_url: string;
}

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationMeta {
    current_page: number;
    data: SystemLog[];
    from: number | null;
    to: number | null;
    total: number;
    links: PaginationLinks[];
}

interface AdminSystemPageProps extends PageProps {
    logs: PaginationMeta;
    database: {
        connection: string;
        database: string;
        table_count: number;
        size_mb: number;
        user_count: number;
        application_count: number;
        backup_disk: string;
    };
    server: {
        app_env: string;
        app_debug: boolean;
        app_url: string;
        php_version: string;
        laravel_version: string;
        memory_limit: string;
        timezone: string;
        queue_driver: string;
        cache_driver: string;
        disk_free_gb: number;
        disk_total_gb: number;
    };
    backups: BackupFile[];
}

const formatDateTime = (value?: string | null): string => {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const renderMetadata = (metadata: Record<string, unknown> | null): string => {
    if (!metadata || Object.keys(metadata).length === 0) {
        return '—';
    }

    return JSON.stringify(metadata);
};

export default function Index({ logs, database, server, backups }: AdminSystemPageProps) {
    const restoreForm = useForm<{ backup_file: File | null }>({
        backup_file: null,
    });

    const handleCreateBackup = () => {
        router.post('/admin/system/backups', {}, { preserveScroll: true });
    };

    const handleRestoreSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        restoreForm.post('/admin/system/restore', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                restoreForm.reset();
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Sistem Admin" />

            <div className="mx-auto max-w-7xl space-y-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-4xl font-black text-transparent drop-shadow-xl sm:text-5xl">
                            Sistem Admin
                        </h1>
                        <p className="mt-2 max-w-3xl text-white/80">
                            Pantau kesehatan server, status database, backup dan restore, serta audit log aktivitas penting aplikasi.
                        </p>
                    </div>
                    <Button
                        type="button"
                        onClick={() => router.reload({ only: ['logs', 'database', 'server', 'backups'] })}
                        className="inline-flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh Data
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    <GlassCard>
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-400/20 p-3">
                                <Database className="h-5 w-5 text-blue-100" />
                            </div>
                            <div>
                                <div className="text-sm text-white/70">Jumlah tabel</div>
                                <div className="text-3xl font-black text-white">{database.table_count}</div>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-emerald-400/20 p-3">
                                <User className="h-5 w-5 text-emerald-100" />
                            </div>
                            <div>
                                <div className="text-sm text-white/70">Total pengguna</div>
                                <div className="text-3xl font-black text-white">{database.user_count}</div>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-purple-400/20 p-3">
                                <Activity className="h-5 w-5 text-purple-100" />
                            </div>
                            <div>
                                <div className="text-sm text-white/70">Total log ditampilkan</div>
                                <div className="text-3xl font-black text-white">{logs.total}</div>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-amber-400/20 p-3">
                                <HardDrive className="h-5 w-5 text-amber-100" />
                            </div>
                            <div>
                                <div className="text-sm text-white/70">Disk bebas</div>
                                <div className="text-3xl font-black text-white">{server.disk_free_gb} GB</div>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    <GlassCard>
                        <h2 className="text-xl font-bold text-white">Informasi Database</h2>
                        <div className="mt-4 grid gap-3 text-sm text-white/80">
                            <div>Koneksi: <span className="font-semibold text-white">{database.connection}</span></div>
                            <div>Nama DB: <span className="font-semibold text-white">{database.database}</span></div>
                            <div>Ukuran: <span className="font-semibold text-white">{database.size_mb} MB</span></div>
                            <div>Jumlah aplikasi: <span className="font-semibold text-white">{database.application_count}</span></div>
                            <div>Disk backup: <span className="font-semibold text-white">{database.backup_disk}</span></div>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <h2 className="text-xl font-bold text-white">Status Server</h2>
                        <div className="mt-4 grid gap-3 text-sm text-white/80">
                            <div>Environment: <span className="font-semibold text-white">{server.app_env}</span></div>
                            <div>Debug: <span className="font-semibold text-white">{server.app_debug ? 'Aktif' : 'Nonaktif'}</span></div>
                            <div>PHP: <span className="font-semibold text-white">{server.php_version}</span></div>
                            <div>Laravel: <span className="font-semibold text-white">{server.laravel_version}</span></div>
                            <div>Memory limit: <span className="font-semibold text-white">{server.memory_limit}</span></div>
                            <div>Timezone: <span className="font-semibold text-white">{server.timezone}</span></div>
                            <div>Queue: <span className="font-semibold text-white">{server.queue_driver}</span></div>
                            <div>Cache: <span className="font-semibold text-white">{server.cache_driver}</span></div>
                            <div>Disk total: <span className="font-semibold text-white">{server.disk_total_gb} GB</span></div>
                            <div className="truncate">App URL: <span className="font-semibold text-white">{server.app_url}</span></div>
                        </div>
                    </GlassCard>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    <GlassCard>
                        <h2 className="text-xl font-bold text-white">Backup Database</h2>
                        <p className="mt-1 text-sm text-white/65">Buat backup SQL terbaru dan unduh file backup yang sudah tersedia.</p>

                        <div className="mt-4">
                            <Button type="button" onClick={handleCreateBackup} className="inline-flex items-center gap-2">
                                <Database className="h-4 w-4" />
                                Buat Backup Baru
                            </Button>
                        </div>

                        <div className="mt-5 overflow-x-auto">
                            <table className="w-full min-w-[420px]">
                                <thead>
                                    <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/55">
                                        <th className="py-2">Nama File</th>
                                        <th className="py-2">Ukuran</th>
                                        <th className="py-2">Diubah</th>
                                        <th className="py-2 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/8 text-sm text-white/80">
                                    {backups.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-6 text-center text-white/55">Belum ada backup.</td>
                                        </tr>
                                    ) : (
                                        backups.map((backup) => (
                                            <tr key={backup.name}>
                                                <td className="py-3 pr-2 text-white">{backup.name}</td>
                                                <td className="py-3 pr-2">{backup.size_kb} KB</td>
                                                <td className="py-3 pr-2">{formatDateTime(backup.modified_at)}</td>
                                                <td className="py-3 text-right">
                                                    <a
                                                        href={backup.download_url}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-blue-300/25 bg-blue-500/15 px-3 py-1.5 text-xs font-semibold text-blue-50 transition hover:bg-blue-500/25"
                                                    >
                                                        <Download className="h-3.5 w-3.5" />
                                                        Unduh
                                                    </a>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <h2 className="text-xl font-bold text-white">Restore Database</h2>
                        <p className="mt-1 text-sm text-white/65">Unggah file SQL backup untuk menjalankan restore ke database aktif.</p>

                        <form onSubmit={handleRestoreSubmit} className="mt-4 space-y-4">
                            <div className="rounded-xl border border-white/15 bg-white/5 p-3">
                                <input
                                    type="file"
                                    accept=".sql,.txt"
                                    onChange={(event) =>
                                        restoreForm.setData('backup_file', event.target.files?.[0] ?? null)
                                    }
                                    className="w-full text-sm text-white file:mr-4 file:rounded-lg file:border-0 file:bg-white/15 file:px-3 file:py-2 file:text-white file:transition hover:file:bg-white/25"
                                />
                            </div>

                            {restoreForm.errors.backup_file && (
                                <p className="text-sm text-rose-200">{restoreForm.errors.backup_file}</p>
                            )}

                            <Button type="submit" disabled={restoreForm.processing} className="inline-flex items-center gap-2">
                                <Upload className="h-4 w-4" />
                                {restoreForm.processing ? 'Memproses Restore...' : 'Jalankan Restore'}
                            </Button>
                        </form>
                    </GlassCard>
                </div>

                <GlassCard className="overflow-hidden p-0">
                    <div className="border-b border-white/10 px-6 py-5">
                        <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                            <Server className="h-5 w-5" />
                            Log Aktivitas
                        </h2>
                        <p className="mt-1 text-sm text-white/65">
                            Menampilkan {logs.from ?? 0} sampai {logs.to ?? 0} dari {logs.total} log aktivitas terbaru.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1080px]">
                            <thead>
                                <tr className="border-b border-white/10 bg-black/20 text-left text-xs uppercase tracking-wider text-white/60">
                                    <th className="px-5 py-3">Waktu</th>
                                    <th className="px-5 py-3">Kategori</th>
                                    <th className="px-5 py-3">Event</th>
                                    <th className="px-5 py-3">Deskripsi</th>
                                    <th className="px-5 py-3">Aktor</th>
                                    <th className="px-5 py-3">IP / Device</th>
                                    <th className="px-5 py-3">Metadata</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/8 text-sm text-white/80">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-10 text-center text-white/55">Belum ada log aktivitas.</td>
                                    </tr>
                                ) : (
                                    logs.data.map((log) => (
                                        <tr key={log.id} className="align-top transition hover:bg-white/5">
                                            <td className="px-5 py-4">{formatDateTime(log.occurred_at)}</td>
                                            <td className="px-5 py-4">
                                                <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white/85">
                                                    {log.category}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 font-semibold text-white">{log.event}</td>
                                            <td className="px-5 py-4">{log.description}</td>
                                            <td className="px-5 py-4">
                                                {log.user ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-white">{log.user.name}</span>
                                                        <span className="text-xs text-white/60">@{log.user.username}</span>
                                                    </div>
                                                ) : (
                                                    'Sistem'
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="max-w-[230px] text-xs text-white/70">
                                                    <div>{log.ip_address ?? '—'}</div>
                                                    <div className="truncate">{log.device_id ?? '—'}</div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <code className="block max-w-[320px] truncate rounded bg-black/25 px-2 py-1 text-[11px] text-white/80">
                                                    {renderMetadata(log.metadata)}
                                                </code>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {logs.links.length > 3 && (
                        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/10 px-6 py-4">
                            {logs.links
                                .filter((link) => link.label !== '&laquo; Previous' && link.label !== 'Next &raquo;')
                                .map((link, index) => (
                                    <button
                                        key={`${link.label}-${index}`}
                                        type="button"
                                        onClick={() => link.url && router.visit(link.url, { preserveScroll: true, preserveState: true })}
                                        disabled={!link.url}
                                        className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                                            link.active
                                                ? 'border-white/45 bg-white/20 text-white'
                                                : 'border-white/20 text-white/70 hover:bg-white/10 hover:text-white'
                                        } disabled:cursor-not-allowed disabled:opacity-40`}
                                    >
                                        {link.label}
                                    </button>
                                ))}
                        </div>
                    )}
                </GlassCard>
            </div>
        </AppLayout>
    );
}
