import {
    CheckCircle2,
    CheckSquare,
    ChevronLeft,
    ChevronRight,
    Download,
    EllipsisVertical,
    KeyRound,
    Pencil,
    RotateCcw,
    Settings2,
    Shield,
    ShieldCheck,
    ShieldOff,
    ShieldPlus,
    UserCog,
    XCircle,
} from 'lucide-react';

import type { MouseEvent as ReactMouseEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
    organization: {
        id: number;
        name: string;
        type: string;
    } | null;
    created_at: string;
    last_login_at?: string;
    email_verified_at?: string;
    admin_verified_at?: string;
    is_admin_verified: boolean;
    two_factor_confirmed_at?: string;
    roles: string[];
    role_ids: number[];
    is_admin: boolean;
}

interface OrganizationOption {
    id: number;
    label: string;
    description?: string;
}

interface RoleOption {
    id: number;
    name: string;
    description?: string;
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
    organizationOptions: OrganizationOption[];
    roleOptions: RoleOption[];
    selectedUser?: Omit<SearchableSelectOption, 'state_token'> | null;
    clearFilterToken: string;
    exportStateToken: string;
    pendingOnlyActive: boolean;
    pendingOnlyFilterToken: string;
    allUsersFilterToken: string;
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

interface EditAccessModalState {
    isOpen: boolean;
    user: ManagedUser | null;
}

interface ActionMenuState {
    userId: number;
    top: number;
    left: number;
    maxHeight: number;
    placement: 'top' | 'bottom';
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
    organizationOptions,
    roleOptions,
    selectedUser,
    clearFilterToken,
    exportStateToken,
    pendingOnlyActive,
    pendingOnlyFilterToken,
    allUsersFilterToken,
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
    const [editAccessModal, setEditAccessModal] =
        useState<EditAccessModalState>({
            isOpen: false,
            user: null,
        });
    const [batchAccessModalOpen, setBatchAccessModalOpen] = useState(false);
    const [batchVerifyModalOpen, setBatchVerifyModalOpen] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [actionMenu, setActionMenu] = useState<ActionMenuState | null>(null);
    const actionButtonRefs = useRef<Record<number, HTMLButtonElement | null>>(
        {},
    );
    const actionMenuRef = useRef<HTMLDivElement | null>(null);
    const identityForm = useForm({
        username: '',
        email: '',
    });
    const accessForm = useForm({
        organization_id: '',
        role_ids: [] as number[],
    });
    const batchAccessForm = useForm({
        user_ids: [] as number[],
        organization_id: '',
        role_ids: [] as number[],
    });

    const organizationSelectOptions: SearchableSelectOption[] = useMemo(
        () =>
            organizationOptions.map((option) => ({
                label: option.label,
                description: option.description,
                state_token: String(option.id),
            })),
        [organizationOptions],
    );

    useEffect(() => {
        const visibleIds = new Set(users.data.map((user) => user.id));
        setSelectedUserIds((prev) => prev.filter((id) => visibleIds.has(id)));
        setActionMenu((prev) =>
            prev !== null && visibleIds.has(prev.userId) ? prev : null,
        );
    }, [users.data]);

    const actionMenuUser = useMemo(
        () => users.data.find((user) => user.id === actionMenu?.userId) ?? null,
        [actionMenu, users.data],
    );

    const updateActionMenuPosition = useCallback(
        (userId: number, buttonElement?: HTMLButtonElement | null) => {
            const button = buttonElement ?? actionButtonRefs.current[userId];

            if (!button) {
                setActionMenu(null);

                return;
            }

            const rect = button.getBoundingClientRect();
            const menuWidth = 224;
            const estimatedMenuHeight = 288;
            const viewportPadding = 12;
            const menuGap = 6;

            const left = Math.max(
                viewportPadding,
                Math.min(
                    rect.right - menuWidth,
                    window.innerWidth - menuWidth - viewportPadding,
                ),
            );

            const spaceBelow =
                window.innerHeight - rect.bottom - viewportPadding - menuGap;
            const spaceAbove = rect.top - viewportPadding - menuGap;
            const openAbove =
                spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow;

            const maxHeight = Math.max(
                140,
                Math.min(
                    estimatedMenuHeight,
                    openAbove ? spaceAbove : spaceBelow,
                ),
            );

            const top = openAbove ? rect.top - menuGap : rect.bottom + menuGap;

            setActionMenu({
                userId,
                top,
                left,
                maxHeight,
                placement: openAbove ? 'top' : 'bottom',
            });
        },
        [],
    );

    useEffect(() => {
        if (!actionMenu) {
            return;
        }

        const reposition = () => {
            updateActionMenuPosition(actionMenu.userId);
        };

        window.addEventListener('resize', reposition);
        window.addEventListener('scroll', reposition, true);

        return () => {
            window.removeEventListener('resize', reposition);
            window.removeEventListener('scroll', reposition, true);
        };
    }, [actionMenu, updateActionMenuPosition]);

    useEffect(() => {
        if (!actionMenu) {
            return;
        }

        const handleOutsideClick = (event: MouseEvent) => {
            const target = event.target as Node;
            const isClickInsideMenu =
                actionMenuRef.current?.contains(target) ?? false;
            const isClickInsideTrigger =
                actionButtonRefs.current[actionMenu.userId]?.contains(target) ??
                false;

            if (!isClickInsideMenu && !isClickInsideTrigger) {
                setActionMenu(null);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [actionMenu]);

    const toggleActionMenu = (
        event: ReactMouseEvent<HTMLButtonElement>,
        userId: number,
    ) => {
        event.stopPropagation();

        if (actionMenu?.userId === userId) {
            setActionMenu(null);

            return;
        }

        updateActionMenuPosition(userId, event.currentTarget);
    };

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

    const openEditAccessModal = (user: ManagedUser) => {
        accessForm.setData({
            organization_id: user.organization
                ? String(user.organization.id)
                : '',
            role_ids: user.role_ids,
        });
        accessForm.clearErrors();
        setEditAccessModal({
            isOpen: true,
            user,
        });
    };

    const closeEditAccessModal = () => {
        setEditAccessModal({
            isOpen: false,
            user: null,
        });
        accessForm.clearErrors();
    };

    const toggleAccessRole = (roleId: number) => {
        accessForm.setData(
            'role_ids',
            accessForm.data.role_ids.includes(roleId)
                ? accessForm.data.role_ids.filter((id) => id !== roleId)
                : [...accessForm.data.role_ids, roleId],
        );
    };

    const toggleBatchRole = (roleId: number) => {
        batchAccessForm.setData(
            'role_ids',
            batchAccessForm.data.role_ids.includes(roleId)
                ? batchAccessForm.data.role_ids.filter((id) => id !== roleId)
                : [...batchAccessForm.data.role_ids, roleId],
        );
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

    const submitAccessUpdate = () => {
        if (!editAccessModal.user) {
            return;
        }

        accessForm.post(
            `/admin/users/${editAccessModal.user.route_key}/access`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    closeEditAccessModal();
                },
            },
        );
    };

    const submitBatchAccessUpdate = () => {
        batchAccessForm.transform((data) => ({
            ...data,
            user_ids: selectedUserIds,
        }));

        batchAccessForm.post('/admin/users/access/batch', {
            preserveScroll: true,
            onSuccess: () => {
                setBatchAccessModalOpen(false);
                setSelectedUserIds([]);
                batchAccessForm.setData({
                    user_ids: [],
                    organization_id: '',
                    role_ids: [],
                });
            },
        });
    };

    const submitBatchVerify = () => {
        router.post(
            '/admin/users/verify/batch',
            { user_ids: selectedUserIds },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setBatchVerifyModalOpen(false);
                    setSelectedUserIds([]);
                },
            },
        );
    };

    const toggleUserSelection = (userId: number) => {
        setSelectedUserIds((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId],
        );
    };

    const toggleSelectAllCurrentPage = () => {
        const currentPageUserIds = users.data.map((user) => user.id);
        const allSelected = currentPageUserIds.every((id) =>
            selectedUserIds.includes(id),
        );

        setSelectedUserIds((prev) => {
            if (allSelected) {
                return prev.filter((id) => !currentPageUserIds.includes(id));
            }

            return [...new Set([...prev, ...currentPageUserIds])];
        });
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

    const handleToggleAdminVerification = (user: ManagedUser) => {
        if (user.is_admin_verified) {
            openModal({
                title: 'Cabut Verifikasi Admin',
                description: `Cabut verifikasi admin untuk ${user.name}? Pengguna akan langsung kehilangan akses ke fitur SSO sampai diverifikasi kembali.`,
                confirmLabel: 'Ya, Cabut Verifikasi',
                confirmVariant: 'red',
                onConfirm: () => {
                    router.post(
                        `/admin/users/${user.route_key}/toggle-admin-verification`,
                        {},
                        { preserveScroll: true },
                    );
                    closeModal();
                },
            });

            return;
        }

        openModal({
            title: 'Verifikasi User oleh Admin SSO',
            description: `Verifikasi ${user.name} sebagai user valid? Setelah diverifikasi, pengguna dapat mengakses fitur SSO sesuai role dan kebijakan organisasi.`,
            confirmLabel: 'Ya, Verifikasi User',
            confirmVariant: 'emerald',
            onConfirm: () => {
                router.post(
                    `/admin/users/${user.route_key}/toggle-admin-verification`,
                    {},
                    { preserveScroll: true },
                );
                closeModal();
            },
        });
    };

    const adminCount = users.data.filter((u) => u.is_admin).length;
    const twoFactorCount = users.data.filter(
        (u) => u.two_factor_confirmed_at,
    ).length;
    const excelExportUrl = `/admin/users/export/excel?state=${encodeURIComponent(exportStateToken)}`;
    const pdfExportUrl = `/admin/users/export/pdf?state=${encodeURIComponent(exportStateToken)}`;
    const allSelectedOnCurrentPage =
        users.data.length > 0 &&
        users.data.every((user) => selectedUserIds.includes(user.id));

    const selectedAccessOrganization = accessForm.data.organization_id
        ? organizationSelectOptions.find(
              (option) =>
                  option.state_token === accessForm.data.organization_id,
          )
        : null;

    const selectedBatchOrganization = batchAccessForm.data.organization_id
        ? organizationSelectOptions.find(
              (option) =>
                  option.state_token === batchAccessForm.data.organization_id,
          )
        : null;

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
            {editAccessModal.isOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={closeEditAccessModal}
                    />
                    <div className="relative w-full max-w-xl rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl">
                        <h3 className="text-lg font-bold text-white">
                            Atur Organisasi & Role
                        </h3>
                        <p className="mt-1 text-sm text-white/75">
                            Perbarui akses untuk {editAccessModal.user?.name}.
                        </p>

                        <div className="mt-5 space-y-5">
                            <div>
                                <Label>Organisasi (opsional)</Label>
                                <SearchableSelect
                                    options={organizationSelectOptions}
                                    selectedOption={
                                        selectedAccessOrganization
                                            ? {
                                                  label: selectedAccessOrganization.label,
                                                  description:
                                                      selectedAccessOrganization.description,
                                              }
                                            : null
                                    }
                                    placeholder="Pilih organisasi"
                                    onSelect={(option) =>
                                        accessForm.setData(
                                            'organization_id',
                                            option.state_token,
                                        )
                                    }
                                    onClear={() =>
                                        accessForm.setData(
                                            'organization_id',
                                            '',
                                        )
                                    }
                                />
                                {accessForm.errors.organization_id && (
                                    <p className="mt-1 text-sm text-red-300">
                                        {accessForm.errors.organization_id}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label required>Role</Label>
                                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                    {roleOptions.map((role) => {
                                        const checked =
                                            accessForm.data.role_ids.includes(
                                                role.id,
                                            );

                                        return (
                                            <label
                                                key={role.id}
                                                className={`flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                                                    checked
                                                        ? 'border-blue-300/50 bg-blue-500/20 text-white'
                                                        : 'border-white/20 bg-white/5 text-white/80 hover:bg-white/10'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() =>
                                                        toggleAccessRole(
                                                            role.id,
                                                        )
                                                    }
                                                    className="mt-1 rounded border-white/30 bg-transparent text-blue-400 focus:ring-blue-300/40"
                                                />
                                                <span>
                                                    <span className="font-semibold">
                                                        {role.name}
                                                    </span>
                                                    {role.description && (
                                                        <span className="block text-xs text-white/55">
                                                            {role.description}
                                                        </span>
                                                    )}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                                {accessForm.errors.role_ids && (
                                    <p className="mt-1 text-sm text-red-300">
                                        {accessForm.errors.role_ids}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={closeEditAccessModal}
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                onClick={submitAccessUpdate}
                                disabled={accessForm.processing}
                            >
                                {accessForm.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Akses'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {batchAccessModalOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setBatchAccessModalOpen(false)}
                    />
                    <div className="relative w-full max-w-2xl rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl">
                        <h3 className="text-lg font-bold text-white">
                            Atur Organisasi & Role (Batch)
                        </h3>
                        <p className="mt-1 text-sm text-white/75">
                            Terapkan perubahan ke {selectedUserIds.length}{' '}
                            pengguna terpilih.
                        </p>

                        <div className="mt-5 space-y-5">
                            <div>
                                <Label>Organisasi (opsional)</Label>
                                <SearchableSelect
                                    options={organizationSelectOptions}
                                    selectedOption={
                                        selectedBatchOrganization
                                            ? {
                                                  label: selectedBatchOrganization.label,
                                                  description:
                                                      selectedBatchOrganization.description,
                                              }
                                            : null
                                    }
                                    placeholder="Pilih organisasi untuk batch"
                                    onSelect={(option) =>
                                        batchAccessForm.setData(
                                            'organization_id',
                                            option.state_token,
                                        )
                                    }
                                    onClear={() =>
                                        batchAccessForm.setData(
                                            'organization_id',
                                            '',
                                        )
                                    }
                                />
                                {batchAccessForm.errors.organization_id && (
                                    <p className="mt-1 text-sm text-red-300">
                                        {batchAccessForm.errors.organization_id}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label>Role (opsional)</Label>
                                <p className="mb-2 text-xs text-white/55">
                                    Pilih role jika ingin menimpa role pengguna
                                    terpilih.
                                </p>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {roleOptions.map((role) => {
                                        const checked =
                                            batchAccessForm.data.role_ids.includes(
                                                role.id,
                                            );

                                        return (
                                            <label
                                                key={role.id}
                                                className={`flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                                                    checked
                                                        ? 'border-blue-300/50 bg-blue-500/20 text-white'
                                                        : 'border-white/20 bg-white/5 text-white/80 hover:bg-white/10'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() =>
                                                        toggleBatchRole(role.id)
                                                    }
                                                    className="mt-1 rounded border-white/30 bg-transparent text-blue-400 focus:ring-blue-300/40"
                                                />
                                                <span className="font-semibold">
                                                    {role.name}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                                {batchAccessForm.errors.role_ids && (
                                    <p className="mt-1 text-sm text-red-300">
                                        {batchAccessForm.errors.role_ids}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setBatchAccessModalOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                onClick={submitBatchAccessUpdate}
                                disabled={batchAccessForm.processing}
                            >
                                {batchAccessForm.processing
                                    ? 'Memproses...'
                                    : 'Terapkan Batch'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {batchVerifyModalOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setBatchVerifyModalOpen(false)}
                    />
                    <div className="relative w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl">
                        <h3 className="text-lg font-bold text-white">
                            Verifikasi Pengguna (Batch)
                        </h3>
                        <p className="mt-2 text-sm text-white/75">
                            Verifikasi{' '}
                            <span className="font-semibold text-white">
                                {selectedUserIds.length}
                            </span>{' '}
                            pengguna terpilih? Hanya pengguna yang belum
                            diverifikasi yang akan diproses.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setBatchVerifyModalOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button type="button" onClick={submitBatchVerify}>
                                Verifikasi Sekarang
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mx-auto max-w-9xl space-y-8">
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
                        {selectedUserIds.length > 0 && (
                            <>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setBatchVerifyModalOpen(true)
                                    }
                                    className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300/25 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-50 shadow-lg backdrop-blur-xl transition hover:bg-emerald-500/25"
                                >
                                    <CheckSquare className="h-4 w-4" />
                                    Verifikasi Batch ({selectedUserIds.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setBatchAccessModalOpen(true)
                                    }
                                    className="inline-flex items-center gap-2 rounded-2xl border border-fuchsia-300/25 bg-fuchsia-500/15 px-4 py-2 text-sm font-semibold text-fuchsia-50 shadow-lg backdrop-blur-xl transition hover:bg-fuchsia-500/25"
                                >
                                    <CheckSquare className="h-4 w-4" />
                                    Atur Akses Batch ({selectedUserIds.length})
                                </button>
                            </>
                        )}
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
                                    onClear={() => visitState(clearFilterToken)}
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    visitState(pendingOnlyFilterToken)
                                }
                                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                                    pendingOnlyActive
                                        ? 'border-amber-300/40 bg-amber-500/20 text-amber-100'
                                        : 'border-white/20 bg-white/10 text-white/75 hover:bg-white/20'
                                }`}
                            >
                                Pending verification only
                            </button>
                            <button
                                type="button"
                                onClick={() => visitState(allUsersFilterToken)}
                                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                                    !pendingOnlyActive
                                        ? 'border-blue-300/40 bg-blue-500/20 text-blue-100'
                                        : 'border-white/20 bg-white/10 text-white/75 hover:bg-white/20'
                                }`}
                            >
                                Semua user
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead>
                                <tr className="border-b border-white/10 bg-black/20">
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/60">
                                        <input
                                            type="checkbox"
                                            checked={allSelectedOnCurrentPage}
                                            onChange={
                                                toggleSelectAllCurrentPage
                                            }
                                            className="rounded border-white/30 bg-transparent text-blue-400 focus:ring-blue-300/40"
                                        />
                                    </th>
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
                                        Organisasi
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
                                            colSpan={9}
                                            className="px-5 py-14 text-center text-white/50"
                                        >
                                            Tidak ada data yang dapat
                                            ditampilkan atau belum ada pengguna
                                            terdaftar.
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="transition-colors hover:bg-white/5"
                                        >
                                            <td className="px-5 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUserIds.includes(
                                                        user.id,
                                                    )}
                                                    onChange={() =>
                                                        toggleUserSelection(
                                                            user.id,
                                                        )
                                                    }
                                                    className="rounded border-white/30 bg-transparent text-blue-400 focus:ring-blue-300/40"
                                                />
                                            </td>
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

                                            {/* Organisasi */}
                                            <td className="px-5 py-4">
                                                {user.organization ? (
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm font-semibold text-white">
                                                            {
                                                                user
                                                                    .organization
                                                                    .name
                                                            }
                                                        </span>
                                                        <span className="text-xs text-white/55">
                                                            {
                                                                user
                                                                    .organization
                                                                    .type
                                                            }
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-white/45">
                                                        Belum diatur
                                                    </span>
                                                )}
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
                                                            user.is_admin_verified
                                                                ? 'bg-emerald-400/20 text-emerald-100'
                                                                : 'bg-red-400/20 text-red-100'
                                                        }`}
                                                    >
                                                        {user.is_admin_verified ? (
                                                            <ShieldCheck className="h-3 w-3" />
                                                        ) : (
                                                            <ShieldOff className="h-3 w-3" />
                                                        )}
                                                        {user.is_admin_verified
                                                            ? 'Terverifikasi admin'
                                                            : 'Menunggu verifikasi admin'}
                                                    </span>
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
                                                <div className="relative flex justify-end">
                                                    <button
                                                        ref={(element) => {
                                                            actionButtonRefs.current[
                                                                user.id
                                                            ] = element;
                                                        }}
                                                        type="button"
                                                        onClick={(event) =>
                                                            toggleActionMenu(
                                                                event,
                                                                user.id,
                                                            )
                                                        }
                                                        className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 p-2 text-white/80 transition hover:bg-white/20 hover:text-white"
                                                        title="Buka menu aksi"
                                                    >
                                                        <EllipsisVertical className="h-4 w-4" />
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

                {actionMenu && actionMenuUser && (
                    <>
                        <div
                            ref={actionMenuRef}
                            className="fixed z-40 w-56 overflow-y-auto rounded-xl border border-white/20 bg-slate-950/95 p-2 shadow-2xl backdrop-blur"
                            style={{
                                top: actionMenu.top,
                                left: actionMenu.left,
                                maxHeight: actionMenu.maxHeight,
                                transform:
                                    actionMenu.placement === 'top'
                                        ? 'translateY(-100%)'
                                        : 'translateY(0)',
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    handleToggleAdminVerification(
                                        actionMenuUser,
                                    );
                                    setActionMenu(null);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-white/85 transition hover:bg-white/10"
                            >
                                {actionMenuUser.is_admin_verified ? (
                                    <ShieldOff className="h-3.5 w-3.5 text-red-200" />
                                ) : (
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-200" />
                                )}
                                {actionMenuUser.is_admin_verified
                                    ? 'Cabut Verifikasi Admin'
                                    : 'Verifikasi User'}
                            </button>

                            {actionMenuUser.id !== currentUserId && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleToggleAdmin(actionMenuUser);
                                        setActionMenu(null);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-white/85 transition hover:bg-white/10"
                                >
                                    {actionMenuUser.is_admin ? (
                                        <ShieldOff className="h-3.5 w-3.5 text-red-200" />
                                    ) : (
                                        <ShieldPlus className="h-3.5 w-3.5 text-purple-200" />
                                    )}
                                    {actionMenuUser.is_admin
                                        ? 'Cabut Admin'
                                        : 'Jadikan Admin'}
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => {
                                    openEditAccessModal(actionMenuUser);
                                    setActionMenu(null);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-white/85 transition hover:bg-white/10"
                            >
                                <Settings2 className="h-3.5 w-3.5 text-indigo-200" />
                                Atur Akses
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    openEditIdentityModal(actionMenuUser);
                                    setActionMenu(null);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-white/85 transition hover:bg-white/10"
                            >
                                <Pencil className="h-3.5 w-3.5 text-sky-200" />
                                Ubah Identitas
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    handleResetPassword(actionMenuUser);
                                    setActionMenu(null);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-white/85 transition hover:bg-white/10"
                            >
                                <KeyRound className="h-3.5 w-3.5 text-amber-200" />
                                Reset Password
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    handleResetTwoFactor(actionMenuUser);
                                    setActionMenu(null);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-white/85 transition hover:bg-white/10"
                            >
                                <RotateCcw className="h-3.5 w-3.5 text-red-200" />
                                Reset 2FA
                            </button>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
