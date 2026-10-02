import { ArrowRight, LockKeyhole, ShieldCheck, UserPlus } from 'lucide-react';

import { Head, Link } from '@inertiajs/react';

import AppIcon from '@/Components/AppIcon';
import ScrollArea from '@/Components/ScrollArea';
import ThemeToggle from '@/Components/ThemeToggle';

export default function Welcome() {
    return (
        <>
            <Head title="SSO" />
            <div className="app-background grid h-dvh grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden text-[#18324a]">
                <header className="app-header-background shrink-0 border-b border-[#dbe5ec]">
                    <div className="mx-auto flex max-w-[1680px] items-center justify-between px-5 py-4 sm:px-8">
                        <div className="flex items-center gap-3">
                            <AppIcon className="h-9 w-9" />
                            <div>
                                <p className="text-sm font-bold leading-tight text-[#18324a]">
                                    SSO BPS Kota Sawahlunto
                                </p>
                                <p className="text-xs text-[#7d909f]">
                                    Single Sign-On
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <ThemeToggle compact />
                            <Link
                                href="/login"
                                className="rounded-lg px-4 py-2 text-sm font-semibold text-[#49657b] transition hover:bg-[#eaf2f7] hover:text-[#18324a]"
                            >
                                Masuk
                            </Link>
                            <Link
                                href="/register"
                                className="hidden rounded-lg border border-[#d5e1e9] bg-white px-4 py-2 text-sm font-semibold text-[#29465f] transition hover:bg-[#eef5f9] sm:inline-flex"
                            >
                                Daftar
                            </Link>
                        </div>
                    </div>
                </header>

                <ScrollArea className="min-h-0" contentClassName="min-h-full">
                    <main className="flex min-h-full flex-col">
                        <section className="mx-auto grid w-full max-w-[1680px] flex-1 items-center gap-12 px-5 py-10 sm:px-8 sm:py-12 lg:grid-cols-[1.08fr_0.92fr] lg:py-10">
                            <div>
                                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#b8d9ee] bg-[#e7f3fb] px-3 py-1.5 text-xs font-semibold text-[#347fae]">
                                    <ShieldCheck className="h-4 w-4" />
                                    Akses aplikasi dalam satu akun
                                </div>
                                <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-[#18324a] sm:text-5xl lg:text-6xl">
                                    Pusat akses aplikasi BPS Kota Sawahlunto.
                                </h1>
                                <p className="mt-6 max-w-2xl text-base leading-7 text-[#6f8495] sm:text-lg">
                                    Gunakan satu identitas untuk masuk ke
                                    aplikasi internal yang terhubung dengan SSO.
                                    Lebih sederhana untuk pengguna, lebih mudah
                                    dikelola oleh administrator.
                                </p>
                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5aaee8] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4aa3de]"
                                    >
                                        Masuk ke SSO
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d5e1e9] bg-white px-5 py-3 text-sm font-semibold text-[#29465f] transition hover:bg-[#eef5f9]"
                                    >
                                        <UserPlus className="h-4 w-4" />
                                        Buat akun
                                    </Link>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-[#d7e5ed] bg-white/90 p-5 shadow-[0_18px_40px_rgba(67,96,116,0.08)] sm:p-7">
                                <div className="flex items-center justify-between border-b border-[#e2ebf1] pb-5">
                                    <div>
                                        <p className="text-sm font-semibold text-[#18324a]">
                                            Akses terpusat
                                        </p>
                                        <p className="mt-1 text-xs text-[#8799a7]">
                                            SSO BPS Kota Sawahlunto
                                        </p>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f3fb]">
                                        <LockKeyhole className="h-5 w-5 text-[#4a9fd7]" />
                                    </div>
                                </div>
                                <div className="space-y-3 py-5">
                                    {[
                                        [
                                            '01',
                                            'Masuk sekali',
                                            'Gunakan akun SSO untuk aplikasi yang telah terintegrasi.',
                                            'bg-[#eaf4fb]',
                                        ],
                                        [
                                            '02',
                                            'Akses sesuai hak pengguna',
                                            'Aplikasi ditampilkan sesuai organisasi dan kewenangan akun.',
                                            'bg-[#eef7ec]',
                                        ],
                                        [
                                            '03',
                                            'Kelola keamanan',
                                            'Pantau sesi aktif dan gunakan verifikasi dua langkah.',
                                            'bg-[#fff4e8]',
                                        ],
                                    ].map(
                                        ([
                                            number,
                                            title,
                                            description,
                                            tone,
                                        ]) => (
                                            <div
                                                key={number}
                                                className={`flex gap-4 rounded-xl border border-[#e1eaf0] ${tone} p-4`}
                                            >
                                                <span className="text-xs font-bold text-[#4a9fd7]">
                                                    {number}
                                                </span>
                                                <div>
                                                    <p className="text-sm font-semibold text-[#18324a]">
                                                        {title}
                                                    </p>
                                                    <p className="mt-1 text-sm leading-6 text-[#6f8495]">
                                                        {description}
                                                    </p>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                                <div className="border-t border-[#e2ebf1] pt-5 text-xs text-[#8799a7]">
                                    OAuth2 • 2FA • Single active session
                                </div>
                            </div>
                        </section>

                        <section className="border-t border-[#dbe5ec] bg-white/55">
                            <div className="mx-auto grid max-w-[1680px] gap-8 px-5 py-8 sm:px-8 md:grid-cols-3">
                                {[
                                    [
                                        'Satu identitas',
                                        'Kurangi akun terpisah dan gunakan identitas yang sama untuk layanan terhubung.',
                                        'bg-[#eaf4fb]',
                                    ],
                                    [
                                        'Kontrol akses',
                                        'Hak akses aplikasi mengikuti organisasi dan kewenangan pengguna.',
                                        'bg-[#eef7ec]',
                                    ],
                                    [
                                        'Keamanan terpadu',
                                        'Pengelolaan 2FA, perangkat, dan sesi dilakukan dari pusat SSO.',
                                        'bg-[#fff4e8]',
                                    ],
                                ].map(([title, text, tone]) => (
                                    <div
                                        key={title}
                                        className={`rounded-2xl ${tone} px-5 py-4`}
                                    >
                                        <p className="text-sm font-semibold text-[#18324a]">
                                            {title}
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-[#6f8495]">
                                            {text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </main>
                </ScrollArea>

                <footer className="border-t border-[#dbe5ec] bg-white/75">
                    <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-2 px-5 py-4 text-xs text-[#8799a7] sm:flex-row sm:items-center sm:justify-between sm:px-8">
                        <span>© 2026 BPS Kota Sawahlunto</span>
                        <span>Single Sign-On untuk aplikasi internal</span>
                    </div>
                </footer>
            </div>
        </>
    );
}
