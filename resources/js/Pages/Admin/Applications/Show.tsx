import {
    AlertTriangle,
    ArrowLeft,
    BookOpen,
    CheckCircle,
    Copy,
    Edit,
    Eye,
    EyeOff,
    KeyRound,
    RefreshCw,
    XCircle,
} from 'lucide-react';

import { useState } from 'react';

import { Head, Link, router } from '@inertiajs/react';

import Button from '@/Components/Button';
import ConfirmationModal from '@/Components/ConfirmationModal';
import GlassCard from '@/Components/GlassCard';
import PageHeader from '@/Components/PageHeader';
import ScrollArea from '@/Components/ScrollArea';
import ToastViewport, { ToastItem } from '@/Components/ToastViewport';
import AppLayout from '@/Layouts/AppLayout';
import { Application } from '@/types';

interface ShowProps {
    application: Application;
    appUrl: string;
}

export default function Show({ application, appUrl }: ShowProps) {
    const [showSecret, setShowSecret] = useState(false);
    const [copied, setCopied] = useState<'id' | 'secret' | 'env' | null>(null);
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const [showRegenerateModal, setShowRegenerateModal] = useState(false);

    const handleRegenerateSecret = () => {
        setShowRegenerateModal(false);
        router.post(
            `/admin/applications/${application.route_key}/refresh-secret`,
            {},
            { preserveScroll: true },
        );
    };

    const pushCopyToast = (label: string) => {
        const id = `copy-${label}-${Date.now()}`;

        setToasts((current) => [
            ...current,
            {
                id,
                tone: 'success',
                title: 'Tersalin',
                message: `${label} berhasil disalin ke clipboard.`,
            },
        ]);
    };

    const copyToClipboard = async (
        text: string,
        type: 'id' | 'secret' | 'env',
    ) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(type);
            window.setTimeout(() => setCopied(null), 2000);

            if (type === 'id') {
                pushCopyToast('Client ID');
            }

            if (type === 'secret') {
                pushCopyToast('Client Secret');
            }

            if (type === 'env') {
                pushCopyToast('.ENV Example');
            }
        } catch {
            setToasts((current) => [
                ...current,
                {
                    id: `copy-error-${Date.now()}`,
                    tone: 'error',
                    title: 'Gagal Menyalin',
                    message:
                        'Clipboard tidak dapat diakses. Coba salin manual.',
                },
            ]);
        }
    };

    return (
        <AppLayout>
            <Head title={`Detail - ${application.name}`} />
            <ToastViewport
                items={toasts}
                onDismiss={(id) =>
                    setToasts((current) =>
                        current.filter((item) => item.id !== id),
                    )
                }
            />

            <div className="space-y-6">
                <PageHeader
                    title={application.name}
                    description="Detail aplikasi, endpoint, dan kredensial OAuth yang digunakan."
                    actions={
                        <>
                            <Link
                                href="/admin/applications"
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-800 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-[var(--bps-text)]"
                            >
                                <ArrowLeft className="h-4 w-4" /> Daftar
                            </Link>
                            <Link
                                href={`/admin/applications/${application.route_key}/edit`}
                            >
                                <Button>
                                    <Edit className="h-4 w-4" /> Edit
                                </Button>
                            </Link>
                        </>
                    }
                />

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(380px,0.75fr)]">
                    <GlassCard className="p-4 sm:p-6">
                        <h2 className="mb-4 text-lg font-bold text-[var(--bps-text)] sm:text-xl">
                            Informasi Aplikasi
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-[var(--bps-muted)]">
                                    Nama
                                </label>
                                <p className="mt-1 text-[var(--bps-text)]">
                                    {application.name}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-[var(--bps-muted)]">
                                    Slug
                                </label>
                                <p className="mt-1 break-words text-[var(--bps-text)]">
                                    {application.slug}
                                </p>
                            </div>
                            {application.description && (
                                <div>
                                    <label className="text-sm font-medium text-[var(--bps-muted)]">
                                        Deskripsi
                                    </label>
                                    <p className="mt-1 break-words leading-7 text-[var(--bps-text)]">
                                        {application.description}
                                    </p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium text-[var(--bps-muted)]">
                                    Domain
                                </label>
                                <p className="mt-1 break-all text-[var(--bps-text)]">
                                    {application.domain}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-[var(--bps-muted)]">
                                    Callback URL
                                </label>
                                <p className="mt-1 break-all text-[var(--bps-text)]">
                                    {application.callback_url}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-[var(--bps-muted)]">
                                    Status
                                </label>
                                <div className="mt-1">
                                    {application.is_active ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-xs font-medium text-emerald-100">
                                            <CheckCircle className="h-3 w-3" />
                                            Aktif
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-red-400/20 px-2.5 py-0.5 text-xs font-medium text-red-100">
                                            <XCircle className="h-3 w-3" />
                                            Nonaktif
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-[var(--bps-muted)]">
                                    Tipe Organisasi Diizinkan
                                </label>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {application.allowed_organization_types
                                        ?.length ? (
                                        application.allowed_organization_types.map(
                                            (type) => (
                                                <span
                                                    key={type}
                                                    className="inline-flex rounded-full border border-[#b8d9ee] bg-[#eaf4fb] px-2.5 py-1 text-xs font-semibold text-[#347fae]"
                                                >
                                                    {type}
                                                </span>
                                            ),
                                        )
                                    ) : (
                                        <span className="inline-flex rounded-full border border-[var(--bps-border)] bg-[var(--bps-surface-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--bps-muted)]">
                                            Semua tipe organisasi
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-[var(--bps-muted)]">
                                    Dibuat
                                </label>
                                <p className="mt-1 text-[var(--bps-text)]">
                                    {new Date(
                                        application.created_at,
                                    ).toLocaleString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        </div>
                    </GlassCard>

                    <div className="space-y-6">
                        <GlassCard className="p-4 sm:p-6">
                            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-[var(--bps-text)] sm:text-xl">
                                        Kredensial OAuth2
                                    </h2>
                                    <p className="mt-1 text-sm text-[var(--bps-muted)]">
                                        Simpan kredensial ini hanya di server
                                        aplikasi tujuan.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowRegenerateModal(true)}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--bps-border)] bg-[var(--bps-surface-soft)] px-3 py-2 text-xs font-semibold text-[var(--bps-text)] transition hover:bg-slate-800 sm:w-auto"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Regenerasi Secret
                                </button>
                            </div>

                            <div className="theme-warning mb-4 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 flex-shrink-0 text-current" />
                                    <div className="text-sm text-current">
                                        <p className="font-semibold">
                                            Simpan di tempat aman
                                        </p>
                                        <p className="mt-1 leading-6 text-current opacity-90">
                                            Client secret hanya boleh dipakai
                                            oleh aplikasi Anda. Jangan dibagikan
                                            di chat, screenshot, atau
                                            repository.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {application.oauth_client ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-[var(--bps-muted)]">
                                            Client ID
                                        </label>
                                        <div className="mt-1 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                                            <input
                                                type="text"
                                                value={
                                                    application.oauth_client.id
                                                }
                                                readOnly
                                                className="min-w-0 flex-1 rounded-xl border border-slate-800 bg-[var(--bps-surface-soft)] px-4 py-3 text-sm text-[var(--bps-text)]"
                                            />
                                            <div className="flex items-center gap-2 self-end sm:self-auto">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        copyToClipboard(
                                                            application
                                                                .oauth_client!
                                                                .id,
                                                            'id',
                                                        )
                                                    }
                                                    className="rounded-xl border border-[var(--bps-border)] bg-[var(--bps-surface-soft)] p-3 text-[var(--bps-text)] transition hover:brightness-95"
                                                    title="Copy Client ID"
                                                >
                                                    {copied === 'id' ? (
                                                        <CheckCircle className="h-4 w-4 text-emerald-300" />
                                                    ) : (
                                                        <Copy className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-[var(--bps-muted)]">
                                            Client Secret
                                        </label>
                                        {application.oauth_client.secret ? (
                                            <div className="mt-1 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                                                <input
                                                    type={
                                                        showSecret
                                                            ? 'text'
                                                            : 'password'
                                                    }
                                                    value={
                                                        application.oauth_client
                                                            .secret
                                                    }
                                                    readOnly
                                                    className="min-w-0 flex-1 rounded-xl border border-slate-800 bg-[var(--bps-surface-soft)] px-4 py-3 text-sm text-[var(--bps-text)]"
                                                />
                                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setShowSecret(
                                                                !showSecret,
                                                            )
                                                        }
                                                        className="rounded-xl border border-[var(--bps-border)] bg-[var(--bps-surface-soft)] p-3 text-[var(--bps-text)] transition hover:brightness-95"
                                                    >
                                                        {showSecret ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            copyToClipboard(
                                                                application
                                                                    .oauth_client!
                                                                    .secret!,
                                                                'secret',
                                                            )
                                                        }
                                                        className="rounded-xl border border-[var(--bps-border)] bg-[var(--bps-surface-soft)] p-3 text-[var(--bps-text)] transition hover:brightness-95"
                                                    >
                                                        {copied === 'secret' ? (
                                                            <CheckCircle className="h-4 w-4 text-emerald-300" />
                                                        ) : (
                                                            <Copy className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mt-2 rounded-xl border border-[var(--bps-border)] bg-[var(--bps-surface-soft)] p-4 text-sm text-[var(--bps-muted)]">
                                                Secret lama tidak bisa
                                                ditampilkan ulang karena
                                                disimpan secara aman. Gunakan
                                                tombol regenerasi di atas untuk
                                                membuat secret baru yang bisa
                                                langsung disalin.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-[var(--bps-muted)]">
                                    Kredensial OAuth2 belum dibuat.
                                </p>
                            )}
                        </GlassCard>

                        <GlassCard className="p-4 sm:p-6">
                            <h2 className="mb-4 text-lg font-bold text-[var(--bps-text)] sm:text-xl">
                                Panduan Integrasi
                            </h2>
                            <div className="rounded-xl bg-black/40 p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--bps-text)]/40">
                                        .ENV EXAMPLE
                                    </p>
                                    <button
                                        onClick={() =>
                                            copyToClipboard(
                                                `SSO_CLIENT_ID=${application.oauth_client?.id || 'your-client-id'}\nSSO_CLIENT_SECRET=${application.oauth_client?.secret || 'regenerate-secret-first'}\nSSO_REDIRECT_URI=${application.callback_url}\nSSO_REGISTER_URL=${appUrl}/register\nSSO_BASE_URL=${appUrl}\nSSO_USER_ENDPOINT=/api/user`,
                                                'env',
                                            )
                                        }
                                        className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-[var(--bps-muted)] transition hover:bg-slate-800 hover:text-[var(--bps-text)]"
                                    >
                                        <Copy className="h-3.5 w-3.5" />
                                        {copied === 'env'
                                            ? 'Tersalin!'
                                            : 'Salin'}
                                    </button>
                                </div>
                                <ScrollArea
                                    axis="horizontal"
                                    viewportClassName="pb-2"
                                >
                                    <pre className="whitespace-pre-wrap break-all text-xs leading-6 text-[var(--bps-text)]/90">
                                        <code>
                                            {`SSO_CLIENT_ID=${application.oauth_client?.id || 'your-client-id'}\nSSO_CLIENT_SECRET=${application.oauth_client?.secret || 'regenerate-secret-first'}\nSSO_REDIRECT_URI=${application.callback_url}\nSSO_REGISTER_URL=${appUrl}/register\nSSO_BASE_URL=${appUrl}\nSSO_USER_ENDPOINT=/api/user`}
                                        </code>
                                    </pre>
                                </ScrollArea>
                            </div>

                            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-sm leading-7 text-[var(--bps-muted)]">
                                <p>
                                    Kalau secret belum tersedia, lakukan
                                    regenerasi sekali lalu simpan di server
                                    aplikasi tujuan. Setelah itu jangan
                                    tampilkan lagi ke pengguna umum.
                                </p>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-4 sm:p-6">
                            <div className="flex items-start gap-3">
                                <div className="rounded-full bg-blue-400/15 p-3">
                                    <KeyRound className="h-5 w-5 text-[#347fae]" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-[var(--bps-text)]">
                                        Panduan Penggunaan Singkat
                                    </h2>
                                    <p className="mt-2 text-sm leading-7 text-[var(--bps-muted)]">
                                        Gunakan halaman ini untuk validasi
                                        callback URL, menyalin kredensial, dan
                                        mengecek pembatasan tipe organisasi
                                        aplikasi.
                                    </p>
                                    <p className="mt-2 text-xs text-[var(--bps-text)]/60">
                                        Tipe organisasi diizinkan:{' '}
                                        {application.allowed_organization_types
                                            ?.length
                                            ? application.allowed_organization_types.join(
                                                  ', ',
                                              )
                                            : 'Semua tipe'}
                                    </p>
                                    <Link
                                        href={`/admin/applications/${application.route_key}/guide`}
                                        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[var(--bps-border)] bg-[var(--bps-surface-soft)] px-3 py-2 text-xs font-semibold text-[var(--bps-text)] transition hover:bg-slate-800"
                                    >
                                        <BookOpen className="h-4 w-4" />
                                        Lihat Panduan Integrasi Lengkap
                                    </Link>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={showRegenerateModal}
                title="Regenerasi Client Secret"
                description={`Client secret untuk aplikasi "${application.name}" akan diganti dengan yang baru. Secret lama akan langsung tidak berlaku dan integrasi yang menggunakannya akan gagal sampai diperbarui.`}
                confirmLabel="Ya, Regenerasi Secret"
                confirmVariant="amber"
                onCancel={() => setShowRegenerateModal(false)}
                onConfirm={handleRegenerateSecret}
            />
        </AppLayout>
    );
}
