import { Key, KeyRound, RefreshCw, Shield, X } from 'lucide-react';

import { FormEventHandler, useEffect, useState } from 'react';

import { Head, router, useForm } from '@inertiajs/react';

import Button from '@/Components/Button';
import GlassCard from '@/Components/GlassCard';
import Input from '@/Components/Input';
import Label from '@/Components/Label';
import AppLayout from '@/Layouts/AppLayout';
import { PageProps } from '@/types';

interface SecurityProps extends PageProps {
    twoFactorEnabled: boolean;
    twoFactorConfirmed: boolean;
    qrCodeSvg?: string;
    recoveryCodes?: string[];
}

export default function Security({
    auth,
    twoFactorEnabled,
    twoFactorConfirmed,
    qrCodeSvg,
    recoveryCodes,
}: SecurityProps) {
    const [showingQrCode, setShowingQrCode] = useState(false);
    const [showingRecoveryCodes, setShowingRecoveryCodes] = useState(
        Boolean(recoveryCodes?.length),
    );
    const [showingConfirmation, setShowingConfirmation] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
    });

    useEffect(() => {
        setShowingRecoveryCodes(Boolean(recoveryCodes?.length));
    }, [recoveryCodes]);

    const enable2FA = () => {
        router.post(
            '/user/two-factor-authentication',
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowingQrCode(true);
                    setShowingConfirmation(true);
                },
            },
        );
    };

    const confirmTwoFactor: FormEventHandler = (e) => {
        e.preventDefault();
        router.post('/user/confirmed-two-factor-authentication', data, {
            preserveScroll: true,
            onSuccess: () => {
                setShowingConfirmation(false);
                reset('code');
                router.get('/settings/security/recovery-codes', undefined, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setShowingRecoveryCodes(true);
                    },
                });
            },
            onError: () => {
                reset('code');
            },
        });
    };

    const regenerateRecoveryCodes = () => {
        router.post(
            '/settings/security/recovery-codes/regenerate',
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowingRecoveryCodes(true);
                },
            },
        );
    };

    const disable2FA = () => {
        if (
            confirm(
                'Apakah Anda yakin ingin menonaktifkan autentikasi dua faktor?',
            )
        ) {
            router.delete('/user/two-factor-authentication', {
                preserveScroll: true,
                onSuccess: () => {
                    setShowingQrCode(false);
                    setShowingRecoveryCodes(false);
                    setShowingConfirmation(false);
                },
            });
        }
    };

    const showRecoveryCodes = () => {
        router.get('/settings/security/recovery-codes', undefined, {
            preserveScroll: true,
            onSuccess: () => {
                setShowingRecoveryCodes(true);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Keamanan" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                            Pengaturan Keamanan
                        </h1>
                        <p className="mt-2 text-lg text-white/80">
                            Kelola autentikasi dua faktor untuk akun Anda
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* 2FA Status Card */}
                        <GlassCard>
                            <div className="flex items-start gap-4">
                                <div className="rounded-full bg-gradient-to-br from-white/20 to-white/5 p-4 backdrop-blur-sm">
                                    <Shield
                                        className={`h-8 w-8 ${
                                            twoFactorConfirmed
                                                ? 'text-green-400'
                                                : 'text-yellow-400'
                                        }`}
                                    />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-white">
                                        Autentikasi Dua Faktor (2FA)
                                    </h2>
                                    <p className="mt-2 text-white/80">
                                        {twoFactorConfirmed
                                            ? 'Autentikasi dua faktor aktif dan melindungi akun Anda.'
                                            : 'Tambahkan keamanan ekstra ke akun Anda dengan mengaktifkan autentikasi dua faktor.'}
                                    </p>

                                    <div className="mt-4">
                                        {twoFactorConfirmed ? (
                                            <div className="flex gap-3">
                                                <Button
                                                    onClick={showRecoveryCodes}
                                                    variant="secondary"
                                                >
                                                    <Key className="mr-2 h-4 w-4" />
                                                    Tampilkan Kode Pemulihan
                                                </Button>
                                                <Button
                                                    onClick={
                                                        regenerateRecoveryCodes
                                                    }
                                                    variant="secondary"
                                                >
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    Regenerasi Kode
                                                </Button>
                                                <Button
                                                    onClick={disable2FA}
                                                    variant="danger"
                                                >
                                                    <X className="mr-2 h-4 w-4" />
                                                    Nonaktifkan 2FA
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button onClick={enable2FA}>
                                                <KeyRound className="mr-2 h-4 w-4" />
                                                Aktifkan 2FA
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        {/* QR Code Card */}
                        {showingQrCode && qrCodeSvg && (
                            <GlassCard>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">
                                            Scan QR Code
                                        </h3>
                                        <p className="mt-2 text-white/80">
                                            Scan kode QR berikut menggunakan
                                            aplikasi autentikator seperti Google
                                            Authenticator atau Authy.
                                        </p>
                                    </div>

                                    <div
                                        className="flex justify-center rounded-xl bg-white p-6"
                                        dangerouslySetInnerHTML={{
                                            __html: qrCodeSvg,
                                        }}
                                    />

                                    {showingConfirmation && (
                                        <form
                                            onSubmit={confirmTwoFactor}
                                            className="space-y-4"
                                        >
                                            <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-sm text-yellow-200 backdrop-blur-sm">
                                                Setelah scan QR code, masukkan
                                                kode 6 digit dari aplikasi
                                                autentikator Anda untuk
                                                mengonfirmasi setup.
                                            </div>

                                            <div>
                                                <Label htmlFor="code" required>
                                                    Kode Verifikasi
                                                </Label>
                                                <Input
                                                    id="code"
                                                    type="text"
                                                    value={data.code}
                                                    onChange={(e) =>
                                                        setData(
                                                            'code',
                                                            e.target.value,
                                                        )
                                                    }
                                                    error={errors.code}
                                                    placeholder="123456"
                                                    maxLength={6}
                                                    autoFocus
                                                    required
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="w-full"
                                            >
                                                {processing
                                                    ? 'Memverifikasi...'
                                                    : 'Konfirmasi & Aktifkan 2FA'}
                                            </Button>
                                        </form>
                                    )}
                                </div>
                            </GlassCard>
                        )}

                        {/* Recovery Codes Card */}
                        {showingRecoveryCodes && recoveryCodes.length > 0 && (
                            <GlassCard>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">
                                            Kode Pemulihan
                                        </h3>
                                        <p className="mt-2 text-white/80">
                                            Berikut adalah kode pemulihan aktif
                                            milik akun Anda. Gunakan hanya saat
                                            Anda tidak bisa mengakses aplikasi
                                            autentikator.
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200 backdrop-blur-sm">
                                        <strong>Penting:</strong> Simpan kode
                                        ini di password manager atau tempat
                                        aman lainnya. Setiap kode hanya bisa
                                        dipakai satu kali.
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 rounded-xl bg-black/30 p-6 font-mono text-sm">
                                        {recoveryCodes.map((code, index) => (
                                            <div
                                                key={index}
                                                className="rounded bg-white/10 px-4 py-2 text-center text-white backdrop-blur-sm"
                                            >
                                                {code}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </GlassCard>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
