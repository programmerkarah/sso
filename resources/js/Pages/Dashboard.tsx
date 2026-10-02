import {
    ArrowRight,
    ExternalLink,
    Globe,
    Plus,
    ShieldCheck,
    UserCog,
} from 'lucide-react';

import { Head, Link } from '@inertiajs/react';

import PageHeader from '@/Components/PageHeader';
import AppLayout from '@/Layouts/AppLayout';
import { PageProps } from '@/types';
import { formatNumber } from '@/utils/number';

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

            <div className="space-y-6">
                <PageHeader
                    eyebrow="Dashboard SSO"
                    title={`Selamat datang, ${user.name}`}
                    actions={
                        <Link
                            href="/settings/security"
                            className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
                        >
                            <ShieldCheck className="h-4 w-4 text-emerald-300" />
                            Keamanan akun
                        </Link>
                    }
                />

                <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Aplikasi tersedia
                        </p>
                        <div className="mt-3 flex items-end justify-between gap-4">
                            <p className="text-4xl font-semibold text-white">
                                {formatNumber(applicationsCount)}
                            </p>
                            <Link
                                href="/applications"
                                className="text-sm font-semibold text-sky-300 hover:text-sky-200"
                            >
                                Lihat semua
                            </Link>
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
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Akun
                        </p>
                        <p className="mt-3 truncate text-lg font-semibold text-white">
                            {user.name}
                        </p>
                        <p className="mt-1 truncate text-sm text-slate-400">
                            {user.email}
                        </p>
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
                                <p className="mt-3 text-4xl font-semibold text-white">
                                    {formatNumber(
                                        pendingVerificationUsers.length,
                                    )}
                                </p>
                                <p className="mt-3 text-sm text-slate-400">
                                    Pengguna menunggu verifikasi dari
                                    administrator.
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="mt-3 text-lg font-semibold text-white">
                                    Pengguna SSO
                                </p>
                                <p className="mt-3 text-sm text-slate-400">
                                    Hak akses aplikasi ditentukan oleh
                                    organisasi dan administrator.
                                </p>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
                    <section className="min-w-0">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    Aplikasi Anda
                                </h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    Buka aplikasi tanpa perlu login ulang.
                                </p>
                            </div>
                            <Link
                                href="/applications"
                                className="hidden items-center gap-1.5 text-sm font-semibold text-sky-300 hover:text-sky-200 sm:inline-flex"
                            >
                                Semua aplikasi{' '}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        {availableApplications.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-white/15 bg-slate-900/70 px-6 py-12 text-center">
                                <Globe className="mx-auto h-7 w-7 text-slate-500" />
                                <p className="mt-4 text-sm font-semibold text-slate-200">
                                    Belum ada aplikasi tersedia
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Aplikasi akan muncul setelah akses diberikan
                                    untuk akun Anda.
                                </p>
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
                                                <img
                                                    src={application.logo_url}
                                                    alt={`Logo ${application.name}`}
                                                    className="h-full w-full object-contain"
                                                />
                                            ) : (
                                                <Globe className="h-5 w-5 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-white">
                                                {application.name}
                                            </p>
                                            <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                                                {application.description ??
                                                    'Aplikasi terhubung ke SSO'}
                                            </p>
                                        </div>
                                        <ExternalLink className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:text-sky-300" />
                                    </a>
                                ))}
                            </div>
                        )}
                    </section>

                    <aside className="space-y-4">
                        <div className="rounded-2xl border border-[#dbe5ec] bg-white/85 p-5 shadow-sm">
                            <div>
                                <h2 className="text-sm font-semibold text-[#18324a]">
                                    {canManageApplications
                                        ? 'Aksi administrator'
                                        : 'Akun & keamanan'}
                                </h2>
                                <p className="mt-1 text-xs leading-5 text-[#8799a7]">
                                    {canManageApplications
                                        ? 'Akses cepat ke pengelolaan utama SSO.'
                                        : 'Kelola pengaturan dan keamanan akun Anda.'}
                                </p>
                            </div>

                            <div className="mt-4 grid gap-2">
                                {canManageApplications && (
                                    <Link
                                        href="/admin/applications/create"
                                        className="group flex items-center gap-3 rounded-xl border border-[#cfe5f3] bg-[#eaf4fb] p-3 transition hover:border-[#a9d3ec] hover:bg-[#dff0fa]"
                                    >
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/80 text-[#4a9fd7] shadow-sm">
                                            <Plus className="h-4 w-4" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-semibold text-[#18324a]">
                                                Tambah aplikasi
                                            </span>
                                            <span className="mt-0.5 block text-xs text-[#6f8495]">
                                                Daftarkan integrasi SSO baru.
                                            </span>
                                        </span>
                                        <ArrowRight className="h-4 w-4 shrink-0 text-[#8aafc6] transition-transform group-hover:translate-x-0.5" />
                                    </Link>
                                )}

                                {canManageApplications && (
                                    <Link
                                        href="/admin/applications"
                                        className="group flex items-center gap-3 rounded-xl border border-[#cfe5f3] bg-[#f2f8fc] p-3 transition hover:border-[#a9d3ec] hover:bg-[#e8f4fb]"
                                    >
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/80 text-[#4a9fd7] shadow-sm">
                                            <Globe className="h-4 w-4" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-semibold text-[#18324a]">
                                                Kelola aplikasi
                                            </span>
                                            <span className="mt-0.5 block text-xs text-[#6f8495]">
                                                Atur endpoint, akses, dan status.
                                            </span>
                                        </span>
                                        <ArrowRight className="h-4 w-4 shrink-0 text-[#8aafc6] transition-transform group-hover:translate-x-0.5" />
                                    </Link>
                                )}

                                {canManageUsers && (
                                    <Link
                                        href="/admin/users"
                                        className="group flex items-center gap-3 rounded-xl border border-[#d7e9d3] bg-[#eef7ec] p-3 transition hover:border-[#bdddb8] hover:bg-[#e5f2e2]"
                                    >
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/80 text-[#69a662] shadow-sm">
                                            <UserCog className="h-4 w-4" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-semibold text-[#18324a]">
                                                Kelola pengguna
                                            </span>
                                            <span className="mt-0.5 block text-xs text-[#6f8495]">
                                                Verifikasi, role, dan akses akun.
                                            </span>
                                        </span>
                                        <ArrowRight className="h-4 w-4 shrink-0 text-[#91b98c] transition-transform group-hover:translate-x-0.5" />
                                    </Link>
                                )}

                                <Link
                                    href="/settings/security"
                                    className="group flex items-center gap-3 rounded-xl border border-[#f1dfc8] bg-[#fff4e8] p-3 transition hover:border-[#e7cba8] hover:bg-[#fceddc]"
                                >
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/80 text-[#bd8549] shadow-sm">
                                        <ShieldCheck className="h-4 w-4" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-semibold text-[#18324a]">
                                            Keamanan akun
                                        </span>
                                        <span className="mt-0.5 block text-xs text-[#6f8495]">
                                            Password, 2FA, sesi, dan perangkat.
                                        </span>
                                    </span>
                                    <ArrowRight className="h-4 w-4 shrink-0 text-[#c4a37f] transition-transform group-hover:translate-x-0.5" />
                                </Link>
                            </div>
                        </div>

                        {canManageUsers &&
                            pendingVerificationUsers.length > 0 && (
                                <div className="rounded-2xl border border-amber-400/15 bg-slate-900 p-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <h2 className="text-sm font-semibold text-white">
                                            Menunggu verifikasi
                                        </h2>
                                        <span className="rounded-full bg-amber-400/10 px-2 py-1 text-xs font-bold text-amber-200">
                                            {formatNumber(
                                                pendingVerificationUsers.length,
                                            )}
                                        </span>
                                    </div>
                                    <div className="mt-4 divide-y divide-white/8">
                                        {pendingVerificationUsers
                                            .slice(0, 4)
                                            .map((pendingUser) => (
                                                <div
                                                    key={pendingUser.id}
                                                    className="py-3 first:pt-0"
                                                >
                                                    <p className="truncate text-sm font-medium text-slate-200">
                                                        {pendingUser.name}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        @{pendingUser.username}{' '}
                                                        •{' '}
                                                        {formatDateTime(
                                                            pendingUser.created_at,
                                                        )}
                                                    </p>
                                                </div>
                                            ))}
                                    </div>
                                    <Link
                                        href="/admin/users"
                                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-200 hover:text-amber-100"
                                    >
                                        Tinjau pengguna{' '}
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            )}
                    </aside>
                </div>
            </div>
        </AppLayout>
    );
}
