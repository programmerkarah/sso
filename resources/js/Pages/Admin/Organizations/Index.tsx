import { Building2, CheckCircle, Edit, Plus, XCircle } from 'lucide-react';

import { Head, Link, router } from '@inertiajs/react';

import GlassCard from '@/Components/GlassCard';
import AppLayout from '@/Layouts/AppLayout';
import { Organization, PageProps } from '@/types';

interface OrganizationsIndexProps extends PageProps {
    organizations: Organization[];
}

export default function Index({ organizations }: OrganizationsIndexProps) {
    const toggleActive = (org: Organization) => {
        router.post(
            `/admin/organizations/${org.id}/toggle-active`,
            {},
            { preserveScroll: true },
        );
    };

    return (
        <AppLayout>
            <Head title="Manajemen Organisasi" />

            <div className="mx-auto max-w-5xl space-y-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-4xl font-black text-transparent drop-shadow-xl sm:text-5xl">
                            Organisasi
                        </h1>
                        <p className="mt-2 text-white/70">
                            Kelola daftar organisasi yang dapat digunakan saat
                            mendaftar
                        </p>
                    </div>
                    <Link
                        href="/admin/organizations/create"
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-xl transition hover:bg-white/20"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Organisasi
                    </Link>
                </div>

                <GlassCard>
                    {organizations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-white/50">
                            <Building2 className="h-12 w-12" />
                            <p className="text-sm">Belum ada organisasi</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-white/80">
                                <thead>
                                    <tr className="border-b border-white/10 text-left text-white/50">
                                        <th className="pb-3 pr-4 font-medium">
                                            Nama
                                        </th>
                                        <th className="pb-3 pr-4 font-medium">
                                            Tipe
                                        </th>
                                        <th className="pb-3 pr-4 font-medium">
                                            Aplikasi Diizinkan
                                        </th>
                                        <th className="pb-3 pr-4 font-medium">
                                            Pengguna
                                        </th>
                                        <th className="pb-3 pr-4 font-medium">
                                            Status
                                        </th>
                                        <th className="pb-3 font-medium">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {organizations.map((org) => (
                                        <tr key={org.id}>
                                            <td className="py-3 pr-4">
                                                <div className="font-semibold text-white">
                                                    {org.name}
                                                </div>
                                                {org.description && (
                                                    <div className="text-xs text-white/50">
                                                        {org.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 pr-4">
                                                <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-mono">
                                                    {org.type}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <div className="space-y-2">
                                                    <div className="text-xs text-white/60">
                                                        {
                                                            org.eligible_applications_count
                                                        }{' '}
                                                        aplikasi aktif
                                                    </div>
                                                    {org.eligible_applications
                                                        .length > 0 ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            {org.eligible_applications.map(
                                                                (
                                                                    application,
                                                                ) => (
                                                                    <span
                                                                        key={
                                                                            application.id
                                                                        }
                                                                        className="rounded-full border border-sky-300/20 bg-sky-400/10 px-2.5 py-1 text-xs font-medium text-sky-100"
                                                                    >
                                                                        {
                                                                            application.name
                                                                        }
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-white/40">
                                                            Belum ada aplikasi
                                                            aktif yang cocok.
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 pr-4 text-white/60">
                                                {org.users_count} pengguna
                                            </td>
                                            <td className="py-3 pr-4">
                                                {org.is_active ? (
                                                    <span className="flex items-center gap-1 text-green-400">
                                                        <CheckCircle className="h-4 w-4" />{' '}
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-red-400">
                                                        <XCircle className="h-4 w-4" />{' '}
                                                        Nonaktif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/admin/organizations/${org.id}/edit`}
                                                        className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium transition hover:bg-white/15"
                                                    >
                                                        <Edit className="inline h-3 w-3 mr-1" />
                                                        Edit
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleActive(org)
                                                        }
                                                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                                                            org.is_active
                                                                ? 'border-red-400/30 bg-red-400/10 text-red-300 hover:bg-red-400/20'
                                                                : 'border-green-400/30 bg-green-400/10 text-green-300 hover:bg-green-400/20'
                                                        }`}
                                                    >
                                                        {org.is_active
                                                            ? 'Nonaktifkan'
                                                            : 'Aktifkan'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </GlassCard>
            </div>
        </AppLayout>
    );
}
