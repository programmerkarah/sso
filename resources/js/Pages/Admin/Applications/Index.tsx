import {
    CheckCircle,
    Edit,
    Eye,
    Globe,
    Plus,
    Trash2,
    XCircle,
} from 'lucide-react';

import { useState } from 'react';

import { Head, Link, router } from '@inertiajs/react';

import ConfirmationModal from '@/Components/ConfirmationModal';
import GlassCard from '@/Components/GlassCard';
import PageHeader from '@/Components/PageHeader';
import MetricCard from '@/Components/MetricCard';
import ScrollArea from '@/Components/ScrollArea';
import AppLayout from '@/Layouts/AppLayout';
import { Application, PageProps } from '@/types';
import { formatNumber } from '@/utils/number';

interface ApplicationsIndexProps extends PageProps {
    applications: {
        data: Application[];
        current_page: number;
        from: number | null;
        last_page: number;
        per_page: number;
        to: number | null;
        total: number;
        prev_page_token: string | null;
        next_page_token: string | null;
        pages: Array<{
            label: string;
            token: string;
            active: boolean;
        }>;
    };
    stats: {
        total: number;
        active: number;
    };
}

export default function Index({ applications, stats }: ApplicationsIndexProps) {
    const [deleteModal, setDeleteModal] = useState<{
        routeKey: string;
        name: string;
    } | null>(null);

    const visitPage = (token: string) => {
        router.post(
            '/admin/applications/navigate',
            { state: token },
            { preserveScroll: true, preserveState: true },
        );
    };

    const confirmDelete = () => {
        if (!deleteModal) {
            return;
        }

        router.delete(`/admin/applications/${deleteModal.routeKey}`, {
            preserveScroll: true,
            onFinish: () => setDeleteModal(null),
        });
    };

    return (
        <AppLayout>
            <Head title="Daftar Aplikasi" />
            <ConfirmationModal
                isOpen={deleteModal !== null}
                title="Hapus Aplikasi"
                description={
                    deleteModal
                        ? `Aplikasi "${deleteModal.name}" akan dihapus beserta kredensial OAuth yang terhubung. Tindakan ini tidak bisa dibatalkan.`
                        : ''
                }
                confirmLabel="Ya, Hapus Aplikasi"
                confirmVariant="red"
                onCancel={() => setDeleteModal(null)}
                onConfirm={confirmDelete}
            />

            <div className="space-y-6">
                <PageHeader
                    actions={
                        <Link
                            href="/admin/applications/create"
                            className="ui-selected inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah aplikasi
                        </Link>
                    }
                />

                <div className="grid gap-3 md:grid-cols-3">
                    <MetricCard label="Total aplikasi" value={formatNumber(stats.total)} />
                    <MetricCard label="Aplikasi aktif" value={formatNumber(stats.active)} />
                    <GlassCard>
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-[var(--bps-selected-bg)] p-3">
                                <Globe className="h-5 w-5 text-[#4a9fd7]" />
                            </div>
                            <p className="text-sm text-[var(--bps-muted)]">
                                Pastikan setiap callback URL mengarah ke endpoint OAuth yang benar pada aplikasi tujuan.
                            </p>
                        </div>
                    </GlassCard>
                </div>

                <GlassCard className="overflow-hidden p-0">
                    <ScrollArea
                        axis="horizontal"
                        className="w-full"
                        viewportClassName="pb-2"
                    >
                        <table className="min-w-full divide-y divide-[var(--bps-border)]">
                            <thead className="bg-[var(--bps-surface-soft)]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-[var(--bps-muted)]">
                                        Aplikasi
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-[var(--bps-muted)]">
                                        Domain
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-[var(--bps-muted)]">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-[var(--bps-muted)]">
                                        Dibuat
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.2em] text-[var(--bps-muted)]">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--bps-border)] bg-transparent">
                                {applications.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-16 text-center text-[var(--bps-muted)]"
                                        >
                                            Belum ada aplikasi terdaftar
                                        </td>
                                    </tr>
                                ) : (
                                    applications.data.map((app) => (
                                        <tr
                                            key={app.id}
                                            className="ui-row-hover"
                                        >
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {app.logo_url ? (
                                                        <img
                                                            src={app.logo_url}
                                                            alt={app.name}
                                                            className="h-10 w-10 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--bps-surface-soft)] text-lg font-bold text-[var(--bps-text)]">
                                                            {app.name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-[var(--bps-text)]">
                                                            {app.name}
                                                        </div>
                                                        <div className="text-sm text-[var(--bps-muted)]">
                                                            {app.slug}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-[var(--bps-muted)]">
                                                {app.domain}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                {app.is_active ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#eef7ec] px-3 py-1 text-xs font-semibold text-[#4f8a49]">
                                                        <CheckCircle className="h-3 w-3" />{' '}
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#fff0ee] px-3 py-1 text-xs font-semibold text-[#b85d52]">
                                                        <XCircle className="h-3 w-3" />{' '}
                                                        Nonaktif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-[var(--bps-muted)]">
                                                {new Date(
                                                    app.created_at,
                                                ).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={`/admin/applications/${app.route_key}`}
                                                        className="ui-icon-button rounded-xl p-2 text-[#4a9fd7]"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/admin/applications/${app.route_key}/edit`}
                                                        className="ui-warning rounded-xl border p-2"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDeleteModal({
                                                                routeKey:
                                                                    app.route_key,
                                                                name: app.name,
                                                            })
                                                        }
                                                        className="ui-danger rounded-xl border p-2"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </ScrollArea>

                    {applications.last_page > 1 && (
                        <div className="border-t border-[#e2ebf1] px-4 py-4 sm:px-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-[#7d909f]">
                                    Menampilkan{' '}
                                    {formatNumber(applications.from ?? 0)}–
                                    {formatNumber(applications.to ?? 0)} dari{' '}
                                    {formatNumber(applications.total)} aplikasi
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {applications.prev_page_token && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                visitPage(
                                                    applications.prev_page_token!,
                                                )
                                            }
                                            className="rounded-md bg-white px-3 py-2 text-sm font-medium text-[#49657b] hover:bg-[#eef5f9]"
                                        >
                                            Sebelumnya
                                        </button>
                                    )}
                                    {applications.pages.map((page, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() =>
                                                visitPage(page.token)
                                            }
                                            className={`rounded-md px-3 py-2 text-sm font-medium ${page.active ? 'bg-[#e7f3fb] text-[#2f6f98]' : 'bg-slate-900/80 text-[var(--bps-text)] hover:bg-slate-800'}`}
                                        >
                                            {page.label}
                                        </button>
                                    ))}
                                    {applications.next_page_token && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                visitPage(
                                                    applications.next_page_token!,
                                                )
                                            }
                                            className="rounded-md bg-white px-3 py-2 text-sm font-medium text-[#49657b] hover:bg-[#eef5f9]"
                                        >
                                            Berikutnya
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </GlassCard>
            </div>
        </AppLayout>
    );
}
