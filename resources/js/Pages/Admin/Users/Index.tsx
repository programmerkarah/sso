import {
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Download,
    KeyRound,
    Pencil,
    RotateCcw,
    Shield,
    ShieldCheck,
    ShieldOff,
    ShieldPlus,
    UserCog,
    XCircle,
} from 'lucide-react';

import { useState } from 'react';

import { Head, router, useForm } from '@inertiajs/react';

import Button from '@/Components/Button';
import ConfirmationModal from '@/Components/ConfirmationModal';
import GlassCard from '@/Components/GlassCard';
import Input from '@/Components/Input';
import Label from '@/Components/Label';
import SearchableSelect, {
    SearchableSelectOption,
} from '@/Components/SearchableSelect';
import AppLayout from '@/Layouts/AppLayout';
import { PageProps } from '@/types';

interface ManagedUser {
    id: number;
    route_key: string;
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
    label: string;
    token: string;
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
    next_page_token: string | null;
    prev_page_token: string | null;
    pages: PaginationLink[];
}

interface AdminUsersIndexProps extends PageProps {
    users: PaginatedUsers;
    userOptions: SearchableSelectOption[];
    selectedUser?: Omit<SearchableSelectOption, 'state_token'> | null;
    clearFilterToken: string;
    exportStateToken: string;
}

interface ConfirmModal {
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    confirmVariant: 'amber' | 'red' | 'emerald';
    onConfirm: () => void;
}

interface EditIdentityModalState {
    isOpen: boolean;
    user: ManagedUser | null;
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

export default function Index({
    users,
    auth,
    userOptions,
    selectedUser,
    clearFilterToken,
    exportStateToken,
}: AdminUsersIndexProps) {
    const currentUserId = auth?.user?.id;

    const [modal, setModal] = useState<ConfirmModal>({
        isOpen: false,
        title: '',
        description: '',
        confirmLabel: '',
        confirmVariant: 'red',
        onConfirm: () => {},
    });
    const [editIdentityModal, setEditIdentityModal] =
        useState<EditIdentityModalState>({
            isOpen: false,
            user: null,
        });
    const identityForm = useForm({
        username: '',
        email: '',
    });

    const openModal = (config: Omit<ConfirmModal, 'isOpen'>) => {
        setModal({ isOpen: true, ...config });
    };

    const closeModal = () => {
        setModal((prev) => ({ ...prev, isOpen: false }));
    };

    const openEditIdentityModal = (user: ManagedUser) => {
        identityForm.setData({
            username: user.username,
            email: user.email,
        });
        identityForm.clearErrors();
        setEditIdentityModal({
            isOpen: true,
            user,
        });
    };

    const closeEditIdentityModal = () => {
        setEditIdentityModal({
            isOpen: false,
            user: null,
        });
        identityForm.clearErrors();
    };

    const submitIdentityUpdate = () => {
        if (!editIdentityModal.user) {
            return;
        }

        identityForm.post(
            `/admin/users/${editIdentityModal.user.route_key}/identity`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    closeEditIdentityModal();
                },
            },
        );
    };

    const visitState = (state: string) => {
        router.post(
            '/admin/users',
            { state },
            { preserveScroll: true, preserveState: true },
        );
    };

    const handleResetPassword = (user: ManagedUser) => {
        openModal({
            title: 'Reset Password',
            description: `Reset password untuk ${user.name}? Password sementara baru akan dibuat dan ditampilkan sekali.`,
            confirmLabel: 'Ya, Reset Password',
            confirmVariant: 'amber',
            onConfirm: () => {
                router.post(
                    `/admin/users/${user.route_key}/reset-password`,
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
                    `/admin/users/${user.route_key}/reset-two-factor`,
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
                        `/admin/users/${user.route_key}/toggle-admin`,
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
                        `/admin/users/${user.route_key}/toggle-admin`,
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
    const excelExportUrl = `/admin/users/export/excel?state=${encodeURIComponent(exportStateToken)}`;
    const pdfExportUrl = `/admin/users/export/pdf?state=${encodeURIComponent(exportStateToken)}`;

    return (
        <AppLayout>
            <Head title="Kelola Pengguna" />
            <ConfirmationModal
                isOpen={modal.isOpen}
                title={modal.title}
                description={modal.description}
                confirmLabel={modal.confirmLabel}
                confirmVariant={modal.confirmVariant}
                onCancel={closeModal}
                onConfirm={modal.onConfirm}
            />
            {editIdentityModal.isOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={closeEditIdentityModal}
                    />
                    <div className="relative w-full max-w-lg rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl">
                        <h3 className="text-lg font-bold text-white">
                            Ubah Email dan Username
                        </h3>
                        <p className="mt-1 text-sm text-white/75">
                            Perbarui identitas akun untuk{' '}
                            {editIdentityModal.user?.name}.
                        </p>

                        <div className="mt-5 space-y-4">
                            <div>
                                <Label htmlFor="identity_username" required>
                                    Username
                                </Label>
                                <Input
                                    id="identity_username"
                                    value={identityForm.data.username}
                                    onChange={(e) =>
                                        identityForm.setData(
                                            'username',
                                            e.target.value,
                                        )
                                    }
                                    error={identityForm.errors.username}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="identity_email" required>
                                    Email
                                </Label>
                                <Input
                                    id="identity_email"
                                    type="email"
                                    value={identityForm.data.email}
                                    onChange={(e) =>
                                        identityForm.setData(
                                            'email',
                                            e.target.value,
                                        )
                                    }
                                    error={identityForm.errors.email}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={closeEditIdentityModal}
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                onClick={submitIdentityUpdate}
                                disabled={identityForm.processing}
                            >
                                {identityForm.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Perubahan'}
                            </Button>
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
                    <div className="flex flex-wrap items-center gap-3">
                        <a
                            href={excelExportUrl}
                            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300/25 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-50 shadow-lg backdrop-blur-xl transition hover:bg-emerald-500/25"
                        >
                            <Download className="h-4 w-4" />
                            Export Excel
                        </a>
                        <a
                            href={pdfExportUrl}
                            className="inline-flex items-center gap-2 rounded-2xl border border-blue-300/25 bg-blue-500/15 px-4 py-2 text-sm font-semibold text-blue-50 shadow-lg backdrop-blur-xl transition hover:bg-blue-500/25"
                        >
                            <Download className="h-4 w-4" />
                            Export PDF
                        </a>
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
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    Daftar Pengguna
                                </h2>
                                <p className="mt-1 text-sm text-white/60">
                                    Halaman {users.current_page} dari{' '}
                                    {users.last_page} — {users.total} pengguna
                                    {selectedUser ? ' cocok dengan filter' : ''}
                                </p>
                            </div>

                            <div className="w-full max-w-md">
                                <SearchableSelect
                                    options={userOptions}
                                    selectedOption={selectedUser ?? null}
                                    placeholder="Cari nama, username, atau email pengguna"
                                    onSelect={(option) =>
                                        visitState(option.state_token)
                                    }
                                    onClear={() =>
                                        visitState(clearFilterToken)
                                    }
                                />
                            </div>
                        </div>
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
                                        Role
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
                                            colSpan={7}
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
                                                </div>
                                            </td>

                                            {/* Email */}
                                            <td className="px-5 py-4 text-sm text-white/80">
                                                {user.email}
                                            </td>

                                            {/* Role */}
                                            <td className="px-5 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.map((role) => (
                                                        <span
                                                            key={role}
                                                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                                                                role === 'admin'
                                                                    ? 'bg-purple-400/25 text-purple-100'
                                                                    : 'bg-white/10 text-white/70'
                                                            }`}
                                                        >
                                                            {role}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>

                                            {/* Terdaftar */}
                                            <td className="px-5 py-4 text-sm text-white/70">
                                                {formatDateTime(
                                                    user.created_at,
                                                )}
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
                                                            openEditIdentityModal(
                                                                user,
                                                            )
                                                        }
                                                        title="Ubah Identitas"
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300/30 bg-sky-500/15 px-3 py-2 text-xs font-semibold text-sky-100 transition hover:bg-sky-500/25"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                        Ubah Identitas
                                                    </button>
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
                                Menampilkan {users.from ?? 0}–{users.to ?? 0}{' '}
                                dari {users.total} pengguna
                            </p>
                            <div className="flex items-center gap-1">
                                {users.prev_page_token ? (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            visitState(users.prev_page_token!)
                                        }
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 text-white/70 transition hover:bg-white/10 hover:text-white"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/30">
                                        <ChevronLeft className="h-4 w-4" />
                                    </span>
                                )}

                                {users.pages.map((page, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => visitState(page.token)}
                                        className={`flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-sm font-medium transition ${
                                            page.active
                                                ? 'border-white/40 bg-white/20 text-white'
                                                : 'border-white/20 text-white/70 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        {page.label}
                                    </button>
                                ))}

                                {users.next_page_token ? (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            visitState(users.next_page_token!)
                                        }
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 text-white/70 transition hover:bg-white/10 hover:text-white"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
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
