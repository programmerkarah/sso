import {
    ArrowRight,
    ExternalLink,
    Globe,
    Plus,
    ShieldCheck,
    UserCog,
} from 'lucide-react';

import { Head, Link } from '@inertiajs/react';

import AppLayout from '@/Layouts/AppLayout';
import { PageProps } from '@/types';

interface DashboardProps extends PageProps {
    applicationsCount: number;
    organizationType: string | null;
    availableApplications: Array<{
        id: number;
        name: string;
        description: string | null;
        landing_url: string;
        launch_url: string;
        logo_url: string | null;
        is_active: boolean;
    }>;
    pendingVerificationUsers: Array<{
        id: number;
        name: string;
        username: string;
        email: string;
        created_at: string;
    }>;
}

export default function Dashboard({
    auth,
    applicationsCount,
    organizationType,
    availableApplications,
    pendingVerificationUsers,
}: DashboardProps) {
    const canManageApplications = auth.can.manageApplications;
    const canManageUsers = auth.can.manageUsers;
    const user = auth.user!;

    const formatDateTime = (value?: string) =>
        value
            ? new Date(value).toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
              })
            : '-';

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="mx-auto max-w-7xl">
                <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-sky-300">Dashboard SSO</p>
                        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                            Selamat datang, {user.name}
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                            Akses aplikasi yang tersedia dan kelola kebutuhan akun Anda dari satu tempat.
                        </p>
                    </div>
                    <Link
                        href="/settings/security"
                        className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                    >
                        <ShieldCheck className="h-4 w-4 text-emerald-300" />
                        Keamanan akun
                    </Link>
                </div>

                <div className="mb-7 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Aplikasi tersedia</p>
                        <div className="mt-3 flex items-end justify-between gap-4">
                            <p className="text-4xl font-semibold text-white">{applicationsCount}</p>
                            <Link href="/applications" className="text-sm font-semibold text-sky-300 hover:text-sky-200">Lihat semua</Link>
                        </div>
                        <p className="mt-3 text-sm text-slate-400">
                            {canManageApplications
                                ? 'Aplikasi aktif yang terdaftar di SSO.'
                                : organizationType
                                  ? `Sesuai akses organisasi ${organizationType}.`
                                  : 'Sesuai akses organisasi akun Anda.'}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Akun</p>
                        <p className="mt-3 truncate text-lg font-semibold text-white">{user.name}</p>
                        <p className="mt-1 truncate text-sm text-slate-400">{user.email}</p>
                        <div className="mt-4 inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                            Aktif
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            {canManageUsers ? 'Perlu perhatian' : 'Akses akun'}
                        </p>
                        {canManageUsers ? (
                            <>
                                <p className="mt-3 text-4xl font-semibold text-white">{pendingVerificationUsers.length}</p>
                                <p className="mt-3 text-sm text-slate-400">Pengguna menunggu verifikasi dari administrator.</p>
                            </>
                        ) : (
                            <>
                                <p className="mt-3 text-lg font-semibold text-white">Pengguna SSO</p>
                                <p className="mt-3 text-sm text-slate-400">Hak akses aplikasi ditentukan oleh organisasi dan administrator.</p>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid gap-7 lg:grid-cols-[1fr_320px]">
                    <section className="min-w-0">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-white">Aplikasi Anda</h2>
                                <p className="mt-1 text-sm text-slate-400">Buka aplikasi tanpa perlu login ulang.</p>
                            </div>
                            <Link href="/applications" className="hidden items-center gap-1.5 text-sm font-semibold text-sky-300 hover:text-sky-200 sm:inline-flex">
                                Semua aplikasi <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        {availableApplications.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-white/15 bg-slate-900/70 px-6 py-12 text-center">
                                <Globe className="mx-auto h-7 w-7 text-slate-500" />
                                <p className="mt-4 text-sm font-semibold text-slate-200">Belum ada aplikasi tersedia</p>
                                <p className="mt-1 text-sm text-slate-500">Aplikasi akan muncul setelah akses diberikan untuk akun Anda.</p>
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {availableApplications.map((application) => (
                                    <a
                                        key={application.id}
                                        href={application.launch_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex min-w-0 items-center gap-4 rounded-2xl border border-white/10 bg-slate-900 p-4 transition hover:border-sky-400/30 hover:bg-slate-900/80"
                                    >
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 p-1.5">
                                            {application.logo_url ? (
                                                <img src={application.logo_url} alt={`Logo ${application.name}`} className="h-full w-full object-contain" />
                                            ) : (
                                                <Globe className="h-5 w-5 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-white">{application.name}</p>
                                            <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                                                {application.description ?? 'Aplikasi terhubung ke SSO'}
                                            </p>
                                        </div>
                                        <ExternalLink className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:text-sky-300" />
                                    </a>
                                ))}
                            </div>
                        )}
                    </section>

                    <aside className="space-y-4">
                        <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
                            <h2 className="text-sm font-semibold text-white">{canManageApplications ? 'Aksi administrator' : 'Akun & keamanan'}</h2>
                            <div className="mt-4 space-y-2">
                                {canManageApplications && (
                                    <Link href="/admin/applications/create" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white">
                                        <Plus className="h-4 w-4 text-sky-300" /> Tambah aplikasi
                                    </Link>
                                )}
                                {canManageApplications && (
                                    <Link href="/admin/applications" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white">
                                        <Globe className="h-4 w-4 text-sky-300" /> Kelola aplikasi
                                    </Link>
                                )}
                                {canManageUsers && (
                                    <Link href="/admin/users" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white">
                                        <UserCog className="h-4 w-4 text-violet-300" /> Kelola pengguna
                                    </Link>
                                )}
                                <Link href="/settings/security" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white">
                                    <ShieldCheck className="h-4 w-4 text-emerald-300" /> Keamanan akun
                                </Link>
                            </div>
                        </div>

                        {canManageUsers && pendingVerificationUsers.length > 0 && (
                            <div className="rounded-2xl border border-amber-400/15 bg-slate-900 p-5">
                                <div className="flex items-center justify-between gap-3">
                                    <h2 className="text-sm font-semibold text-white">Menunggu verifikasi</h2>
                                    <span className="rounded-full bg-amber-400/10 px-2 py-1 text-xs font-bold text-amber-200">{pendingVerificationUsers.length}</span>
                                </div>
                                <div className="mt-4 divide-y divide-white/8">
                                    {pendingVerificationUsers.slice(0, 4).map((pendingUser) => (
                                        <div key={pendingUser.id} className="py-3 first:pt-0">
                                            <p className="truncate text-sm font-medium text-slate-200">{pendingUser.name}</p>
                                            <p className="mt-1 text-xs text-slate-500">@{pendingUser.username} • {formatDateTime(pendingUser.created_at)}</p>
                                        </div>
                                    ))}
                                </div>
                                <Link href="/admin/users" className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-200 hover:text-amber-100">
                                    Tinjau pengguna <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </AppLayout>
    );
}
