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
                                className={`flex flex-col gap-5 ${!application.is_active ? 'opacity-60' : ''}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="h-14 w-14 overflow-hidden rounded-2xl border border-[#dbe5ec] bg-[#f8fbfd] p-2">
                                        {application.logo_url ? (
                                            <img
                                                src={application.logo_url}
                                                alt={`Logo ${application.name}`}
                                                className="h-full w-full object-contain"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center rounded-xl bg-slate-900/80 text-[#6f8495]">
                                                <Globe className="h-6 w-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-bold text-[#18324a]">
                                                {application.name}
                                            </h2>
                                            {isAdmin &&
                                                !application.is_active && (
                                                    <span className="rounded-full border border-amber-400/30 bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">
                                                        Nonaktif
                                                    </span>
                                                )}
                                        </div>
                                        <p className="text-sm text-[#6f8495]">
                                            {application.description ??
                                                'Tidak ada deskripsi aplikasi.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-[#dbe5ec] bg-[#f8fbfd] px-3 py-2 text-sm text-[#49657b]">
                                    {application.landing_url}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {application.is_active && (
                                        <a
                                            href={application.launch_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 self-start rounded-xl border border-[#b8d9ee] bg-[#e7f3fb] px-4 py-2 text-sm font-semibold text-[#347fae] transition hover:bg-[#d9edf9]"
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
                                                        ? 'border-[#f1c7c1] bg-[#fff0ee] text-[#b85d52] hover:bg-[#fde4e0]'
                                                        : 'border-[#cce4c7] bg-[#eef7ec] text-[#4f8a49] hover:bg-[#e2f1df]'
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
