import { ExternalLink, Globe, Power, Server } from 'lucide-react';

import { Head, router } from '@inertiajs/react';

import GlassCard from '@/Components/GlassCard';
import PageHeader from '@/Components/PageHeader';
import AppLayout from '@/Layouts/AppLayout';
import { PageProps } from '@/types';

interface PublicApplication {
    id: number;
    name: string;
    description: string | null;
    landing_url: string;
    launch_url: string;
    logo_url: string | null;
    is_active: boolean;
    toggle_active_url: string | null;
}

interface ApplicationCatalogProps extends PageProps {
    applications: PublicApplication[];
    isAdmin: boolean;
}

export default function Index({
    applications,
    isAdmin,
}: ApplicationCatalogProps) {
    const handleActivate = (url: string) => {
        router.post(url);
    };

    return (
        <AppLayout>
            <Head title="Aplikasi SSO" />

            <div className="space-y-6">
                <PageHeader description="Pilih aplikasi yang tersedia untuk akun Anda dan buka tanpa login ulang." />

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {applications.length === 0 ? (
                        <GlassCard className="md:col-span-2 xl:col-span-3">
                            <div className="flex items-center gap-3 text-[#49657b]">
                                <Server className="h-5 w-5" />
                                Belum ada aplikasi aktif yang dapat ditampilkan.
                            </div>
                        </GlassCard>
                    ) : (
                        applications.map((application) => (
                            <GlassCard
                                key={application.id}
                                hover
                                className={`flex flex-col gap-5 ${!application.is_active ? 'ui-inactive-card' : ''}`}
                            >
                                <div
                                    className={`flex items-start gap-4 ${!application.is_active ? 'inactive-muted' : ''}`}
                                >
                                    <div className="h-14 w-14 overflow-hidden rounded-2xl border border-[#dbe5ec] bg-[#f8fbfd] p-2">
                                        {application.logo_url ? (
                                            <img
                                                src={application.logo_url}
                                                alt={`Logo ${application.name}`}
                                                className="h-full w-full object-contain"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center rounded-xl bg-[var(--bps-surface-soft)] text-[var(--bps-muted)]">
                                                <Globe className="h-6 w-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-bold text-[var(--bps-text)]">
                                                {application.name}
                                            </h2>
                                            {isAdmin &&
                                                !application.is_active && (
                                                    <span className="rounded-full border border-amber-400/30 bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">
                                                        Nonaktif
                                                    </span>
                                                )}
                                        </div>
                                        <p className="text-sm text-[var(--bps-muted)]">
                                            {application.description ??
                                                'Tidak ada deskripsi aplikasi.'}
                                        </p>
                                    </div>
                                </div>

                                <div
                                    className={`ui-field rounded-xl px-3 py-2 text-sm ${!application.is_active ? 'inactive-muted' : ''}`}
                                >
                                    {application.landing_url}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {application.is_active && (
                                        <a
                                            href={application.launch_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ui-selected inline-flex items-center gap-2 self-start rounded-xl border px-4 py-2 text-sm font-semibold"
                                        >
                                            Buka Aplikasi
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    )}
                                    {isAdmin &&
                                        application.toggle_active_url && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleActivate(
                                                        application.toggle_active_url!,
                                                    )
                                                }
                                                className={`inline-flex items-center gap-2 self-start rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                                                    application.is_active
                                                        ? 'ui-danger'
                                                        : 'ui-success'
                                                }`}
                                            >
                                                <Power className="h-4 w-4" />
                                                {application.is_active
                                                    ? 'Nonaktifkan'
                                                    : 'Aktifkan'}
                                            </button>
                                        )}
                                </div>
                            </GlassCard>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
