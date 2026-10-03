import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight, Link2, UserPlus } from 'lucide-react';

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
                    <h2 className="text-xl font-semibold tracking-tight text-[#18324a] sm:text-2xl">
                        Lanjutkan dengan Google
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#6f8495]">
                        Akun Google ini belum terhubung ke akun SSO.
                    </p>
                </div>

                <div className="rounded-xl border border-[#dbe5ec] bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                    <p className="text-sm font-semibold text-[#18324a] dark:text-slate-100">
                        {google.name}
                    </p>
                    <p className="mt-1 text-sm text-[#6f8495] dark:text-slate-400">
                        {google.email}
                    </p>
                    {existingEmailAccount && (
                        <p className="mt-3 text-xs leading-5 text-amber-700 dark:text-amber-300">
                            Kami menemukan akun SSO dengan email yang sama.
                            Anda dapat menghubungkan Google sebagai metode login
                            tambahan, atau tetap masuk menggunakan akun lokal
                            tanpa menghubungkannya.
                        </p>
                    )}
                </div>

                <div className="grid gap-3">
                    {existingEmailAccount ? (
                        <>
                            <button
                                type="button"
                                onClick={linkExisting}
                                className="inline-flex items-center justify-between rounded-xl bg-sky-600 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-sky-500"
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
                                className="inline-flex items-center justify-between rounded-xl border border-[#d5e1e9] bg-white px-4 py-3 text-left text-sm font-semibold text-[#29465f] transition hover:bg-[#eef5f9] dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-800"
                            >
                                <span>Login menggunakan akun lokal</span>
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/auth/google/register"
                                className="inline-flex items-center justify-between rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <UserPlus className="h-4 w-4" />
                                    Lanjutkan pendaftaran
                                </span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>

                            <button
                                type="button"
                                onClick={linkExisting}
                                className="inline-flex items-center justify-between rounded-xl border border-[#d5e1e9] bg-white px-4 py-3 text-left text-sm font-semibold text-[#29465f] transition hover:bg-[#eef5f9] dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-800"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <Link2 className="h-4 w-4" />
                                    Saya sudah punya akun SSO
                                </span>
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </>
                    )}
                </div>

                <p className="text-xs leading-5 text-[#8799a7]">
                    {existingEmailAccount
                        ? 'Menghubungkan Google bersifat opsional. Login lokal tetap dapat digunakan seperti biasa.'
                        : 'Untuk menghubungkan Google ke akun existing, email Google harus sama dengan email yang terdaftar di akun SSO.'}
                </p>
            </div>
        </GuestLayout>
    );
}
