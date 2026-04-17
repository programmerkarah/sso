import {
    AlertTriangle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    KeyRound,
    RotateCcw,
    Shield,
    ShieldCheck,
    ShieldOff,
    ShieldPlus,
    UserCog,
    X,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

import { Head, Link, router } from '@inertiajs/react';

import GlassCard from '@/Components/GlassCard';
import AppLayout from '@/Layouts/AppLayout';
import { PageProps } from '@/types';

interface ManagedUser {
    id: number;
    name: string;
    username: string;
    email: string;
    created_at: string;
    last_login_at?: string;
    email_verified_at?: string;
    two_factor_confirmed_at?: string;
    roles: string[];
    is_admin: boolean;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedUsers {
    data: ManagedUser[];
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
    links: PaginationLink[];
}

interface AdminUsersIndexProps extends PageProps {
    users: PaginatedUsers;
}

interface ConfirmModal {
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    confirmVariant: 'amber' | 'red' | 'emerald';
    onConfirm: () => void;
}

const formatDateTime = (value?: string) => {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const variantClasses = {
    amber: {
        button: 'bg-amber-500 hover:bg-amber-600 text-white',
        icon: 'text-amber-400',
        border: 'border-amber-400/40',
        bg: 'bg-amber-500/10',
    },
    red: {
        button: 'bg-red-500 hover:bg-red-600 text-white',
        icon: 'text-red-400',
        border: 'border-red-400/40',
        bg: 'bg-red-500/10',
    },
    emerald: {
        button: 'bg-emerald-500 hover:bg-emerald-600 text-white',
        icon: 'text-emerald-400',
        border: 'border-emerald-400/40',
        bg: 'bg-emerald-500/10',
    },
};

export default function Index({ users, auth }: AdminUsersIndexProps) {
    const currentUserId = auth?.user?.id;

    const [modal, setModal] = useState<ConfirmModal>({
        isOpen: false,
        title: '',
        description: '',
        confirmLabel: '',
        confirmVariant: 'red',
        onConfirm: () => {},
    });

    const openModal = (config: Omit<ConfirmModal, 'isOpen'>) => {
        setModal({ isOpen: true, ...config });
    };

    const closeModal = () => {
        setModal((prev) => ({ ...prev, isOpen: false }));
    };

    const handleResetPassword = (user: ManagedUser) => {
        openModal({
            title: 'Reset Password',
            description: `Reset password untuk ${user.name}? Password sementara baru akan dibuat dan ditampilkan sekali.`,
            confirmLabel: 'Ya, Reset Password',
            confirmVariant: 'amber',
            onConfirm: () => {
                router.post(
                    `/admin/users/${user.id}/reset-password`,
                    {},
                    { preserveScroll: true },
                );
                closeModal();
            },
        });
    };

    const handleResetTwoFactor = (user: ManagedUser) => {
        openModal({
            title: 'Reset 2FA',
            description: `Reset 2FA untuk ${user.name}? Pengguna harus mengaktifkan ulang 2FA setelahnya. Semua perangkat tepercaya juga akan dihapus.`,
            confirmLabel: 'Ya, Reset 2FA',
            confirmVariant: 'red',
            onConfirm: () => {
                router.post(
                    `/admin/users/${user.id}/reset-two-factor`,
                    {},
                    { preserveScroll: true },
                );
                closeModal();
            },
        });
    };

    const handleToggleAdmin = (user: ManagedUser) => {
        if (user.is_admin) {
            openModal({
                title: 'Cabut Peran Admin',
                description: `Cabut peran admin dari ${user.name}? Pengguna tidak akan lagi dapat mengakses fitur admin.`,
                confirmLabel: 'Ya, Cabut Admin',
                confirmVariant: 'red',
                onConfirm: () => {
                    router.post(
                        `/admin/users/${user.id}/toggle-admin`,
                        {},
                        { preserveScroll: true },
                    );
                    closeModal();
                },
            });
        } else {
            openModal({
                title: 'Jadikan Admin',
                description: `Jadikan ${user.name} sebagai admin? Pengguna akan mendapatkan akses penuh ke fitur administrasi.`,
                confirmLabel: 'Ya, Jadikan Admin',
                confirmVariant: 'emerald',
                onConfirm: () => {
                    router.post(
                        `/admin/users/${user.id}/toggle-admin`,
                        {},
                        { preserveScroll: true },
                    );
                    closeModal();
                },
            });
        }
    };

    const adminCount = users.data.filter((u) => u.is_admin).length;
    const twoFactorCount = users.data.filter(
        (u) => u.two_factor_confirmed_at,
    ).length;

    return (
        <AppLayout>
            <Head title="Kelola Pengguna" />

            {/* Confirm Modal */}
            {modal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={closeModal}
                    />
                    <div className="relative w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl">
                        <button
                            onClick={closeModal}
                            className="absolute right-4 top-4 rounded-lg p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div
                            className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full border ${variantClasses[modal.confirmVariant].border} ${variantClasses[modal.confirmVariant].bg}`}
                        >
                            <AlertTriangle
                                className={`h-6 w-6 ${variantClasses[modal.confirmVariant].icon}`}
                            />
                        </div>

                        <h3 className="mb-2 text-lg font-bold text-white">
                            {modal.title}
                        </h3>
                        <p className="mb-6 text-sm text-white/75">
                            {modal.description}
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeModal}
                                className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                            >
                                Batal
                            </button>
                            <button
                                onClick={modal.onConfirm}
                                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${variantClasses[modal.confirmVariant].button}`}
                            >
                                {modal.confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mx-auto max-w-7xl space-y-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-4xl font-black text-transparent drop-shadow-xl sm:text-5xl">
                            Kelola Pengguna
                        </h1>
                        <p className="mt-2 max-w-2xl text-white/80">
                            Pantau akun terdaftar, reset password, nonaktifkan
                            2FA, dan kelola peran pengguna.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <GlassCard>
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-400/20 p-3">
                                <UserCog className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <div className="text-sm text-white/70">
                                    Total akun
                                </div>
                                <div className="text-3xl font-black text-white">
                                    {users.total}
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-emerald-400/20 p-3">
                                <ShieldCheck className="h-6 w-6 text-emerald-200" />
                            </div>
                            <div>
                                <div className="text-sm text-white/70">
                                    2FA aktif (halaman ini)
                                </div>
                                <div className="text-3xl font-black text-white">
                                    {twoFactorCount}
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-purple-400/20 p-3">
                                <Shield className="h-6 w-6 text-purple-200" />
                            </div>
                            <div>
                                <div className="text-sm text-white/70">
                                    Admin (halaman ini)
                                </div>
                                <div className="text-3xl font-black text-white">
                                    {adminCount}
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                <GlassCard className="overflow-hidden p-0">
                    <div className="border-b border-white/10 px-6 py-5">
                        <h2 className="text-xl font-bold text-white">
                            Daftar Pengguna
                        </h2>
                        <p className="mt-1 text-sm text-white/60">
                            Halaman {users.current_page} dari{' '}
                            {users.last_page} &mdash; {users.total}{' '}
                            pengguna terdaftar
                        </p>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead>
                                <tr className="border-b border-white/10 bg-black/20">
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/60">
                                        Pengguna
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/60">
                                        Email
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/60">
                                        Terdaftar
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/60">
                                        Login Terakhir
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/60">
                                        Status
                                    </th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white/60">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/8">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-5 py-14 text-center text-white/50"
                                        >
                                            Belum ada pengguna terdaftar.
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="transition-colors hover:bg-white/5"
                                        >
                                            {/* Pengguna */}
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-semibold text-white">
                                                        {user.name}
                                                    </span>
                                                    <span className="text-xs text-white/50">
                                                        @{user.username}
                                                    </span>
                                                    <div className="mt-0.5 flex flex-wrap gap-1">
                                                        {user.roles.map(
                                                            (role) => (
                                                                <span
                                                                    key={role}
                                                                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                                                                        role ===
                                                                        'admin'
                                                                            ? 'bg-purple-400/25 text-purple-100'
                                                                            : 'bg-white/10 text-white/70'
                                                                    }`}
                                                                >
                                                                    {role}
                                                                </span>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Email */}
                                            <td className="px-5 py-4 text-sm text-white/80">
                                                {user.email}
                                            </td>

                                            {/* Terdaftar */}
                                            <td className="px-5 py-4 text-sm text-white/70">
                                                {formatDateTime(user.created_at)}
                                            </td>

                                            {/* Login Terakhir */}
                                            <td className="px-5 py-4 text-sm text-white/70">
                                                {formatDateTime(
                                                    user.last_login_at,
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                            user.email_verified_at
                                                                ? 'bg-emerald-400/20 text-emerald-100'
                                                                : 'bg-amber-400/20 text-amber-100'
                                                        }`}
                                                    >
                                                        {user.email_verified_at ? (
                                                            <CheckCircle2 className="h-3 w-3" />
                                                        ) : (
                                                            <XCircle className="h-3 w-3" />
                                                        )}
                                                        {user.email_verified_at
                                                            ? 'Email verified'
                                                            : 'Belum verifikasi'}
                                                    </span>
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                            user.two_factor_confirmed_at
                                                                ? 'bg-blue-400/20 text-blue-100'
                                                                : 'bg-white/10 text-white/60'
                                                        }`}
                                                    >
                                                        {user.two_factor_confirmed_at ? (
                                                            <ShieldCheck className="h-3 w-3" />
                                                        ) : (
                                                            <Shield className="h-3 w-3" />
                                                        )}
                                                        {user.two_factor_confirmed_at
                                                            ? '2FA aktif'
                                                            : '2FA nonaktif'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Aksi */}
                                            <td className="px-5 py-4">
                                                <div className="flex flex-wrap justify-end gap-2">
                                                    {user.id !==
                                                        currentUserId && (
                                                        <button
                                                            onClick={() =>
                                                                handleToggleAdmin(
                                                                    user,
                                                                )
                                                            }
                                                            title={
                                                                user.is_admin
                                                                    ? 'Cabut Admin'
                                                                    : 'Jadikan Admin'
                                                            }
                                                            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                                                                user.is_admin
                                                                    ? 'border-red-300/30 bg-red-500/15 text-red-100 hover:bg-red-500/25'
                                                                    : 'border-purple-300/30 bg-purple-500/15 text-purple-100 hover:bg-purple-500/25'
                                                            }`}
                                                        >
                                                            {user.is_admin ? (
                                                                <ShieldOff className="h-3.5 w-3.5" />
                                                            ) : (
                                                                <ShieldPlus className="h-3.5 w-3.5" />
                                                            )}
                                                            {user.is_admin
                                                                ? 'Cabut Admin'
                                                                : 'Jadikan Admin'}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() =>
                                                            handleResetPassword(
                                                                user,
                                                            )
                                                        }
                                                        title="Reset Password"
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300/30 bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-100 transition hover:bg-amber-500/25"
                                                    >
                                                        <KeyRound className="h-3.5 w-3.5" />
                                                        Reset Password
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleResetTwoFactor(
                                                                user,
                                                            )
                                                        }
                                                        title="Reset 2FA"
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-300/30 bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-100 transition hover:bg-red-500/25"
                                                    >
                                                        <RotateCcw className="h-3.5 w-3.5" />
                                                        Reset 2FA
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-white/10 bg-black/10 px-6 py-4">
                            <p className="text-sm text-white/60">
                                Menampilkan {users.from ?? 0}–
                                {users.to ?? 0} dari {users.total}{' '}
                                pengguna
                            </p>
                            <div className="flex items-center gap-1">
                                {users.prev_page_url ? (
                                    <Link
                                        href={users.prev_page_url}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 text-white/70 transition hover:bg-white/10 hover:text-white"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Link>
                                ) : (
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/30">
                                        <ChevronLeft className="h-4 w-4" />
                                    </span>
                                )}

                                {users.links
                                    .filter(
                                        (link) =>
                                            !link.label.includes('Previous') &&
                                            !link.label.includes('Next'),
                                    )
                                    .map((link, i) =>
                                        link.url ? (
                                            <Link
                                                key={i}
                                                href={link.url}
                                                className={`flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-sm font-medium transition ${
                                                    link.active
                                                        ? 'border-white/40 bg-white/20 text-white'
                                                        : 'border-white/20 text-white/70 hover:bg-white/10 hover:text-white'
                                                }`}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        ) : (
                                            <span
                                                key={i}
                                                className="flex h-8 min-w-8 items-center justify-center px-1 text-sm text-white/40"
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        ),
                                    )}

                                {users.next_page_url ? (
                                    <Link
                                        href={users.next_page_url}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 text-white/70 transition hover:bg-white/10 hover:text-white"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                ) : (
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/30">
                                        <ChevronRight className="h-4 w-4" />
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </GlassCard>
            </div>
        </AppLayout>
    );
}
