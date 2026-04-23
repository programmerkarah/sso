import {
    Activity,
    Check,
    ChevronLeft,
    ChevronRight,
    Copy,
    Database,
    Download,
    Eye,
    HardDrive,
    MoreHorizontal,
    RefreshCw,
    Server,
    SquarePen,
    Trash2,
    Upload,
    User,
    X,
} from 'lucide-react';

import { FormEvent, useEffect, useState } from 'react';

import { Head, router, useForm } from '@inertiajs/react';

import Button from '@/Components/Button';
import ConfirmationModal from '@/Components/ConfirmationModal';
import GlassCard from '@/Components/GlassCard';
import GlassSelect from '@/Components/GlassSelect';
import AppLayout from '@/Layouts/AppLayout';
import { PageProps } from '@/types';

interface SystemLog {
    id: number;
    event: string;
    category: string;
    status: 'success' | 'error' | 'warning' | string;
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
    title: string | null;
    description: string | null;
    size_kb: number;
    modified_at: string;
    download_url: string;
}

interface PaginationLinks {
    token: string;
    label: string;
    active: boolean;
}

interface PaginationMeta {
    current_page: number;
    data: SystemLog[];
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    prev_page_token: string | null;
    next_page_token: string | null;
    links: PaginationLinks[];
}

interface FilterOption {
    label: string;
    token: string;
}

interface ConfirmModal {
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    confirmVariant: 'amber' | 'red' | 'emerald';
    onConfirm: () => void;
}

type CollapsedPaginationItem =
    | PaginationLinks
    | {
          type: 'ellipsis';
          key: string;
      };

interface AdminSystemPageProps extends PageProps {
    logs: PaginationMeta;
    filters: {
        status: string | null;
        category: string | null;
        current_token: string;
        selected_status_token: string | null;
        selected_category_token: string | null;
        status_options: FilterOption[];
        category_options: FilterOption[];
        clear_token: string;
        clear_status_token: string;
        clear_category_token: string;
    };
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

const renderMetadataForModal = (
    metadata: Record<string, unknown> | null,
): string => {
    if (!metadata || Object.keys(metadata).length === 0) {
        return '—';
    }

    return JSON.stringify(metadata, null, 2);
};

const collapsePaginationLinks = (
    links: PaginationLinks[],
): CollapsedPaginationItem[] => {
    if (links.length <= 7) {
        return links;
    }

    const activeIndex = links.findIndex((link) => link.active);
    const safeActiveIndex = activeIndex >= 0 ? activeIndex : 0;
    const candidateIndexes = new Set<number>([
        0,
        links.length - 1,
        safeActiveIndex - 1,
        safeActiveIndex,
        safeActiveIndex + 1,
    ]);

    const sortedIndexes = Array.from(candidateIndexes)
        .filter((index) => index >= 0 && index < links.length)
        .sort((a, b) => a - b);

    const collapsed: CollapsedPaginationItem[] = [];

    sortedIndexes.forEach((index, position) => {
        const previousIndex = sortedIndexes[position - 1];

        if (position > 0 && index - previousIndex > 1) {
            collapsed.push({
                type: 'ellipsis',
                key: `ellipsis-${previousIndex}-${index}`,
            });
        }

        collapsed.push(links[index]);
    });

    return collapsed;
};

export default function Index({
    logs,
    filters,
    database,
    server,
    backups,
}: AdminSystemPageProps) {
    const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
    const [copied, setCopied] = useState(false);
    const [editingBackup, setEditingBackup] = useState<BackupFile | null>(null);
    const [deletingBackupName, setDeletingBackupName] = useState<string | null>(
        null,
    );
    const [modal, setModal] = useState<ConfirmModal>({
        isOpen: false,
        title: '',
        description: '',
        confirmLabel: '',
        confirmVariant: 'red',
        onConfirm: () => {},
    });

    const createBackupForm = useForm<{
        backup_title: string;
        backup_description: string;
    }>({
        backup_title: '',
        backup_description: '',
    });

    const restoreOptions = backups.map((backup) => ({
        label: backup.title
            ? `${backup.title} (${backup.name}) • ${backup.size_kb} KB`
            : `${backup.name} • ${backup.size_kb} KB`,
        value: backup.name,
    }));

    const collapsedPaginationItems = collapsePaginationLinks(logs.links);

    const statusFilterOptions = filters.status_options.map((option) => ({
        label: option.label,
        value: option.token,
    }));

    const categoryFilterOptions = filters.category_options.map((option) => ({
        label: option.label,
        value: option.token,
    }));

    const selectedStatusToken = filters.selected_status_token ?? '';
    const selectedCategoryToken = filters.selected_category_token ?? '';

    const restoreForm = useForm<{
        backup_file: File | null;
        backup_name: string;
    }>({
        backup_file: null,
        backup_name: '',
    });

    const editBackupForm = useForm<{
        backup_title: string;
        backup_description: string;
    }>({
        backup_title: '',
        backup_description: '',
    });

    const handleCreateBackup = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        createBackupForm.post('/admin/system/backups', {
            preserveScroll: true,
            onSuccess: () => {
                createBackupForm.reset();
            },
        });
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

    const openEditBackupModal = (backup: BackupFile) => {
        setEditingBackup(backup);
        editBackupForm.clearErrors();
        editBackupForm.setData({
            backup_title: backup.title ?? '',
            backup_description: backup.description ?? '',
        });
    };

    const closeEditBackupModal = () => {
        setEditingBackup(null);
        editBackupForm.reset();
        editBackupForm.clearErrors();
    };

    const handleEditBackupSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!editingBackup) {
            return;
        }

        editBackupForm.put(
            `/admin/system/backups/${encodeURIComponent(editingBackup.name)}/metadata`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    closeEditBackupModal();
                },
            },
        );
    };

    const handleDeleteBackup = (backup: BackupFile) => {
        const backupLabel = backup.title || backup.name;
        setModal({
            isOpen: true,
            title: 'Hapus Backup Database',
            description: `Backup "${backupLabel}" akan dihapus permanen dari penyimpanan. Tindakan ini tidak dapat dibatalkan.`,
            confirmLabel: 'Ya, Hapus Backup',
            confirmVariant: 'red',
            onConfirm: () => {
                setDeletingBackupName(backup.name);

                router.delete(
                    `/admin/system/backups/${encodeURIComponent(backup.name)}`,
                    {
                        preserveScroll: true,
                        onFinish: () => {
                            setDeletingBackupName(null);
                        },
                    },
                );

                closeModal();
            },
        });
    };

    const closeModal = () => {
        setModal((prev) => ({ ...prev, isOpen: false }));
    };

    const visitState = (state: string) => {
        router.get(
            '/admin/system',
            { state },
            { preserveScroll: true, preserveState: true },
        );
    };

    const handleCopyLogDetails = async () => {
        if (!selectedLog) {
            return;
        }

        const payload = {
            waktu: formatDateTime(selectedLog.occurred_at),
            kategori: selectedLog.category,
            status: selectedLog.status,
            event: selectedLog.event,
            deskripsi: selectedLog.description,
            aktor: selectedLog.user
                ? `${selectedLog.user.name} (@${selectedLog.user.username})`
                : 'Sistem',
            ip_address: selectedLog.ip_address,
            device_id: selectedLog.device_id,
            user_agent: selectedLog.user_agent,
            metadata: selectedLog.metadata,
        };

        await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        const originalBodyOverflow = document.body.style.overflow;
        const originalHtmlOverflow = document.documentElement.style.overflow;

        if (selectedLog) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        }

        return () => {
            document.body.style.overflow = originalBodyOverflow;
            document.documentElement.style.overflow = originalHtmlOverflow;
        };
    }, [selectedLog]);

    const statusClasses: Record<string, string> = {
        success: 'bg-emerald-400/20 text-emerald-100 border-emerald-300/30',
        error: 'bg-rose-400/20 text-rose-100 border-rose-300/30',
        warning: 'bg-amber-400/20 text-amber-100 border-amber-300/30',
    };

    return (
        <AppLayout>
            <Head title="Sistem Admin" />

            <div className="mx-auto max-w-7xl space-y-8 px-1 sm:px-0">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-3xl font-black text-transparent drop-shadow-xl sm:text-5xl">
                            Sistem Admin
                        </h1>
                        <p className="mt-2 max-w-3xl text-white/80">
                            Pantau kesehatan server, status database, backup dan
                            restore, serta audit log aktivitas penting aplikasi.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    <GlassCard>
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-400/20 p-3">
                                <Database className="h-5 w-5 text-blue-100" />
                            </div>
                            <div>
                                <div className="text-sm text-white/70">
                                    Jumlah tabel
                                </div>
                                <div className="text-3xl font-black text-white">
                                    {database.table_count}
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-emerald-400/20 p-3">
                                <User className="h-5 w-5 text-emerald-100" />
                            </div>
                            <div>
                                <div className="text-sm text-white/70">
                                    Total pengguna
                                </div>
                                <div className="text-3xl font-black text-white">
                                    {database.user_count}
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-purple-400/20 p-3">
                                <Activity className="h-5 w-5 text-purple-100" />
                            </div>
                            <div>
                                <div className="text-sm text-white/70">
                                    Total log ditampilkan
                                </div>
                                <div className="text-3xl font-black text-white">
                                    {logs.total}
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-amber-400/20 p-3">
                                <HardDrive className="h-5 w-5 text-amber-100" />
                            </div>
                            <div>
                                <div className="text-sm text-white/70">
                                    Disk bebas
                                </div>
                                <div className="text-3xl font-black text-white">
                                    {server.disk_free_gb} GB
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    <GlassCard>
                        <h2 className="text-xl font-bold text-white">
                            Informasi Database
                        </h2>
                        <div className="mt-4 grid gap-3 text-sm text-white/80">
                            <div>
                                Koneksi:{' '}
                                <span className="font-semibold text-white">
                                    {database.connection}
                                </span>
                            </div>
                            <div>
                                Nama DB:{' '}
                                <span className="font-semibold text-white">
                                    {database.database}
                                </span>
                            </div>
                            <div>
                                Ukuran:{' '}
                                <span className="font-semibold text-white">
                                    {database.size_mb} MB
                                </span>
                            </div>
                            <div>
                                Jumlah aplikasi:{' '}
                                <span className="font-semibold text-white">
                                    {database.application_count}
                                </span>
                            </div>
                            <div>
                                Disk backup:{' '}
                                <span className="font-semibold text-white">
                                    {database.backup_disk}
                                </span>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <h2 className="text-xl font-bold text-white">
                            Status Server
                        </h2>
                        <div className="mt-4 grid gap-3 text-sm text-white/80">
                            <div>
                                Environment:{' '}
                                <span className="font-semibold text-white">
                                    {server.app_env}
                                </span>
                            </div>
                            <div>
                                Debug:{' '}
                                <span className="font-semibold text-white">
                                    {server.app_debug ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </div>
                            <div>
                                PHP:{' '}
                                <span className="font-semibold text-white">
                                    {server.php_version}
                                </span>
                            </div>
                            <div>
                                Laravel:{' '}
                                <span className="font-semibold text-white">
                                    {server.laravel_version}
                                </span>
                            </div>
                            <div>
                                Memory limit:{' '}
                                <span className="font-semibold text-white">
                                    {server.memory_limit}
                                </span>
                            </div>
                            <div>
                                Timezone:{' '}
                                <span className="font-semibold text-white">
                                    {server.timezone}
                                </span>
                            </div>
                            <div>
                                Queue:{' '}
                                <span className="font-semibold text-white">
                                    {server.queue_driver}
                                </span>
                            </div>
                            <div>
                                Cache:{' '}
                                <span className="font-semibold text-white">
                                    {server.cache_driver}
                                </span>
                            </div>
                            <div>
                                Disk total:{' '}
                                <span className="font-semibold text-white">
                                    {server.disk_total_gb} GB
                                </span>
                            </div>
                            <div className="truncate">
                                App URL:{' '}
                                <span className="font-semibold text-white">
                                    {server.app_url}
                                </span>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    <GlassCard>
                        <h2 className="text-xl font-bold text-white">
                            Backup Database
                        </h2>
                        <p className="mt-1 text-sm text-white/65">
                            Buat backup SQL terbaru dan unduh file backup yang
                            sudah tersedia.
                        </p>

                        <form
                            onSubmit={handleCreateBackup}
                            className="mt-4 space-y-3"
                        >
                            <div className="rounded-xl border border-white/15 bg-white/5 p-3">
                                <label
                                    htmlFor="backup_title"
                                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/60"
                                >
                                    Judul Backup (opsional)
                                </label>
                                <input
                                    id="backup_title"
                                    type="text"
                                    value={createBackupForm.data.backup_title}
                                    onChange={(event) =>
                                        createBackupForm.setData(
                                            'backup_title',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Contoh: Sebelum update hak akses aplikasi"
                                    className="w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-blue-300/50 focus:outline-none"
                                />
                                {createBackupForm.errors.backup_title && (
                                    <p className="mt-2 text-xs text-rose-200">
                                        {createBackupForm.errors.backup_title}
                                    </p>
                                )}
                            </div>

                            <div className="rounded-xl border border-white/15 bg-white/5 p-3">
                                <label
                                    htmlFor="backup_description"
                                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/60"
                                >
                                    Keterangan Backup (opsional)
                                </label>
                                <textarea
                                    id="backup_description"
                                    rows={3}
                                    value={
                                        createBackupForm.data.backup_description
                                    }
                                    onChange={(event) =>
                                        createBackupForm.setData(
                                            'backup_description',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Tuliskan konteks backup ini untuk memudahkan identifikasi saat restore."
                                    className="w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-blue-300/50 focus:outline-none"
                                />
                                {createBackupForm.errors.backup_description && (
                                    <p className="mt-2 text-xs text-rose-200">
                                        {
                                            createBackupForm.errors
                                                .backup_description
                                        }
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={createBackupForm.processing}
                                className="inline-flex w-full items-center justify-center gap-2 sm:w-auto"
                            >
                                <Database className="h-4 w-4" />
                                {createBackupForm.processing
                                    ? 'Membuat Backup...'
                                    : 'Buat Backup Baru'}
                            </Button>
                        </form>

                        <div className="mt-5 space-y-3 md:hidden">
                            {backups.length === 0 ? (
                                <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-center text-sm text-white/55">
                                    Belum ada backup.
                                </div>
                            ) : (
                                backups.map((backup) => (
                                    <div
                                        key={`mobile-${backup.name}`}
                                        className="rounded-xl border border-white/10 bg-black/20 p-4"
                                    >
                                        <p className="break-all text-sm font-semibold text-white">
                                            {backup.title || backup.name}
                                        </p>
                                        {backup.title && (
                                            <p className="mt-1 break-all text-xs text-white/55">
                                                {backup.name}
                                            </p>
                                        )}
                                        {backup.description && (
                                            <p className="mt-2 text-xs text-white/75">
                                                {backup.description}
                                            </p>
                                        )}
                                        <div className="mt-2 flex items-center justify-between text-xs text-white/70">
                                            <span>{backup.size_kb} KB</span>
                                            <span>
                                                {formatDateTime(
                                                    backup.modified_at,
                                                )}
                                            </span>
                                        </div>
                                        <a
                                            href={backup.download_url}
                                            className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-lg border border-blue-300/25 bg-blue-500/15 px-3 py-2 text-xs font-semibold text-blue-50 transition hover:bg-blue-500/25"
                                        >
                                            <Download className="h-3.5 w-3.5" />
                                            Unduh
                                        </a>
                                        <div className="mt-2 grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openEditBackupModal(backup)
                                                }
                                                className="inline-flex items-center justify-center gap-1 rounded-lg border border-amber-300/25 bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-50 transition hover:bg-amber-500/25"
                                            >
                                                <SquarePen className="h-3.5 w-3.5" />
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDeleteBackup(backup)
                                                }
                                                disabled={
                                                    deletingBackupName ===
                                                    backup.name
                                                }
                                                className="inline-flex items-center justify-center gap-1 rounded-lg border border-rose-300/25 bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-50 transition hover:bg-rose-500/25 disabled:opacity-60"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                {deletingBackupName ===
                                                backup.name
                                                    ? 'Menghapus...'
                                                    : 'Hapus'}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-5 hidden overflow-x-auto md:block">
                            <table className="w-full min-w-[420px]">
                                <thead>
                                    <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/55">
                                        <th className="py-2">Judul / File</th>
                                        <th className="py-2">Keterangan</th>
                                        <th className="py-2">Ukuran</th>
                                        <th className="py-2">Diubah</th>
                                        <th className="py-2 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/8 text-sm text-white/80">
                                    {backups.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="py-6 text-center text-white/55"
                                            >
                                                Belum ada backup.
                                            </td>
                                        </tr>
                                    ) : (
                                        backups.map((backup) => (
                                            <tr key={backup.name}>
                                                <td className="py-3 pr-3">
                                                    <div className="break-all font-semibold text-white">
                                                        {backup.title ||
                                                            backup.name}
                                                    </div>
                                                    {backup.title && (
                                                        <div className="mt-1 break-all text-xs text-white/55">
                                                            {backup.name}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="max-w-[260px] py-3 pr-3 text-xs text-white/75">
                                                    {backup.description || '—'}
                                                </td>
                                                <td className="py-3 pr-2">
                                                    {backup.size_kb} KB
                                                </td>
                                                <td className="py-3 pr-2">
                                                    {formatDateTime(
                                                        backup.modified_at,
                                                    )}
                                                </td>
                                                <td className="py-3 text-right">
                                                    <div className="inline-flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEditBackupModal(
                                                                    backup,
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1 rounded-lg border border-amber-300/25 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-50 transition hover:bg-amber-500/25"
                                                        >
                                                            <SquarePen className="h-3.5 w-3.5" />
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDeleteBackup(
                                                                    backup,
                                                                )
                                                            }
                                                            disabled={
                                                                deletingBackupName ===
                                                                backup.name
                                                            }
                                                            className="inline-flex items-center gap-1 rounded-lg border border-rose-300/25 bg-rose-500/15 px-3 py-1.5 text-xs font-semibold text-rose-50 transition hover:bg-rose-500/25 disabled:opacity-60"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            {deletingBackupName ===
                                                            backup.name
                                                                ? 'Menghapus...'
                                                                : 'Hapus'}
                                                        </button>
                                                        <a
                                                            href={
                                                                backup.download_url
                                                            }
                                                            className="inline-flex items-center gap-1 rounded-lg border border-blue-300/25 bg-blue-500/15 px-3 py-1.5 text-xs font-semibold text-blue-50 transition hover:bg-blue-500/25"
                                                        >
                                                            <Download className="h-3.5 w-3.5" />
                                                            Unduh
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <h2 className="text-xl font-bold text-white">
                            Restore Database
                        </h2>
                        <p className="mt-1 text-sm text-white/65">
                            Pilih backup tersimpan atau unggah file SQL untuk
                            menjalankan restore ke database aktif.
                        </p>

                        <form
                            onSubmit={handleRestoreSubmit}
                            className="mt-4 space-y-4"
                        >
                            <div className="rounded-xl border border-white/15 bg-white/5 p-3">
                                <GlassSelect
                                    id="backup_name"
                                    label="Pilih Backup dari Storage"
                                    value={restoreForm.data.backup_name}
                                    options={restoreOptions}
                                    placeholder="-- Pilih backup tersimpan --"
                                    onChange={(value) =>
                                        restoreForm.setData(
                                            'backup_name',
                                            value,
                                        )
                                    }
                                    error={restoreForm.errors.backup_name}
                                />
                            </div>

                            <div className="text-center text-xs font-semibold uppercase tracking-wide text-white/40">
                                atau
                            </div>

                            <div className="rounded-xl border border-white/15 bg-white/5 p-3">
                                <input
                                    type="file"
                                    accept=".sql,.txt"
                                    onChange={(event) =>
                                        restoreForm.setData(
                                            'backup_file',
                                            event.target.files?.[0] ?? null,
                                        )
                                    }
                                    className="w-full text-sm text-white file:mr-4 file:rounded-lg file:border-0 file:bg-white/15 file:px-3 file:py-2 file:text-white file:transition hover:file:bg-white/25"
                                />
                            </div>

                            {restoreForm.errors.backup_file && (
                                <p className="text-sm text-rose-200">
                                    {restoreForm.errors.backup_file}
                                </p>
                            )}

                            <Button
                                type="submit"
                                disabled={restoreForm.processing}
                                className="inline-flex w-full items-center justify-center gap-2 sm:w-auto"
                            >
                                <Upload className="h-4 w-4" />
                                {restoreForm.processing
                                    ? 'Memproses Restore...'
                                    : 'Jalankan Restore'}
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
                            Menampilkan {logs.from ?? 0} sampai {logs.to ?? 0}{' '}
                            dari {logs.total} log aktivitas terbaru.
                        </p>

                        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_220px]">
                            <GlassSelect
                                id="status_filter"
                                label="Filter Status"
                                value={selectedStatusToken}
                                options={statusFilterOptions}
                                placeholder="Semua status"
                                onChange={(value) => {
                                    visitState(
                                        value || filters.clear_status_token,
                                    );
                                }}
                            />

                            <GlassSelect
                                id="category_filter"
                                label="Filter Kategori"
                                value={selectedCategoryToken}
                                options={categoryFilterOptions}
                                placeholder="Semua kategori"
                                onChange={(value) => {
                                    visitState(
                                        value || filters.clear_category_token,
                                    );
                                }}
                            />

                            <div className="flex items-end">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="w-full"
                                    onClick={() =>
                                        visitState(filters.clear_token)
                                    }
                                >
                                    Reset Filter
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 p-4 md:hidden">
                        {logs.data.length === 0 ? (
                            <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-center text-sm text-white/55">
                                Belum ada log aktivitas atau tidak ada data yang
                                sesuai dengan filter.
                            </div>
                        ) : (
                            logs.data.map((log) => (
                                <div
                                    key={`mobile-log-${log.id}`}
                                    className="rounded-xl border border-white/10 bg-black/20 p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-sm font-semibold text-white">
                                            {log.event}
                                        </p>
                                        <span
                                            className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusClasses[log.status] ?? 'border-white/20 bg-white/10 text-white/80'}`}
                                        >
                                            {log.status}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-white/65">
                                        {formatDateTime(log.occurred_at)}
                                    </p>
                                    <p className="mt-2 text-sm text-white/80">
                                        {log.description}
                                    </p>
                                    <div className="mt-3 flex items-center justify-between gap-2 text-xs text-white/70">
                                        <span>
                                            {log.user
                                                ? log.user.name
                                                : 'Sistem'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedLog(log)}
                                            className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            Detail
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full min-w-[1080px]">
                            <thead>
                                <tr className="border-b border-white/10 bg-black/20 text-left text-xs uppercase tracking-wider text-white/60">
                                    <th className="px-5 py-3">Waktu</th>
                                    <th className="px-5 py-3">Kategori</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3">Event</th>
                                    <th className="px-5 py-3">Deskripsi</th>
                                    <th className="px-5 py-3">Aktor</th>
                                    <th className="px-5 py-3">IP / Device</th>
                                    <th className="px-5 py-3">Metadata</th>
                                    <th className="px-5 py-3 text-right">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/8 text-sm text-white/80">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-5 py-10 text-center text-white/55"
                                        >
                                            Belum ada log aktivitas atau tidak
                                            ada data yang sesuai dengan filter.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="align-top transition hover:bg-white/5"
                                        >
                                            <td className="px-5 py-4">
                                                {formatDateTime(
                                                    log.occurred_at,
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white/85">
                                                    {log.category}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${statusClasses[log.status] ?? 'border-white/20 bg-white/10 text-white/80'}`}
                                                >
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 font-semibold text-white">
                                                {log.event}
                                            </td>
                                            <td className="px-5 py-4">
                                                {log.description}
                                            </td>
                                            <td className="px-5 py-4">
                                                {log.user ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-white">
                                                            {log.user.name}
                                                        </span>
                                                        <span className="text-xs text-white/60">
                                                            @{log.user.username}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    'Sistem'
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="max-w-[230px] text-xs text-white/70">
                                                    <div>
                                                        {log.ip_address ?? '—'}
                                                    </div>
                                                    <div className="truncate">
                                                        {log.device_id ?? '—'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <code className="block max-w-[320px] truncate rounded bg-black/25 px-2 py-1 text-[11px] text-white/80">
                                                    {renderMetadata(
                                                        log.metadata,
                                                    )}
                                                </code>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedLog(log)
                                                    }
                                                    className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    Lihat Detail
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {logs.last_page > 1 && (
                        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-white/10 px-6 py-4 sm:justify-end">
                            {logs.prev_page_token ? (
                                <button
                                    type="button"
                                    onClick={() =>
                                        visitState(logs.prev_page_token!)
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 text-white/70 transition hover:bg-white/10 hover:text-white"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                            ) : (
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/30">
                                    <ChevronLeft className="h-4 w-4" />
                                </span>
                            )}

                            {collapsedPaginationItems.map((item, index) => {
                                if (
                                    'type' in item &&
                                    item.type === 'ellipsis'
                                ) {
                                    return (
                                        <span
                                            key={item.key}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/50"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </span>
                                    );
                                }

                                const paginationLink = item as PaginationLinks;

                                return (
                                    <button
                                        key={`${paginationLink.label}-${index}`}
                                        type="button"
                                        onClick={() =>
                                            visitState(paginationLink.token)
                                        }
                                        className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                                            paginationLink.active
                                                ? 'border-white/45 bg-white/20 text-white'
                                                : 'border-white/20 text-white/70 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        {paginationLink.label}
                                    </button>
                                );
                            })}

                            {logs.next_page_token ? (
                                <button
                                    type="button"
                                    onClick={() =>
                                        visitState(logs.next_page_token!)
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 text-white/70 transition hover:bg-white/10 hover:text-white"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            ) : (
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/30">
                                    <ChevronRight className="h-4 w-4" />
                                </span>
                            )}
                        </div>
                    )}
                </GlassCard>

                <Button
                    type="button"
                    onClick={() =>
                        router.reload({
                            only: ['logs', 'database', 'server', 'backups'],
                        })
                    }
                    title="Refresh Data"
                    className="fixed bottom-6 right-6 z-40 h-[4.5rem] w-[4.5rem] rounded-full p-0 shadow-2xl shadow-blue-700/40 sm:bottom-8 sm:right-8"
                >
                    <RefreshCw className="h-7 w-7" />
                    <span className="sr-only">Refresh Data</span>
                </Button>

                {selectedLog && (
                    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4">
                        <div
                            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
                            onClick={() => setSelectedLog(null)}
                        />
                        <div className="relative h-[100dvh] w-full overflow-y-auto rounded-none border-0 bg-white/10 p-4 shadow-2xl backdrop-blur-2xl sm:h-auto sm:max-h-[85vh] sm:max-w-3xl sm:rounded-2xl sm:border sm:border-white/20 sm:p-6">
                            <div className="sticky top-0 z-10 -mx-4 mb-4 flex items-start justify-between gap-4 border-b border-white/10 bg-slate-900/45 px-4 py-3 backdrop-blur-md sm:static sm:mx-0 sm:mb-4 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
                                <div>
                                    <h3 className="text-lg font-bold text-white sm:text-xl">
                                        Detail Log Aktivitas
                                    </h3>
                                    <div className="mt-1 flex items-center gap-2">
                                        <p className="break-all text-sm text-white/60">
                                            {selectedLog.event}
                                        </p>
                                        <span
                                            className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${statusClasses[selectedLog.status] ?? 'border-white/20 bg-white/10 text-white/80'}`}
                                        >
                                            {selectedLog.status}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedLog(null)}
                                    className="rounded-lg border border-white/20 p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="mb-4 flex justify-stretch sm:justify-end">
                                <button
                                    type="button"
                                    onClick={handleCopyLogDetails}
                                    className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-blue-300/30 bg-blue-500/15 px-3 py-2 text-xs font-semibold text-blue-100 transition hover:bg-blue-500/25 sm:w-auto sm:py-1.5"
                                >
                                    {copied ? (
                                        <Check className="h-3.5 w-3.5" />
                                    ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                    )}
                                    {copied ? 'Tersalin' : 'Salin Detail'}
                                </button>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                    <div className="text-xs uppercase tracking-wide text-white/50">
                                        Waktu
                                    </div>
                                    <div className="mt-1 text-sm text-white">
                                        {formatDateTime(
                                            selectedLog.occurred_at,
                                        )}
                                    </div>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                    <div className="text-xs uppercase tracking-wide text-white/50">
                                        Kategori
                                    </div>
                                    <div className="mt-1 text-sm text-white">
                                        {selectedLog.category}
                                    </div>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:col-span-2">
                                    <div className="text-xs uppercase tracking-wide text-white/50">
                                        Deskripsi
                                    </div>
                                    <div className="mt-1 text-sm text-white">
                                        {selectedLog.description}
                                    </div>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                    <div className="text-xs uppercase tracking-wide text-white/50">
                                        Aktor
                                    </div>
                                    <div className="mt-1 text-sm text-white">
                                        {selectedLog.user
                                            ? `${selectedLog.user.name} (@${selectedLog.user.username})`
                                            : 'Sistem'}
                                    </div>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                    <div className="text-xs uppercase tracking-wide text-white/50">
                                        IP Address
                                    </div>
                                    <div className="mt-1 break-all text-sm text-white">
                                        {selectedLog.ip_address ?? '—'}
                                    </div>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                    <div className="text-xs uppercase tracking-wide text-white/50">
                                        Device ID
                                    </div>
                                    <div className="mt-1 break-all text-sm text-white">
                                        {selectedLog.device_id ?? '—'}
                                    </div>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                    <div className="text-xs uppercase tracking-wide text-white/50">
                                        User Agent
                                    </div>
                                    <div className="mt-1 break-all text-sm text-white">
                                        {selectedLog.user_agent ?? '—'}
                                    </div>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:col-span-2">
                                    <div className="text-xs uppercase tracking-wide text-white/50">
                                        Metadata
                                    </div>
                                    <pre className="mt-1 max-w-full whitespace-pre-wrap break-all rounded bg-black/30 p-3 text-xs text-white/85">
                                        {renderMetadataForModal(
                                            selectedLog.metadata,
                                        )}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {editingBackup && (
                    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
                            onClick={closeEditBackupModal}
                        />
                        <div className="relative w-full max-w-xl rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl">
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white">
                                        Edit Metadata Backup
                                    </h3>
                                    <p className="mt-1 break-all text-xs text-white/60">
                                        {editingBackup.name}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeEditBackupModal}
                                    className="rounded-lg border border-white/20 p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <form
                                onSubmit={handleEditBackupSubmit}
                                className="space-y-3"
                            >
                                <div className="rounded-xl border border-white/15 bg-white/5 p-3">
                                    <label
                                        htmlFor="edit_backup_title"
                                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/60"
                                    >
                                        Judul Backup (opsional)
                                    </label>
                                    <input
                                        id="edit_backup_title"
                                        type="text"
                                        value={editBackupForm.data.backup_title}
                                        onChange={(event) =>
                                            editBackupForm.setData(
                                                'backup_title',
                                                event.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-blue-300/50 focus:outline-none"
                                    />
                                    {editBackupForm.errors.backup_title && (
                                        <p className="mt-2 text-xs text-rose-200">
                                            {editBackupForm.errors.backup_title}
                                        </p>
                                    )}
                                </div>

                                <div className="rounded-xl border border-white/15 bg-white/5 p-3">
                                    <label
                                        htmlFor="edit_backup_description"
                                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/60"
                                    >
                                        Keterangan Backup (opsional)
                                    </label>
                                    <textarea
                                        id="edit_backup_description"
                                        rows={3}
                                        value={
                                            editBackupForm.data
                                                .backup_description
                                        }
                                        onChange={(event) =>
                                            editBackupForm.setData(
                                                'backup_description',
                                                event.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-blue-300/50 focus:outline-none"
                                    />
                                    {editBackupForm.errors
                                        .backup_description && (
                                        <p className="mt-2 text-xs text-rose-200">
                                            {
                                                editBackupForm.errors
                                                    .backup_description
                                            }
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={closeEditBackupModal}
                                        className="sm:w-auto"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={editBackupForm.processing}
                                        className="sm:w-auto"
                                    >
                                        {editBackupForm.processing
                                            ? 'Menyimpan...'
                                            : 'Simpan Perubahan'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <ConfirmationModal
                    isOpen={modal.isOpen}
                    title={modal.title}
                    description={modal.description}
                    confirmLabel={modal.confirmLabel}
                    confirmVariant={modal.confirmVariant}
                    onCancel={closeModal}
                    onConfirm={modal.onConfirm}
                />
            </div>
        </AppLayout>
    );
}
