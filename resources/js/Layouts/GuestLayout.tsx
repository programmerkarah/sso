import { PropsWithChildren, useEffect, useState } from 'react';

import { Link, usePage } from '@inertiajs/react';

import AppIcon from '@/Components/AppIcon';
import ScrollArea from '@/Components/ScrollArea';
import ToastViewport, { ToastItem } from '@/Components/ToastViewport';
import { PageProps } from '@/types';

export default function GuestLayout({ children }: PropsWithChildren) {
    const { flash } = usePage<PageProps>().props;
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    useEffect(() => {
        const nextToasts: ToastItem[] = [];

        if (flash.success)
            nextToasts.push({
                id: `guest-success-${flash.success}`,
                tone: 'success',
                title: 'Berhasil',
                message: flash.success,
            });

        if (flash.info)
            nextToasts.push({
                id: `guest-info-${flash.info}`,
                tone: 'info',
                title: 'Informasi',
                message: flash.info,
            });

        if (flash.error)
            nextToasts.push({
                id: `guest-error-${flash.error}`,
                tone: 'error',
                title: 'Terjadi Kendala',
                message: flash.error,
            });

        if (flash.status)
            nextToasts.push({
                id: `guest-status-${flash.status}`,
                tone: 'status',
                title: 'Pembaruan Status',
                message: flash.status,
            });

        setToasts(nextToasts);
    }, [flash.error, flash.info, flash.status, flash.success]);

    return (
        <div className="app-background h-dvh overflow-hidden text-white">
            <ToastViewport
                items={toasts}
                onDismiss={(id) =>
                    setToasts((current) =>
                        current.filter((item) => item.id !== id),
                    )
                }
                topClassName="top-4"
            />

            <div className="mx-auto grid h-full max-w-[1680px] lg:grid-cols-[0.9fr_1.1fr]">
                <aside className="hidden border-r border-cyan-950/70 bg-[#061f32]/55 px-10 py-9 lg:flex lg:flex-col xl:px-14">
                    <Link
                        href="/"
                        className="inline-flex w-fit items-center gap-3"
                    >
                        <AppIcon className="h-9 w-9" />
                        <div>
                            <div className="text-sm font-semibold text-slate-100">
                                SSO BPS Kota Sawahlunto
                            </div>
                            <div className="mt-0.5 text-xs text-slate-500">
                                Single Sign-On
                            </div>
                        </div>
                    </Link>

                    <div className="my-auto max-w-md py-16">
                        <p className="text-sm font-medium text-sky-300">
                            Sistem autentikasi terpusat
                        </p>
                        <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white xl:text-4xl">
                            Akses aplikasi kerja dengan satu akun.
                        </h1>
                        <p className="mt-5 text-sm leading-7 text-slate-400">
                            SSO digunakan untuk masuk ke aplikasi internal BPS
                            Kota Sawahlunto yang telah terintegrasi.
                        </p>

                        <div className="mt-8 border-t border-slate-800 pt-6">
                            <dl className="space-y-4 text-sm">
                                <div>
                                    <dt className="font-medium text-slate-200">
                                        Akses
                                    </dt>
                                    <dd className="mt-1 text-slate-500">
                                        Aplikasi tersedia sesuai organisasi dan
                                        kewenangan akun.
                                    </dd>
                                </div>
                                <div>
                                    <dt className="font-medium text-slate-200">
                                        Keamanan
                                    </dt>
                                    <dd className="mt-1 text-slate-500">
                                        Mendukung verifikasi dua langkah dan
                                        pengelolaan sesi perangkat.
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    <p className="text-xs text-slate-600">
                        © 2026 BPS Kota Sawahlunto
                    </p>
                </aside>

                <ScrollArea className="min-h-0 h-full" viewportClassName="px-4 py-6 sm:px-8 lg:px-12 xl:px-16">
                    <main className="flex min-h-full items-center justify-center">
                    <div className="w-full max-w-lg">
                        <Link
                            href="/"
                            className="mb-8 flex items-center gap-3 lg:hidden"
                        >
                            <AppIcon className="h-9 w-9" />
                            <div>
                                <div className="text-sm font-semibold text-slate-100">
                                    SSO BPS Kota Sawahlunto
                                </div>
                                <div className="mt-0.5 text-xs text-slate-500">
                                    Single Sign-On
                                </div>
                            </div>
                        </Link>

                        <div className="app-panel-background rounded-2xl border border-cyan-900/50 px-6 py-7 shadow-2xl shadow-black/10 sm:px-8 sm:py-8">
                            {children}
                        </div>

                        <div className="mt-5 flex items-center justify-between gap-4 text-xs text-slate-600">
                            <Link
                                href="/"
                                className="transition hover:text-slate-400"
                            >
                                Beranda
                            </Link>
                            <span>BPS Kota Sawahlunto</span>
                        </div>
                    </div>
                    </main>
                </ScrollArea>
            </div>
        </div>
    );
}
