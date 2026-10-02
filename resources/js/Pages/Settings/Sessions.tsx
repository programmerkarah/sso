import {
    ChevronLeft,
    ChevronRight,
    KeyRound,
    Monitor,
    Search,
    ShieldCheck,
    Trash2,
    UserRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';

import PageHeader from '@/Components/PageHeader';
import SectionTabs from '@/Components/SectionTabs';
import ScrollArea from '@/Components/ScrollArea';
import AppLayout from '@/Layouts/AppLayout';
import { PageProps } from '@/types';
import { formatNumber } from '@/utils/number';

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

const deviceLabel = (ua: string | null) => {
    if (!ua) return 'Perangkat tidak diketahui';
    if (/Edg\//.test(ua)) return 'Microsoft Edge';
    if (/Chrome\//.test(ua)) return 'Google Chrome';
    if (/Firefox\//.test(ua)) return 'Mozilla Firefox';
    if (/Safari\//.test(ua)) return 'Safari';
    return 'Browser lainnya';
};

export default function Sessions(props: SessionsProps) {
    const {
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
    } = props;

    const [query, setQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'sessions' | 'oauth'>('sessions');

    const currentUserList = users?.data ?? [];
    const selectedUserId = selectedUser?.id ?? null;

    const filteredUsers = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return currentUserList;
        return currentUserList.filter((user) =>
            [user.name, user.username, user.email].some((value) =>
                value.toLowerCase().includes(needle),
            ),
        );
    }, [currentUserList, query]);

    const visitState = (state?: string | null) => {
        if (!state) return;
        router.post('/settings/sessions', { state }, { preserveScroll: true, preserveState: true });
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
            { preserveScroll: true },
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
            { preserveScroll: true },
        );
    };

    const Pager = ({
        page,
        pages,
        previous,
        next,
    }: {
        page: number;
        pages: number;
        previous?: string | null;
        next?: string | null;
    }) =>
        pages > 1 ? (
            <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-500">
                <button type="button" onClick={() => visitState(previous)} disabled={!previous} className="inline-flex items-center gap-1 rounded-lg border border-slate-800 px-2.5 py-1.5 text-slate-300 disabled:opacity-30">
                    <ChevronLeft className="h-3.5 w-3.5" /> Sebelumnya
                </button>
                <span>{formatNumber(page)} / {formatNumber(pages)}</span>
                <button type="button" onClick={() => visitState(next)} disabled={!next} className="inline-flex items-center gap-1 rounded-lg border border-slate-800 px-2.5 py-1.5 text-slate-300 disabled:opacity-30">
                    Berikutnya <ChevronRight className="h-3.5 w-3.5" />
                </button>
            </div>
        ) : null;

    return (
        <AppLayout>
            <Head title="Sesi & Akses" />

            <div className="space-y-6">
                <PageHeader />

                <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
                    <aside className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 lg:sticky lg:top-24 lg:self-start">
                        <div className="border-b border-slate-800 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="font-semibold text-white">Pengguna</h2>
                                    <p className="mt-0.5 text-xs text-slate-500">{formatNumber(users?.total ?? currentUserList.length)} akun</p>
                                </div>
                                <UserRound className="h-5 w-5 text-slate-500" />
                            </div>
                            <div className="relative mt-3">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Cari pengguna…"
                                    className="h-10 w-full rounded-lg border border-cyan-900/60 bg-[#041b2d]/85 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-slate-600"
                                />
                            </div>
                        </div>

                        <ScrollArea className="h-[56vh] max-h-[56vh] lg:h-[62vh] lg:max-h-[62vh]" viewportClassName="p-2" contentClassName="space-y-1">
                            {filteredUsers.map((user) => (
                                <button
                                    key={user.id}
                                    type="button"
                                    onClick={() => visitState(user.state_token)}
                                    className={
                                        'w-full rounded-xl px-3 py-3 text-left transition ' +
                                        (selectedUserId === user.id
                                            ? 'bg-slate-800 text-white'
                                            : 'text-slate-300 hover:bg-slate-800/60')
                                    }
                                >
                                    <div className="truncate text-sm font-medium">{user.name}</div>
                                    <div className="mt-0.5 truncate text-xs text-slate-500">@{user.username}</div>
                                    <div className="mt-2 flex gap-3 text-[11px] text-slate-500">
                                        <span>{formatNumber(user.session_count)} sesi</span>
                                        <span>{formatNumber(user.oauth_count)} aplikasi</span>
                                    </div>
                                </button>
                            ))}
                            {filteredUsers.length === 0 && (
                                <div className="px-3 py-8 text-center text-sm text-slate-500">Pengguna tidak ditemukan.</div>
                            )}
                        </ScrollArea>

                        {users && users.last_page > 1 && (
                            <div className="border-t border-slate-800 p-3">
                                <Pager page={users.current_page} pages={users.last_page} previous={users.prev_page_token} next={users.next_page_token} />
                            </div>
                        )}
                    </aside>

                    <section className="min-w-0 space-y-4">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5">
                            {selectedUser ? (
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Akun dipilih</p>
                                        <h2 className="mt-1 truncate text-xl font-semibold text-white">{selectedUser.name}</h2>
                                        <p className="mt-1 truncate text-sm text-slate-400">{selectedUser.email}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="rounded-xl bg-[#041b2d]/70 px-4 py-3">
                                            <div className="text-xl font-semibold text-white">{formatNumber(sessionMeta.total)}</div>
                                            <div className="text-xs text-slate-500">Sesi web</div>
                                        </div>
                                        <div className="rounded-xl bg-[#041b2d]/70 px-4 py-3">
                                            <div className="text-xl font-semibold text-white">{formatNumber(oauthMeta.total)}</div>
                                            <div className="text-xs text-slate-500">Akses OAuth</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-4 text-sm text-slate-500">Pilih pengguna untuk melihat sesi dan akses aplikasinya.</div>
                            )}
                        </div>

                        <SectionTabs
                            active={activeTab}
                            onChange={setActiveTab}
                            items={[
                                { id: 'sessions', label: 'Sesi web', icon: <Monitor className="h-4 w-4" /> },
                                { id: 'oauth', label: 'Akses OAuth', icon: <ShieldCheck className="h-4 w-4" /> },
                            ]}
                        />

                        {activeTab === 'sessions' ? (
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/50">
                                <div className="border-b border-slate-800 px-4 py-4 sm:px-5">
                                    <h3 className="font-semibold text-white">Sesi web aktif</h3>
                                    <p className="mt-1 text-xs text-slate-500">Perangkat yang memiliki sesi login aktif pada akun ini.</p>
                                </div>
                                <div className="space-y-2 p-3 sm:p-4">
                                    {sessions.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-slate-800 px-4 py-10 text-center text-sm text-slate-500">Tidak ada sesi aktif.</div>
                                    ) : sessions.map((session) => (
                                        <div key={session.id} className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/45 p-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-medium text-white">{deviceLabel(session.user_agent)}</span>
                                                    {session.is_current && <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">Sesi saat ini</span>}
                                                </div>
                                                <p className="mt-1 truncate text-xs text-slate-500">{session.ip_address ?? 'IP tidak diketahui'} · Aktif {formatDate(session.last_activity_at)}</p>
                                            </div>
                                            {!session.is_current && (
                                                <button type="button" onClick={() => revokeSession(session.id)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/20 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/10">
                                                    <Trash2 className="h-3.5 w-3.5" /> Akhiri sesi
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <Pager page={sessionMeta.current_page} pages={sessionMeta.last_page} previous={session_prev_page_token} next={session_next_page_token} />
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/50">
                                <div className="border-b border-slate-800 px-4 py-4 sm:px-5">
                                    <h3 className="font-semibold text-white">Akses aplikasi OAuth</h3>
                                    <p className="mt-1 text-xs text-slate-500">Aplikasi yang masih memiliki izin menggunakan akun SSO ini.</p>
                                </div>
                                <div className="space-y-2 p-3 sm:p-4">
                                    {oauthApplications.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-slate-800 px-4 py-10 text-center text-sm text-slate-500">Tidak ada aplikasi OAuth aktif.</div>
                                    ) : oauthApplications.map((app) => (
                                        <div key={app.id} className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/45 p-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <KeyRound className="h-4 w-4 text-slate-500" />
                                                    <span className="truncate font-medium text-white">{app.client_name}</span>
                                                </div>
                                                <p className="mt-1 text-xs text-slate-500">Diberikan {formatDate(app.created_at)} · Kedaluwarsa {formatDate(app.expires_at)}</p>
                                            </div>
                                            <button type="button" onClick={() => revokeOauthAccess(app.id)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/20 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/10">
                                                <Trash2 className="h-3.5 w-3.5" /> Cabut akses
                                            </button>
                                        </div>
                                    ))}
                                    <Pager page={oauthMeta.current_page} pages={oauthMeta.last_page} previous={oauth_prev_page_token} next={oauth_next_page_token} />
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}
