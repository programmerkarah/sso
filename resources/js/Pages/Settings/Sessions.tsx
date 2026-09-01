import {
    ChevronLeft,
    ChevronRight,
    Monitor,
    ShieldCheck,
    Trash2,
} from 'lucide-react';

import { Head, router } from '@inertiajs/react';

import GlassCard from '@/Components/GlassCard';
import AppLayout from '@/Layouts/AppLayout';
import { PageProps } from '@/types';

interface UserSummary {
    id: number;
    name: string;
    username: string;
    email: string;
    last_login_at?: string | null;
    created_at?: string | null;
    session_count: number;
    oauth_count: number;
    state_token?: string;
}

interface UserListPayload {
    data: UserSummary[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_token?: string | null;
    next_page_token?: string | null;
}

interface SelectedUser {
    id: number;
    name: string;
    username: string;
    email: string;
    last_login_at?: string | null;
}

interface SessionEntry {
    id: string;
    ip_address: string | null;
    user_agent: string | null;
    last_activity: number;
    last_activity_at: string;
    is_current: boolean;
}

interface OauthApplicationEntry {
    id: string;
    client_id: number;
    client_name: string;
    token_name: string | null;
    created_at: string | null;
    updated_at: string | null;
    expires_at: string | null;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface SessionsProps extends PageProps {
    users?: UserListPayload;
    selectedUser?: SelectedUser | null;
    sessions: SessionEntry[];
    sessionMeta: PaginationMeta;
    session_prev_page_token?: string | null;
    session_next_page_token?: string | null;
    oauthApplications: OauthApplicationEntry[];
    oauthMeta: PaginationMeta;
    oauth_prev_page_token?: string | null;
    oauth_next_page_token?: string | null;
}

const formatDate = (value?: string | null) => {
    if (!value) return '—';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const parseUserAgent = (userAgent: string | null) => {
    if (!userAgent) return 'Perangkat tidak diketahui';

    const bits = [
        /Edg\/([\d.]+)/,
        /OPR\/([\d.]+)/,
        /Chrome\/([\d.]+)/,
        /Safari\/([\d.]+)/,
        /Firefox\/([\d.]+)/,
    ];

    let browser = 'Browser tidak diketahui';
    for (const pattern of bits) {
        const match = userAgent.match(pattern);
        if (match) {
            browser = `${match[0].split('/')[0]} ${match[1]}`;
            break;
        }
    }

    return `${browser} • ${userAgent}`;
};

export default function Sessions({
    users,
    selectedUser,
    sessions,
    sessionMeta,
    session_prev_page_token,
    session_next_page_token,
    oauthApplications,
    oauthMeta,
    oauth_prev_page_token,
    oauth_next_page_token,
}: SessionsProps) {
    const currentUserList = users?.data ?? [];
    const selectedUserId = selectedUser?.id ?? null;

    const visitState = (state: string | null | undefined) => {
        if (!state) {
            return;
        }

        router.post(
            '/settings/sessions',
            { state },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const changeUserPage = (token: string | null | undefined) => {
        visitState(token);
    };

    const changeSessionPage = (token: string | null | undefined) => {
        visitState(token);
    };

    const changeOauthPage = (token: string | null | undefined) => {
        visitState(token);
    };

    const selectUser = (user: UserSummary) => {
        visitState(user.state_token);
    };

    const revokeSession = (sessionId: string) => {
        router.post(
            `/settings/sessions/${sessionId}/revoke`,
            {
                user_id: selectedUserId,
                page: users?.current_page ?? 1,
                session_page: sessionMeta.current_page,
                oauth_page: oauthMeta.current_page,
            },
            {
                preserveScroll: true,
            },
        );
    };

    const revokeOauthAccess = (tokenId: string) => {
        router.post(
            `/settings/oauth/${tokenId}/revoke`,
            {
                user_id: selectedUserId,
                page: users?.current_page ?? 1,
                session_page: sessionMeta.current_page,
                oauth_page: oauthMeta.current_page,
            },
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout>
            <Head title="Kelola Sesi" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white drop-shadow-lg sm:text-4xl">
                            Kelola Sesi
                        </h1>
                        <p className="mt-2 text-base text-white/80 sm:text-lg">
                            Pilih pengguna, lalu lihat sesi dan aplikasi OAuth
                            yang sedang aktif untuk dihapus atau dicabut.
                        </p>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                        <GlassCard>
                            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl bg-sky-500/15 p-2">
                                        <Monitor className="h-5 w-5 text-sky-300" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">
                                            Daftar Pengguna
                                        </h2>
                                        <p className="text-xs text-white/60">
                                            {users?.total ??
                                                currentUserList.length}{' '}
                                            pengguna
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 space-y-3">
                                {currentUserList.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-5 text-sm text-white/70">
                                        Tidak ada pengguna yang terdaftar.
                                    </div>
                                ) : (
                                    currentUserList.map((user) => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => selectUser(user)}
                                            className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                                                selectedUserId === user.id
                                                    ? 'border-sky-400/50 bg-sky-500/10 shadow-lg shadow-sky-500/5'
                                                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-semibold text-white">
                                                        {user.name.toUpperCase()}
                                                    </div>
                                                </div>
                                                {selectedUserId === user.id && (
                                                    <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-200">
                                                        Terpilih
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-3 flex gap-2 text-[10px] text-white/55">
                                                <span className="rounded-full bg-white/5 px-2 py-1">
                                                    {user.session_count} sesi
                                                </span>
                                                <span className="rounded-full bg-white/5 px-2 py-1">
                                                    {user.oauth_count} OAuth
                                                </span>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>

                            {users && users.last_page > 1 && (
                                <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-white/65">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            changeUserPage(
                                                users.prev_page_token,
                                            )
                                        }
                                        disabled={!users.prev_page_token}
                                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <ChevronLeft className="h-3.5 w-3.5" />
                                        Prev
                                    </button>
                                    <span>
                                        Hal {users.current_page} /{' '}
                                        {users.last_page}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            changeUserPage(
                                                users.next_page_token,
                                            )
                                        }
                                        disabled={!users.next_page_token}
                                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Next
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            )}
                        </GlassCard>

                        <div className="space-y-6">
                            <GlassCard>
                                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                    <div className="rounded-xl bg-sky-500/15 p-2">
                                        <Monitor className="h-5 w-5 text-sky-300" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">
                                            Sesi Web Aktif
                                        </h2>
                                        <p className="text-sm text-white/70">
                                            {selectedUser
                                                ? `Untuk ${selectedUser.name.toUpperCase()}`
                                                : 'Pilih pengguna terlebih dahulu'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {sessions.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-white/70">
                                            Tidak ada sesi aktif yang tercatat.
                                        </div>
                                    ) : (
                                        sessions.map((session) => (
                                            <div
                                                key={session.id}
                                                className="rounded-2xl border border-white/10 bg-white/5 p-4"
                                            >
                                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                                    <div className="space-y-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="text-sm font-semibold text-white">
                                                                {session.is_current
                                                                    ? 'Sesi saat ini'
                                                                    : 'Sesi lain'}
                                                            </span>
                                                            {session.is_current && (
                                                                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-200">
                                                                    Aktif
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-white/75">
                                                            {parseUserAgent(
                                                                session.user_agent,
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-white/60">
                                                            IP:{' '}
                                                            {session.ip_address ??
                                                                'Tidak diketahui'}
                                                        </div>
                                                        <div className="text-xs text-white/60">
                                                            Terakhir aktif:{' '}
                                                            {formatDate(
                                                                session.last_activity_at,
                                                            )}
                                                        </div>
                                                    </div>

                                                    {!session.is_current && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                revokeSession(
                                                                    session.id,
                                                                )
                                                            }
                                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/20"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Hapus Sesi
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {sessionMeta.last_page > 1 && (
                                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-white/65">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                changeSessionPage(
                                                    session_prev_page_token,
                                                )
                                            }
                                            disabled={!session_prev_page_token}
                                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <ChevronLeft className="h-3.5 w-3.5" />
                                            Prev
                                        </button>
                                        <span>
                                            Hal {sessionMeta.current_page} /{' '}
                                            {sessionMeta.last_page}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                changeSessionPage(
                                                    session_next_page_token,
                                                )
                                            }
                                            disabled={!session_next_page_token}
                                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Next
                                            <ChevronRight className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                )}
                            </GlassCard>

                            <GlassCard>
                                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                    <div className="rounded-xl bg-emerald-500/15 p-2">
                                        <ShieldCheck className="h-5 w-5 text-emerald-300" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">
                                            Akses OAuth Terdaftar
                                        </h2>
                                        <p className="text-sm text-white/70">
                                            Aplikasi yang saat ini memiliki
                                            akses melalui SSO.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {oauthApplications.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-white/70">
                                            Tidak ada aplikasi OAuth yang saat
                                            ini terhubung.
                                        </div>
                                    ) : (
                                        oauthApplications.map((app) => (
                                            <div
                                                key={app.id}
                                                className="rounded-2xl border border-white/10 bg-white/5 p-4"
                                            >
                                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                                    <div className="space-y-1">
                                                        <div className="text-base font-semibold text-white">
                                                            {app.client_name}
                                                        </div>
                                                        <div className="text-xs text-white/60">
                                                            Token:{' '}
                                                            {app.token_name ??
                                                                'Akses SSO'}
                                                        </div>
                                                        <div className="text-xs text-white/60">
                                                            Dibuat:{' '}
                                                            {formatDate(
                                                                app.created_at,
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-white/60">
                                                            Expired:{' '}
                                                            {formatDate(
                                                                app.expires_at,
                                                            )}
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            revokeOauthAccess(
                                                                app.id,
                                                            )
                                                        }
                                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/20"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Cabut Akses
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {oauthMeta.last_page > 1 && (
                                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-white/65">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                changeOauthPage(
                                                    oauth_prev_page_token,
                                                )
                                            }
                                            disabled={!oauth_prev_page_token}
                                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <ChevronLeft className="h-3.5 w-3.5" />
                                            Prev
                                        </button>
                                        <span>
                                            Hal {oauthMeta.current_page} /{' '}
                                            {oauthMeta.last_page}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                changeOauthPage(
                                                    oauth_next_page_token,
                                                )
                                            }
                                            disabled={!oauth_next_page_token}
                                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Next
                                            <ChevronRight className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                )}
                            </GlassCard>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
