import { Head, router } from '@inertiajs/react';
import { ArrowRight, Link2, LogIn, UserPlus } from 'lucide-react';

import GuestLayout from '@/Layouts/GuestLayout';

interface GoogleContinueProps {
    google: {
        name: string;
        email: string;
    };
    existingEmailAccount: boolean;
}

export default function GoogleContinue({
    google,
    existingEmailAccount,
}: GoogleContinueProps) {
    const linkExisting = () => {
        router.post('/auth/google/use-existing');
    };

    const loginLocal = () => {
        router.post('/auth/google/login-local');
    };

    return (
        <GuestLayout>
            <Head title="Lanjutkan dengan Google" />

            <div className="space-y-5">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight text-[var(--bps-text)] sm:text-2xl">
                        Lanjutkan dengan Google
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--bps-muted)]">
                        {existingEmailAccount
                            ? 'Kami menemukan akun SSO dengan email yang sama.'
                            : 'Akun Google ini belum terdaftar di SSO.'}
                    </p>
                </div>

                <div className="ui-surface-soft rounded-xl border p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--bps-muted)]">
                        Email Google
                    </p>
                    <p className="mt-1 break-all text-sm font-semibold text-[var(--bps-text)]">
                        {google.email}
                    </p>

                    {existingEmailAccount && (
                        <p className="mt-3 text-xs leading-5 text-[var(--bps-muted)]">
                            Google dapat dihubungkan sebagai metode login tambahan,
                            atau Anda tetap dapat masuk menggunakan akun lokal.
                        </p>
                    )}
                </div>

                <div className="grid gap-3">
                    {existingEmailAccount ? (
                        <>
                            <button
                                type="button"
                                onClick={linkExisting}
                                className="inline-flex items-center justify-between rounded-xl bg-[var(--bps-blue-strong)] px-4 py-3 text-left text-sm font-semibold text-white transition hover:brightness-95"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <Link2 className="h-4 w-4" />
                                    Hubungkan ke Google
                                </span>
                                <ArrowRight className="h-4 w-4" />
                            </button>

                            <button
                                type="button"
                                onClick={loginLocal}
                                className="ui-surface ui-hover inline-flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <LogIn className="h-4 w-4" />
                                    Login menggunakan akun lokal
                                </span>
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </>
                    ) : (
                        <>
                            <a
                                href="/auth/google/register"
                                className="inline-flex items-center justify-between rounded-xl bg-[var(--bps-blue-strong)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-95"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <UserPlus className="h-4 w-4" />
                                    Lanjutkan pendaftaran
                                </span>
                                <ArrowRight className="h-4 w-4" />
                            </a>

                            <button
                                type="button"
                                onClick={loginLocal}
                                className="ui-surface ui-hover inline-flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <LogIn className="h-4 w-4" />
                                    Sudah punya akun SSO? Lanjutkan dengan akun SSO
                                </span>
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </>
                    )}
                </div>

                <p className="text-xs leading-5 text-[var(--bps-muted)]">
                    {existingEmailAccount
                        ? 'Menghubungkan Google bersifat opsional. Login lokal tetap dapat digunakan seperti biasa.'
                        : 'Pendaftaran Google tetap mengikuti verifikasi email, verifikasi administrator, dan setup 2FA.'}
                </p>
            </div>
        </GuestLayout>
    );
}
