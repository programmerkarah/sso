import { ExternalLink, Globe, Power, Server } from 'lucide-react';

import { Head, router } from '@inertiajs/react';

import GlassCard from '@/Components/GlassCard';
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

            <div className="mx-auto max-w-9xl space-y-8">
                <div>
                    <h1 className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-4xl font-black text-transparent drop-shadow-xl sm:text-5xl">
                        Aplikasi SSO
                    </h1>
                    <p className="mt-2 max-w-3xl text-white/80">
                        Daftar aplikasi yang dapat diakses menggunakan akun
                        Single Sign-On Anda. Halaman ini hanya menampilkan
                        informasi publik aplikasi.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {applications.length === 0 ? (
                        <GlassCard className="md:col-span-2 xl:col-span-3">
                            <div className="flex items-center gap-3 text-white/80">
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
                                    <div className="h-14 w-14 overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-2">
                                        {application.logo_url ? (
                                            <img
                                                src={application.logo_url}
                                                alt={`Logo ${application.name}`}
                                                className="h-full w-full object-contain"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center rounded-xl bg-white/10 text-white/70">
                                                <Globe className="h-6 w-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-bold text-white">
                                                {application.name}
                                            </h2>
                                            {isAdmin &&
                                                !application.is_active && (
                                                    <span className="rounded-full border border-amber-400/30 bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">
                                                        Nonaktif
                                                    </span>
                                                )}
                                        </div>
                                        <p className="text-sm text-white/70">
                                            {application.description ??
                                                'Tidak ada deskripsi aplikasi.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-sm text-white/80">
                                    {application.landing_url}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {application.is_active && (
                                        <a
                                            href={application.launch_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 self-start rounded-xl border border-sky-300/30 bg-sky-500/15 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/25"
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
                                                        ? 'border-red-300/30 bg-red-500/15 text-red-100 hover:bg-red-500/25'
                                                        : 'border-emerald-300/30 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25'
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
