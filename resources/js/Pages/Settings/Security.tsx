import {
    Key,
    KeyRound,
    LockKeyhole,
    Mail,
    RefreshCw,
    Shield,
    X,
} from 'lucide-react';

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
    twoFactorConfirmed,
    qrCodeSvg,
    recoveryCodes,
}: SecurityProps) {
    const [showingQrCode, setShowingQrCode] = useState(false);
    const [showingRecoveryCodes, setShowingRecoveryCodes] = useState(
        Boolean(recoveryCodes?.length),
    );
    const [showingConfirmation, setShowingConfirmation] = useState(false);

    const { data, setData, processing, errors, reset } = useForm({
        code: '',
    });
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const emailForm = useForm({
        current_password: '',
        email: '',
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

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();
        passwordForm.post('/settings/security/password', {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset(
                    'current_password',
                    'password',
                    'password_confirmation',
                );
            },
        });
    };

    const updateEmail: FormEventHandler = (e) => {
        e.preventDefault();
        emailForm.post('/settings/security/email', {
            preserveScroll: true,
            onSuccess: () => {
                emailForm.reset('current_password');
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Keamanan" />

            <div className="py-12">
                <div className="mx-auto max-w-9xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white drop-shadow-lg sm:text-4xl">
                            Pengaturan Keamanan
                        </h1>
                        <p className="mt-2 text-base text-white/80 sm:text-lg">
                            Kelola autentikasi dua faktor untuk akun Anda
                        </p>
                    </div>

                    <div className="space-y-6">
                        <GlassCard>
                            <div className="flex flex-col items-start gap-4 sm:flex-row">
                                <div className="rounded-full bg-gradient-to-br from-white/20 to-white/5 p-4 backdrop-blur-sm">
                                    <LockKeyhole className="h-8 w-8 text-sky-300" />
                                </div>
                                <div className="flex-1 space-y-5">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">
                                            Ganti Password
                                        </h2>
                                        <p className="mt-2 text-white/80">
                                            Perbarui password akun Anda secara
                                            berkala agar akses tetap aman dan
                                            mudah dikelola.
                                        </p>
                                    </div>

                                    <form
                                        onSubmit={updatePassword}
                                        className="grid gap-4 md:grid-cols-2"
                                    >
                                        <div className="md:col-span-2">
                                            <Label
                                                htmlFor="current_password"
                                                required
                                            >
                                                Password Saat Ini
                                            </Label>
                                            <Input
                                                id="current_password"
                                                type="password"
                                                value={
                                                    passwordForm.data
                                                        .current_password
                                                }
                                                onChange={(e) =>
                                                    passwordForm.setData(
                                                        'current_password',
                                                        e.target.value,
                                                    )
                                                }
                                                error={
                                                    passwordForm.errors
                                                        .current_password
                                                }
                                                autoComplete="current-password"
                                                placeholder="Masukkan password Anda saat ini"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="password" required>
                                                Password Baru
                                            </Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={
                                                    passwordForm.data.password
                                                }
                                                onChange={(e) =>
                                                    passwordForm.setData(
                                                        'password',
                                                        e.target.value,
                                                    )
                                                }
                                                error={
                                                    passwordForm.errors.password
                                                }
                                                autoComplete="new-password"
                                                placeholder="Minimal 8 karakter"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label
                                                htmlFor="password_confirmation"
                                                required
                                            >
                                                Konfirmasi Password Baru
                                            </Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                value={
                                                    passwordForm.data
                                                        .password_confirmation
                                                }
                                                onChange={(e) =>
                                                    passwordForm.setData(
                                                        'password_confirmation',
                                                        e.target.value,
                                                    )
                                                }
                                                error={
                                                    passwordForm.errors
                                                        .password_confirmation
                                                }
                                                autoComplete="new-password"
                                                placeholder="Ketik ulang password baru"
                                                required
                                            />
                                        </div>

                                        <div className="md:col-span-2 flex justify-end">
                                            <Button
                                                type="submit"
                                                disabled={
                                                    passwordForm.processing
                                                }
                                            >
                                                {passwordForm.processing
                                                    ? 'Memperbarui...'
                                                    : 'Simpan Password Baru'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard>
                            <div className="flex flex-col items-start gap-4 sm:flex-row">
                                <div className="rounded-full bg-gradient-to-br from-white/20 to-white/5 p-4 backdrop-blur-sm">
                                    <Mail className="h-8 w-8 text-blue-300" />
                                </div>
                                <div className="flex-1 space-y-5">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">
                                            Ganti Email
                                        </h2>
                                        <p className="mt-2 text-white/80">
                                            Ubah alamat email akun Anda. Setelah
                                            perubahan disimpan, email baru wajib
                                            diverifikasi kembali.
                                        </p>
                                    </div>

                                    <form
                                        onSubmit={updateEmail}
                                        className="grid gap-4 md:grid-cols-2"
                                    >
                                        <div>
                                            <Label htmlFor="email" required>
                                                Email Baru
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={emailForm.data.email}
                                                onChange={(e) =>
                                                    emailForm.setData(
                                                        'email',
                                                        e.target.value,
                                                    )
                                                }
                                                error={emailForm.errors.email}
                                                placeholder="contoh@domain.go.id"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label
                                                htmlFor="email_current_password"
                                                required
                                            >
                                                Password Saat Ini
                                            </Label>
                                            <Input
                                                id="email_current_password"
                                                type="password"
                                                value={
                                                    emailForm.data
                                                        .current_password
                                                }
                                                onChange={(e) =>
                                                    emailForm.setData(
                                                        'current_password',
                                                        e.target.value,
                                                    )
                                                }
                                                error={
                                                    emailForm.errors
                                                        .current_password
                                                }
                                                placeholder="Masukkan password saat ini"
                                                required
                                            />
                                        </div>

                                        <div className="md:col-span-2 flex justify-end">
                                            <Button
                                                type="submit"
                                                disabled={emailForm.processing}
                                            >
                                                {emailForm.processing
                                                    ? 'Memperbarui...'
                                                    : 'Simpan Email Baru'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </GlassCard>

                        {/* 2FA Status Card */}
                        <GlassCard>
                            <div className="flex flex-col items-start gap-4 sm:flex-row">
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
                                            <div className="flex flex-wrap gap-3">
                                                <Button
                                                    onClick={showRecoveryCodes}
                                                    variant="secondary"
                                                    className="w-full sm:w-auto"
                                                >
                                                    <Key className="mr-2 h-4 w-4" />
                                                    Tampilkan Kode Pemulihan
                                                </Button>
                                                <Button
                                                    onClick={
                                                        regenerateRecoveryCodes
                                                    }
                                                    variant="secondary"
                                                    className="w-full sm:w-auto"
                                                >
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    Regenerasi Kode
                                                </Button>
                                                <Button
                                                    onClick={disable2FA}
                                                    variant="danger"
                                                    className="w-full sm:w-auto"
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
                        {showingRecoveryCodes &&
                            recoveryCodes &&
                            recoveryCodes.length > 0 && (
                                <GlassCard>
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white">
                                                Kode Pemulihan
                                            </h3>
                                            <p className="mt-2 text-white/80">
                                                Berikut adalah kode pemulihan
                                                aktif milik akun Anda. Gunakan
                                                hanya saat Anda tidak bisa
                                                mengakses aplikasi autentikator.
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200 backdrop-blur-sm">
                                            <strong>Penting:</strong> Simpan
                                            kode ini di password manager atau
                                            tempat aman lainnya. Setiap kode
                                            hanya bisa dipakai satu kali.
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 rounded-xl bg-black/30 p-6 font-mono text-sm">
                                            {recoveryCodes!.map(
                                                (code, index) => (
                                                    <div
                                                        key={index}
                                                        className="rounded bg-white/10 px-4 py-2 text-center text-white backdrop-blur-sm"
                                                    >
                                                        {code}
                                                    </div>
                                                ),
                                            )}
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
