import { Building2, CheckCircle, Edit, Plus, XCircle } from 'lucide-react';

import { Head, Link, router } from '@inertiajs/react';

import GlassCard from '@/Components/GlassCard';
import PageHeader from '@/Components/PageHeader';
import ScrollArea from '@/Components/ScrollArea';
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

            <div className="space-y-6">
                <PageHeader
                    actions={
                        <Link
                            href="/admin/organizations/create"
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah organisasi
                        </Link>
                    }
                />

                <GlassCard>
                    {organizations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-white/50">
                            <Building2 className="h-12 w-12" />
                            <p className="text-sm">Belum ada organisasi</p>
                        </div>
                    ) : (
                        <ScrollArea axis="horizontal" className="w-full" viewportClassName="pb-2">
                            <table className="w-full text-sm text-white/80">
                                <thead>
                                    <tr className="border-b border-slate-800 text-left text-white/50">
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
                                                <span className="rounded-full bg-slate-900/80 px-2.5 py-1 text-xs font-mono">
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
                                                        className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-1.5 text-xs font-medium transition hover:bg-slate-800"
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
                        </ScrollArea>
                    )}
                </GlassCard>
            </div>
        </AppLayout>
    );
}
