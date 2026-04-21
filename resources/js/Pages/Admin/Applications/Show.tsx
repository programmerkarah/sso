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
import GlassCard from '@/Components/GlassCard';
import AppLayout from '@/Layouts/AppLayout';
import { Application } from '@/types';

interface ShowProps {
    application: Application;
    appUrl: string;
}

export default function Show({ application, appUrl }: ShowProps) {
    const [showSecret, setShowSecret] = useState(false);
    const [copied, setCopied] = useState<'id' | 'secret' | 'env' | null>(null);

    const copyToClipboard = (text: string, type: 'id' | 'secret' | 'env') => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <AppLayout>
            <Head title={`Detail - ${application.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link
                            href="/admin/applications"
                            className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-xl transition hover:bg-white/20"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke daftar
                        </Link>
                        <div className="mt-4 flex items-center justify-between">
                            <div>
                                <h1 className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-4xl font-black text-transparent drop-shadow-xl sm:text-5xl">
                                    {application.name}
                                </h1>
                                <p className="mt-2 text-white/80">
                                    Detail aplikasi, callback URL, dan
                                    kredensial OAuth yang sedang dipakai.
                                </p>
                            </div>
                            <Link
                                href={`/admin/applications/${application.route_key}/edit`}
                            >
                                <Button>
                                    <Edit className="h-4 w-4" />
                                    Edit
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                        <GlassCard>
                            <h2 className="mb-4 text-xl font-bold text-white">
                                Informasi Aplikasi
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-white/55">
                                        Nama
                                    </label>
                                    <p className="mt-1 text-white">
                                        {application.name}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-white/55">
                                        Slug
                                    </label>
                                    <p className="mt-1 text-white">
                                        {application.slug}
                                    </p>
                                </div>
                                {application.description && (
                                    <div>
                                        <label className="text-sm font-medium text-white/55">
                                            Deskripsi
                                        </label>
                                        <p className="mt-1 leading-7 text-white/85">
                                            {application.description}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm font-medium text-white/55">
                                        Domain
                                    </label>
                                    <p className="mt-1 text-white">
                                        {application.domain}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-white/55">
                                        Callback URL
                                    </label>
                                    <p className="mt-1 break-all text-white">
                                        {application.callback_url}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-white/55">
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
                                    <label className="text-sm font-medium text-white/55">
                                        Dibuat
                                    </label>
                                    <p className="mt-1 text-white/85">
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
                            <GlassCard>
                                <div className="mb-4 flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-white">
                                            Kredensial OAuth2
                                        </h2>
                                        <p className="mt-1 text-sm text-white/65">
                                            Simpan kredensial ini hanya di
                                            server aplikasi tujuan.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            router.post(
                                                `/admin/applications/${application.route_key}/refresh-secret`,
                                                {},
                                                {
                                                    preserveScroll: true,
                                                },
                                            )
                                        }
                                        className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Regenerasi Secret
                                    </button>
                                </div>

                                <div className="mb-4 rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-yellow-300" />
                                        <div className="text-sm text-yellow-100">
                                            <p className="font-semibold">
                                                Simpan di tempat aman
                                            </p>
                                            <p className="mt-1 leading-6 text-yellow-100/85">
                                                Client secret hanya boleh
                                                dipakai oleh aplikasi Anda.
                                                Jangan dibagikan di chat,
                                                screenshot, atau repository.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {application.oauth_client ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-white/55">
                                                Client ID
                                            </label>
                                            <div className="mt-1 flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={
                                                        application.oauth_client
                                                            .id
                                                    }
                                                    readOnly
                                                    className="flex-1 rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-sm text-white"
                                                />
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
                                                    className="rounded-xl bg-white/10 p-3 text-white transition hover:bg-white/20"
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

                                        <div>
                                            <label className="text-sm font-medium text-white/55">
                                                Client Secret
                                            </label>
                                            {application.oauth_client.secret ? (
                                                <div className="mt-1 flex items-center gap-2">
                                                    <input
                                                        type={
                                                            showSecret
                                                                ? 'text'
                                                                : 'password'
                                                        }
                                                        value={
                                                            application
                                                                .oauth_client
                                                                .secret
                                                        }
                                                        readOnly
                                                        className="flex-1 rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-sm text-white"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setShowSecret(
                                                                !showSecret,
                                                            )
                                                        }
                                                        className="rounded-xl bg-white/10 p-3 text-white transition hover:bg-white/20"
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
                                                        className="rounded-xl bg-white/10 p-3 text-white transition hover:bg-white/20"
                                                    >
                                                        {copied === 'secret' ? (
                                                            <CheckCircle className="h-4 w-4 text-emerald-300" />
                                                        ) : (
                                                            <Copy className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="mt-2 rounded-xl border border-white/15 bg-white/5 p-4 text-sm text-white/70">
                                                    Secret lama tidak bisa
                                                    ditampilkan ulang karena
                                                    disimpan secara aman.
                                                    Gunakan tombol regenerasi di
                                                    atas untuk membuat secret
                                                    baru yang bisa langsung
                                                    disalin.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-white/55">
                                        Kredensial OAuth2 belum dibuat.
                                    </p>
                                )}
                            </GlassCard>

                            <GlassCard>
                                <h2 className="mb-4 text-xl font-bold text-white">
                                    Panduan Integrasi
                                </h2>
                                <div className="rounded-xl bg-black/40 p-4">
                                    <div className="mb-2 flex items-center justify-between">
                                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
                                            .ENV EXAMPLE
                                        </p>
                                        <button
                                            onClick={() =>
                                                copyToClipboard(
                                                    `SSO_CLIENT_ID=${application.oauth_client?.id || 'your-client-id'}\nSSO_CLIENT_SECRET=${application.oauth_client?.secret || 'regenerate-secret-first'}\nSSO_REDIRECT_URI=${application.callback_url}\nSSO_REGISTER_URL=${appUrl}/register\nSSO_BASE_URL=${appUrl}\nSSO_USER_ENDPOINT=/api/user`,
                                                    'env',
                                                )
                                            }
                                            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/20 hover:text-white"
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                            {copied === 'env'
                                                ? 'Tersalin!'
                                                : 'Salin'}
                                        </button>
                                    </div>
                                    <pre className="overflow-x-auto text-xs leading-6 text-white/90">
                                        <code>
                                            {`SSO_CLIENT_ID=${application.oauth_client?.id || 'your-client-id'}\nSSO_CLIENT_SECRET=${application.oauth_client?.secret || 'regenerate-secret-first'}\nSSO_REDIRECT_URI=${application.callback_url}\nSSO_REGISTER_URL=${appUrl}/register\nSSO_BASE_URL=${appUrl}\nSSO_USER_ENDPOINT=/api/user`}
                                        </code>
                                    </pre>
                                </div>

                                <div className="mt-4 rounded-xl border border-white/15 bg-white/5 p-4 text-sm leading-7 text-white/70">
                                    <p>
                                        Kalau secret belum tersedia, lakukan
                                        regenerasi sekali lalu simpan di server
                                        aplikasi tujuan. Setelah itu jangan
                                        tampilkan lagi ke pengguna umum.
                                    </p>
                                </div>
                            </GlassCard>

                            <GlassCard>
                                <div className="flex items-start gap-3">
                                    <div className="rounded-full bg-blue-400/15 p-3">
                                        <KeyRound className="h-5 w-5 text-blue-100" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">
                                            Panduan Penggunaan Singkat
                                        </h2>
                                        <p className="mt-2 text-sm leading-7 text-white/70">
                                            Gunakan halaman ini untuk validasi
                                            callback URL, menyalin kredensial,
                                            dan mengecek pembatasan tipe
                                            organisasi aplikasi.
                                        </p>
                                        <p className="mt-2 text-xs text-white/60">
                                            Tipe organisasi diizinkan:{' '}
                                            {application
                                                .allowed_organization_types
                                                ?.length
                                                ? application.allowed_organization_types.join(
                                                      ', ',
                                                  )
                                                : 'Semua tipe'}
                                        </p>
                                        <Link
                                            href={`/admin/applications/${application.route_key}/guide`}
                                            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
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
            </div>
        </AppLayout>
    );
}
