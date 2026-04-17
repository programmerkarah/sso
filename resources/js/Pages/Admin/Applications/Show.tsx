import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle,
    Copy,
    Edit,
    Eye,
    EyeOff,
    XCircle,
} from 'lucide-react';

import { useState } from 'react';

import { Head, Link } from '@inertiajs/react';

import Button from '@/Components/Button';
import AppLayout from '@/Layouts/AppLayout';
import { Application } from '@/types';

interface ShowProps {
    application: Application;
}

export default function Show({ application }: ShowProps) {
    const [showSecret, setShowSecret] = useState(false);
    const [copied, setCopied] = useState<'id' | 'secret' | null>(null);

    const copyToClipboard = (text: string, type: 'id' | 'secret') => {
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
                            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke daftar
                        </Link>
                        <div className="mt-4 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {application.name}
                                </h1>
                                <p className="mt-2 text-gray-600">
                                    Detail aplikasi dan kredensial OAuth2
                                </p>
                            </div>
                            <Link
                                href={`/admin/applications/${application.id}/edit`}
                            >
                                <Button>
                                    <Edit className="h-4 w-4" />
                                    Edit
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Application Info */}
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">
                                Informasi Aplikasi
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Nama
                                    </label>
                                    <p className="mt-1 text-gray-900">
                                        {application.name}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Slug
                                    </label>
                                    <p className="mt-1 text-gray-900">
                                        {application.slug}
                                    </p>
                                </div>
                                {application.description && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Deskripsi
                                        </label>
                                        <p className="mt-1 text-gray-900">
                                            {application.description}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Domain
                                    </label>
                                    <p className="mt-1 text-gray-900">
                                        {application.domain}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Callback URL
                                    </label>
                                    <p className="mt-1 break-all text-gray-900">
                                        {application.callback_url}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Status
                                    </label>
                                    <div className="mt-1">
                                        {application.is_active ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                <CheckCircle className="h-3 w-3" />
                                                Aktif
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                                <XCircle className="h-3 w-3" />
                                                Nonaktif
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Dibuat
                                    </label>
                                    <p className="mt-1 text-gray-900">
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
                        </div>

                        {/* OAuth Credentials */}
                        <div className="space-y-6">
                            <div className="rounded-lg bg-white p-6 shadow">
                                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                                    Kredensial OAuth2
                                </h2>

                                {application.oauth_client ? (
                                    <>
                                        <div className="mb-4 rounded-lg bg-yellow-50 p-4">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
                                                <div className="text-sm text-yellow-800">
                                                    <p className="font-medium">
                                                        Peringatan Keamanan
                                                    </p>
                                                    <p className="mt-1">
                                                        Simpan Client Secret di
                                                        tempat aman. Jangan
                                                        bagikan kepada siapapun.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">
                                                    Client ID
                                                </label>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={
                                                            application
                                                                .oauth_client.id
                                                        }
                                                        readOnly
                                                        className="flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm"
                                                    />
                                                    <button
                                                        onClick={() =>
                                                            copyToClipboard(
                                                                application
                                                                    .oauth_client!
                                                                    .id,
                                                                'id',
                                                            )
                                                        }
                                                        className="rounded-md bg-gray-100 p-2 transition hover:bg-gray-200"
                                                        title="Copy Client ID"
                                                    >
                                                        {copied === 'id' ? (
                                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <Copy className="h-4 w-4 text-gray-600" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-gray-500">
                                                    Client Secret
                                                </label>
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
                                                        className="flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm"
                                                    />
                                                    <button
                                                        onClick={() =>
                                                            setShowSecret(
                                                                !showSecret,
                                                            )
                                                        }
                                                        className="rounded-md bg-gray-100 p-2 transition hover:bg-gray-200"
                                                        title={
                                                            showSecret
                                                                ? 'Hide'
                                                                : 'Show'
                                                        }
                                                    >
                                                        {showSecret ? (
                                                            <EyeOff className="h-4 w-4 text-gray-600" />
                                                        ) : (
                                                            <Eye className="h-4 w-4 text-gray-600" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            copyToClipboard(
                                                                application
                                                                    .oauth_client!
                                                                    .secret,
                                                                'secret',
                                                            )
                                                        }
                                                        className="rounded-md bg-gray-100 p-2 transition hover:bg-gray-200"
                                                        title="Copy Client Secret"
                                                    >
                                                        {copied === 'secret' ? (
                                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <Copy className="h-4 w-4 text-gray-600" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-sm text-gray-500">
                                        Kredensial OAuth2 belum dibuat
                                    </p>
                                )}
                            </div>

                            {/* Integration Guide */}
                            <div className="rounded-lg bg-white p-6 shadow">
                                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                                    Panduan Integrasi
                                </h2>
                                <div className="rounded-md bg-gray-900 p-4">
                                    <p className="mb-2 text-xs font-medium text-gray-400">
                                        .env
                                    </p>
                                    <pre className="overflow-x-auto text-xs text-gray-100">
                                        <code>
                                            {`SSO_CLIENT_ID=${application.oauth_client?.id || 'your-client-id'}
SSO_CLIENT_SECRET=${application.oauth_client?.secret || 'your-client-secret'}
SSO_REDIRECT_URI=${application.callback_url}
SSO_BASE_URL=http://localhost:8001`}
                                        </code>
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
