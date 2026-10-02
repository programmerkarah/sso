import { ArrowRight, LockKeyhole, ShieldCheck, UserPlus } from 'lucide-react';

import { Head, Link } from '@inertiajs/react';

import AppIcon from '@/Components/AppIcon';

export default function Welcome() {
    return (
        <>
            <Head title="SSO" />
            <div className="flex min-h-screen flex-col bg-slate-950 text-white">
                <header className="border-b border-white/10">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
                        <div className="flex items-center gap-3">
                            <AppIcon className="h-9 w-9" />
                            <div>
                                <p className="text-sm font-bold leading-tight">
                                    SSO BPS Kota Sawahlunto
                                </p>
                                <p className="text-xs text-slate-500">
                                    Single Sign-On
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href="/login"
                                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                            >
                                Masuk
                            </Link>
                            <Link
                                href="/register"
                                className="hidden rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 sm:inline-flex"
                            >
                                Daftar
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="flex flex-1 flex-col">
                    <section className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:py-16">
                        <div>
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 text-xs font-semibold text-sky-200">
                                <ShieldCheck className="h-4 w-4" />
                                Akses aplikasi dalam satu akun
                            </div>
                            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                                Pusat akses aplikasi BPS Kota Sawahlunto.
                            </h1>
                            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
                                Gunakan satu identitas untuk masuk ke aplikasi
                                internal yang terhubung dengan SSO. Lebih
                                sederhana untuk pengguna, lebih mudah dikelola
                                oleh administrator.
                            </p>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-500"
                                >
                                    Masuk ke SSO
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href="/register"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    Buat akun
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-2xl shadow-black/20 sm:p-7">
                            <div className="flex items-center justify-between border-b border-white/10 pb-5">
                                <div>
                                    <p className="text-sm font-semibold">
                                        Akses terpusat
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        SSO BPS Kota Sawahlunto
                                    </p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10">
                                    <LockKeyhole className="h-5 w-5 text-sky-300" />
                                </div>
                            </div>
                            <div className="space-y-3 py-5">
                                {[
                                    [
                                        '01',
                                        'Masuk sekali',
                                        'Gunakan akun SSO untuk aplikasi yang telah terintegrasi.',
                                    ],
                                    [
                                        '02',
                                        'Akses sesuai hak pengguna',
                                        'Aplikasi ditampilkan sesuai organisasi dan kewenangan akun.',
                                    ],
                                    [
                                        '03',
                                        'Kelola keamanan',
                                        'Pantau sesi aktif dan gunakan verifikasi dua langkah.',
                                    ],
                                ].map(([number, title, description]) => (
                                    <div
                                        key={number}
                                        className="flex gap-4 rounded-xl border border-white/8 bg-white/[0.025] p-4"
                                    >
                                        <span className="text-xs font-bold text-sky-300">
                                            {number}
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold">
                                                {title}
                                            </p>
                                            <p className="mt-1 text-sm leading-6 text-slate-400">
                                                {description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-white/10 pt-5 text-xs text-slate-500">
                                OAuth2 • 2FA • Single active session
                            </div>
                        </div>
                    </section>

                    <section className="border-y border-white/10 bg-white/[0.025]">
                        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-3">
                            <div>
                                <p className="text-sm font-semibold">
                                    Satu identitas
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    Kurangi akun terpisah dan gunakan identitas
                                    yang sama untuk layanan terhubung.
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold">
                                    Kontrol akses
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    Hak akses aplikasi mengikuti organisasi dan
                                    kewenangan pengguna.
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold">
                                    Keamanan terpadu
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    Pengelolaan 2FA, perangkat, dan sesi
                                    dilakukan dari pusat SSO.
                                </p>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="mx-auto flex w-full max-w-7xl shrink-0 flex-col gap-2 px-5 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                    <span>© 2026 BPS Kota Sawahlunto</span>
                    <span>Single Sign-On untuk aplikasi internal</span>
                </footer>
            </div>
        </>
    );
}
