import {
    CheckCircle,
    Edit,
    Eye,
    Globe,
    Plus,
    Trash2,
    XCircle,
} from 'lucide-react';

import { Head, Link, router } from '@inertiajs/react';

import GlassCard from '@/Components/GlassCard';
import AppLayout from '@/Layouts/AppLayout';
import { Application, PageProps } from '@/types';

interface ApplicationsIndexProps extends PageProps {
    applications: {
        data: Application[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    success?: string;
}

export default function Index({ applications }: ApplicationsIndexProps) {
    const handleDelete = (id: number, name: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus aplikasi "${name}"?`)) {
            router.delete(`/admin/applications/${id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Daftar Aplikasi" />

            <div className="mx-auto max-w-7xl space-y-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-4xl font-black text-transparent drop-shadow-xl sm:text-5xl">
                            Daftar Aplikasi
                        </h1>
                        <p className="mt-2 max-w-2xl text-white/80">
                            Kelola seluruh aplikasi yang terhubung ke SSO,
                            termasuk domain, callback URL, dan status aktifnya.
                        </p>
                    </div>
                    <Link
                        href="/admin/applications/create"
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/15 px-5 py-3 text-sm font-semibold text-white shadow-xl backdrop-blur-xl transition hover:bg-white/25"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Aplikasi
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <GlassCard>
                        <div className="text-sm text-white/70">
                            Total aplikasi
                        </div>
                        <div className="mt-2 text-4xl font-black text-white">
                            {applications.data.length}
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="text-sm text-white/70">
                            Aplikasi aktif
                        </div>
                        <div className="mt-2 text-4xl font-black text-white">
                            {
                                applications.data.filter((app) => app.is_active)
                                    .length
                            }
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-400/20 p-3">
                                <Globe className="h-5 w-5 text-blue-100" />
                            </div>
                            <p className="text-sm text-white/80">
                                Pastikan setiap callback URL mengarah ke
                                endpoint OAuth yang benar pada aplikasi tujuan.
                            </p>
                        </div>
                    </GlassCard>
                </div>

                <GlassCard className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/10">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                                        Aplikasi
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                                        Domain
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                                        Dibuat
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10 bg-transparent">
                                {applications.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-16 text-center text-white/70"
                                        >
                                            Belum ada aplikasi terdaftar
                                        </td>
                                    </tr>
                                ) : (
                                    applications.data.map((app) => (
                                        <tr
                                            key={app.id}
                                            className="transition hover:bg-white/5"
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
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-lg font-bold text-white">
                                                            {app.name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-white">
                                                            {app.name}
                                                        </div>
                                                        <div className="text-sm text-white/50">
                                                            {app.slug}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-white/70">
                                                {app.domain}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                {app.is_active ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-100">
                                                        <CheckCircle className="h-3 w-3" />
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-400/20 px-3 py-1 text-xs font-semibold text-red-100">
                                                        <XCircle className="h-3 w-3" />
                                                        Nonaktif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-white/70">
                                                {new Date(
                                                    app.created_at,
                                                ).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={`/admin/applications/${app.id}`}
                                                        className="rounded-xl bg-white/10 p-2 text-blue-100 transition hover:bg-white/20"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/admin/applications/${app.id}/edit`}
                                                        className="rounded-xl bg-white/10 p-2 text-amber-100 transition hover:bg-white/20"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                app.id,
                                                                app.name,
                                                            )
                                                        }
                                                        className="rounded-xl bg-red-500/15 p-2 text-red-100 transition hover:bg-red-500/25"
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

                        {/* Pagination */}
                        {applications.links.length > 3 && (
                            <div className="border-t border-white/10 px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                        {applications.links.map(
                                            (link, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() =>
                                                        link.url &&
                                                        router.visit(link.url)
                                                    }
                                                    disabled={!link.url}
                                                    className={`rounded-md px-3 py-2 text-sm font-medium ${
                                                        link.active
                                                            ? 'bg-white text-slate-900'
                                                            : link.url
                                                              ? 'bg-white/10 text-white hover:bg-white/20'
                                                              : 'cursor-not-allowed bg-white/5 text-white/30'
                                                    }`}
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>
        </AppLayout>
    );
}
