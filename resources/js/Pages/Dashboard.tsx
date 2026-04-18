import {
    Calendar,
    ExternalLink,
    Globe,
    List,
    Plus,
    Server,
    Shield,
    User,
    UserCog,
    Zap,
} from 'lucide-react';

import { Head, Link } from '@inertiajs/react';

import GlassCard from '@/Components/GlassCard';
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
    const registeredSinceLabel = user.created_at
        ? new Date(user.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
          })
        : 'data belum tersedia';
    const formatDateTime = (value?: string) => {
        if (!value) {
            return 'waktu tidak tersedia';
        }

        return new Date(value).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-4xl font-black text-transparent drop-shadow-xl sm:text-5xl">
                        Dashboard
                    </h1>
                    <p className="mt-2 text-lg text-white/80 drop-shadow-lg">
                        Selamat datang kembali, {user.name}!
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="mb-8 grid gap-6 md:grid-cols-3">
                    {/* User Info Card */}
                    <GlassCard hover>
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-full bg-gradient-to-br from-blue-400/30 to-blue-600/30 p-3 backdrop-blur-sm">
                                <User className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-white drop-shadow-lg">
                                Informasi Akun
                            </h2>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="text-white/70">Nama:</span>
                                <p className="mt-1 font-semibold text-white">
                                    {user.name}
                                </p>
                            </div>
                            <div>
                                <span className="text-white/70">Email:</span>
                                <p className="mt-1 break-all font-semibold text-white">
                                    {user.email}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 pt-2 text-white/70">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    Terdaftar sejak {registeredSinceLabel}
                                </span>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Applications Count Card */}
                    <GlassCard hover>
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-full bg-gradient-to-br from-purple-400/30 to-pink-600/30 p-3 backdrop-blur-sm">
                                <Server className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-white drop-shadow-lg">
                                Aplikasi
                            </h2>
                        </div>
                        <div className="text-6xl font-black text-white drop-shadow-2xl">
                            {applicationsCount}
                        </div>
                        <p className="mt-2 text-sm text-white/80">
                            {canManageApplications
                                ? 'Aplikasi aktif terdaftar'
                                : 'Aplikasi SSO aktif yang tersedia'}
                        </p>
                        {!canManageApplications && (
                            <p className="mt-1 text-xs text-white/55">
                                {organizationType
                                    ? `Difilter untuk organisasi ${organizationType}`
                                    : 'Difilter berdasarkan organisasi user'}
                            </p>
                        )}
                        <div className="mt-4 space-y-2">
                            {availableApplications.length > 0 ? (
                                availableApplications.slice(0, 3).map((application) => (
                                    <a
                                        key={application.id}
                                        href={application.launch_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center justify-between gap-3 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-left backdrop-blur-sm transition hover:bg-white/20"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/10">
                                                {application.logo_url ? (
                                                    <img
                                                        src={application.logo_url}
                                                        alt={`Logo ${application.name}`}
                                                        className="h-full w-full object-contain"
                                                    />
                                                ) : (
                                                    <Globe className="h-4 w-4 text-white/70" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-white">
                                                    {application.name}
                                                </p>
                                                <p className="truncate text-xs text-white/60">
                                                    {application.description ?? application.landing_url}
                                                </p>
                                            </div>
                                        </div>
                                        <ExternalLink className="h-4 w-4 shrink-0 text-white/60 transition group-hover:text-white" />
                                    </a>
                                ))
                            ) : (
                                <div className="rounded-xl border border-dashed border-white/20 bg-white/5 px-3 py-3 text-sm text-white/60">
                                    Belum ada aplikasi yang tersedia untuk organisasi Anda.
                                </div>
                            )}
                        </div>
                        {canManageApplications ? (
                            <Link
                                href="/admin/applications"
                                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30"
                            >
                                Kelola aplikasi
                                <Plus className="h-4 w-4" />
                            </Link>
                        ) : (
                            <Link
                                href="/applications"
                                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                            >
                                Lihat aplikasi tersedia
                                <List className="h-4 w-4" />
                            </Link>
                        )}
                    </GlassCard>

                    {/* Quick Actions Card */}
                    <GlassCard hover>
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-white drop-shadow-lg">
                                {canManageApplications
                                    ? 'Aksi Cepat'
                                    : 'Hak Akses'}
                            </h2>
                            <p className="text-sm text-white/70">
                                {canManageApplications
                                    ? 'Akses fitur dengan cepat'
                                    : 'Ringkasan privilege akun Anda'}
                            </p>
                        </div>
                        {canManageApplications ? (
                            <div className="space-y-3">
                                <Link
                                    href="/admin/applications/create"
                                    className="group flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm transition hover:border-white/30 hover:bg-white/20"
                                >
                                    <div className="rounded-full bg-gradient-to-br from-green-400/30 to-green-600/30 p-2 backdrop-blur-sm transition group-hover:scale-110">
                                        <Plus className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="font-semibold text-white">
                                        Tambah Aplikasi
                                    </span>
                                </Link>
                                <Link
                                    href="/admin/applications"
                                    className="group flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm transition hover:border-white/30 hover:bg-white/20"
                                >
                                    <div className="rounded-full bg-gradient-to-br from-blue-400/30 to-blue-600/30 p-2 backdrop-blur-sm transition group-hover:scale-110">
                                        <List className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="font-semibold text-white">
                                        Lihat Semua Aplikasi
                                    </span>
                                </Link>
                                {canManageUsers && (
                                    <Link
                                        href="/admin/users"
                                        className="group flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm transition hover:border-white/30 hover:bg-white/20"
                                    >
                                        <div className="rounded-full bg-gradient-to-br from-purple-400/30 to-purple-600/30 p-2 backdrop-blur-sm transition group-hover:scale-110">
                                            <UserCog className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="font-semibold text-white">
                                            Kelola Pengguna
                                        </span>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                                    <div className="mb-2 flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-emerald-200" />
                                        <span className="font-semibold text-white">
                                            Role Aktif
                                        </span>
                                    </div>
                                    <p className="text-sm text-white/80">
                                        Anda login sebagai pengguna biasa. Anda
                                        bisa memakai SSO, tetapi tidak bisa
                                        menambah atau mengubah aplikasi.
                                    </p>
                                </div>
                                <Link
                                    href="/settings/security"
                                    className="group flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm transition hover:border-white/30 hover:bg-white/20"
                                >
                                    <div className="rounded-full bg-gradient-to-br from-blue-400/30 to-blue-600/30 p-2 backdrop-blur-sm transition group-hover:scale-110">
                                        <Shield className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="font-semibold text-white">
                                        Kelola Keamanan Akun
                                    </span>
                                </Link>
                            </div>
                        )}
                    </GlassCard>
                </div>

                {canManageUsers && (
                    <GlassCard className="mb-8">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                                    User Menunggu Verifikasi
                                </h3>
                                <p className="text-sm text-white/70">
                                    Verifikasi manual oleh admin SSO dibutuhkan sebelum user bisa mengakses fitur.
                                </p>
                            </div>
                            <Link
                                href="/admin/users"
                                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                            >
                                Kelola pengguna
                                <UserCog className="h-4 w-4" />
                            </Link>
                        </div>

                        {pendingVerificationUsers.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-emerald-300/30 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-100">
                                Tidak ada user pending verification saat ini.
                            </div>
                        ) : (
                            <div className="grid gap-3 md:grid-cols-2">
                                {pendingVerificationUsers.map((pendingUser) => (
                                    <div
                                        key={pendingUser.id}
                                        className="rounded-xl border border-amber-300/30 bg-amber-500/10 p-4"
                                    >
                                        <p className="text-sm font-semibold text-white">{pendingUser.name}</p>
                                        <p className="text-xs text-white/70">@{pendingUser.username}</p>
                                        <p className="mt-1 text-xs text-white/75">{pendingUser.email}</p>
                                        <p className="mt-2 text-[11px] text-white/55">
                                            Terdaftar {formatDateTime(pendingUser.created_at)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </GlassCard>
                )}

                {!canManageApplications && availableApplications.length > 0 && (
                    <GlassCard className="mb-8">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                                    Aplikasi Tersedia
                                </h3>
                                <p className="text-sm text-white/70">
                                    Hanya aplikasi yang cocok dengan organisasi Anda yang ditampilkan di sini.
                                </p>
                            </div>
                            <Link
                                href="/applications"
                                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                            >
                                Lihat semua
                                <List className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {availableApplications.map((application) => (
                                <a
                                    key={application.id}
                                    href={application.launch_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex h-full flex-col gap-4 rounded-2xl border border-white/20 bg-white/8 p-4 backdrop-blur-sm transition hover:border-sky-300/30 hover:bg-white/14"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white/10">
                                            {application.logo_url ? (
                                                <img
                                                    src={application.logo_url}
                                                    alt={`Logo ${application.name}`}
                                                    className="h-full w-full object-contain"
                                                />
                                            ) : (
                                                <Globe className="h-5 w-5 text-white/70" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="truncate text-base font-bold text-white">
                                                {application.name}
                                            </h4>
                                            <p className="mt-1 line-clamp-2 text-sm text-white/65">
                                                {application.description ?? 'Aplikasi tersedia melalui SSO.'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-auto flex items-center justify-between gap-3 text-sm text-sky-100">
                                        <span className="rounded-full border border-sky-300/25 bg-sky-500/10 px-3 py-1 text-xs font-semibold">
                                            Tersedia
                                        </span>
                                        <span className="inline-flex items-center gap-2 font-semibold">
                                            Buka
                                            <ExternalLink className="h-4 w-4 transition group-hover:translate-x-0.5" />
                                        </span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </GlassCard>
                )}

                {/* Info Section */}
                <GlassCard>
                    <h3 className="mb-4 text-2xl font-bold text-white drop-shadow-lg">
                        Tentang SSO BPS Kota Sawahlunto
                    </h3>
                    <p className="mb-6 text-white/90">
                        Single Sign-On (SSO) memungkinkan Anda menggunakan satu
                        akun untuk mengakses berbagai aplikasi BPS Kota
                        Sawahlunto dengan aman dan efisien.
                    </p>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <div className="mb-3 flex items-center gap-2">
                                <Zap className="h-5 w-5 text-yellow-300" />
                                <h4 className="font-bold text-white">
                                    Untuk Pengguna
                                </h4>
                            </div>
                            <ul className="space-y-2 text-sm text-white/80">
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 text-white">•</span>
                                    <span>
                                        Login sekali untuk semua aplikasi
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 text-white">•</span>
                                    <span>
                                        Keamanan data terjamin dengan OAuth2
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 text-white">•</span>
                                    <span>Mudah mengelola akses aplikasi</span>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <div className="mb-3 flex items-center gap-2">
                                <Shield className="h-5 w-5 text-blue-300" />
                                <h4 className="font-bold text-white">
                                    Untuk Administrator
                                </h4>
                            </div>
                            <ul className="space-y-2 text-sm text-white/80">
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 text-white">•</span>
                                    <span>
                                        Kelola autentikasi secara terpusat
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 text-white">•</span>
                                    <span>Monitor aktivitas pengguna</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 text-white">•</span>
                                    <span>
                                        Integrasi mudah dengan aplikasi lain
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </AppLayout>
    );
}
