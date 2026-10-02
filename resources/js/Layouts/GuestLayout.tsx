import { PropsWithChildren, useEffect, useState } from 'react';

import { Link, usePage } from '@inertiajs/react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';

import AppIcon from '@/Components/AppIcon';
import ToastViewport, { ToastItem } from '@/Components/ToastViewport';
import { PageProps } from '@/types';

export default function GuestLayout({ children }: PropsWithChildren) {
    const { flash } = usePage<PageProps>().props;
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    useEffect(() => {
        const nextToasts: ToastItem[] = [];

        if (flash.success) nextToasts.push({ id: `guest-success-${flash.success}`, tone: 'success', title: 'Berhasil', message: flash.success });
        if (flash.info) nextToasts.push({ id: `guest-info-${flash.info}`, tone: 'info', title: 'Informasi', message: flash.info });
        if (flash.error) nextToasts.push({ id: `guest-error-${flash.error}`, tone: 'error', title: 'Terjadi Kendala', message: flash.error });
        if (flash.status) nextToasts.push({ id: `guest-status-${flash.status}`, tone: 'status', title: 'Pembaruan Status', message: flash.status });

        setToasts(nextToasts);
    }, [flash.error, flash.info, flash.status, flash.success]);

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <ToastViewport
                items={toasts}
                onDismiss={(id) => setToasts((current) => current.filter((item) => item.id !== id))}
                topClassName="top-4"
            />

            <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.05fr_0.95fr]">
                <aside className="hidden border-r border-white/10 px-10 py-10 lg:flex lg:flex-col">
                    <Link href="/" className="inline-flex w-fit items-center gap-3">
                        <AppIcon className="h-10 w-10" />
                        <div>
                            <div className="text-sm font-bold tracking-wide">SSO BPS Kota Sawahlunto</div>
                            <div className="text-xs text-slate-400">Pusat autentikasi aplikasi internal</div>
                        </div>
                    </Link>

                    <div className="my-auto max-w-xl py-16">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 text-xs font-semibold text-sky-200">
                            <ShieldCheck className="h-4 w-4" />
                            Akses terpusat dan terlindungi
                        </div>
                        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
                            Satu akun untuk aplikasi kerja BPS Kota Sawahlunto.
                        </h1>
                        <p className="mt-5 max-w-lg text-base leading-7 text-slate-400">
                            Masuk sekali, gunakan aplikasi yang Anda miliki aksesnya, dan kelola keamanan akun dari satu tempat.
                        </p>

                        <div className="mt-10 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                                <LockKeyhole className="mb-3 h-5 w-5 text-sky-300" />
                                <p className="text-sm font-semibold">Autentikasi terpusat</p>
                                <p className="mt-1 text-sm leading-6 text-slate-400">Tidak perlu akun berbeda untuk setiap aplikasi.</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                                <ShieldCheck className="mb-3 h-5 w-5 text-emerald-300" />
                                <p className="text-sm font-semibold">Keamanan akun</p>
                                <p className="mt-1 text-sm leading-6 text-slate-400">2FA dan pengelolaan sesi tersedia dalam satu pusat kontrol.</p>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-slate-500">© 2026 BPS Kota Sawahlunto</p>
                </aside>

                <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
                    <div className="w-full max-w-md">
                        <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
                            <AppIcon className="h-10 w-10" />
                            <div>
                                <div className="text-sm font-bold">SSO BPS Kota Sawahlunto</div>
                                <div className="text-xs text-slate-400">Pusat autentikasi aplikasi</div>
                            </div>
                        </Link>

                        <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl shadow-black/20 sm:p-8">
                            {children}
                        </div>

                        <div className="mt-6 flex items-center justify-between gap-4 text-xs text-slate-500">
                            <Link href="/" className="transition hover:text-slate-300">Kembali ke beranda</Link>
                            <span>BPS Kota Sawahlunto</span>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
