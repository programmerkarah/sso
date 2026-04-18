import {
    Calendar,
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
}

export default function Dashboard({ auth, applicationsCount }: DashboardProps) {
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
