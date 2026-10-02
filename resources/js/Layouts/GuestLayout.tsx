import { PropsWithChildren, useEffect, useState } from 'react';

import { Link, usePage } from '@inertiajs/react';

import AppIcon from '@/Components/AppIcon';
import ScrollArea from '@/Components/ScrollArea';
import ThemeToggle from '@/Components/ThemeToggle';
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
        <div className="app-background h-dvh overflow-hidden text-[#18324a]">
            <ToastViewport
                items={toasts}
                onDismiss={(id) =>
                    setToasts((current) =>
                        current.filter((item) => item.id !== id),
                    )
                }
                topClassName="top-4"
            />

            <div className="mx-auto grid h-full max-w-[1680px] xl:grid-cols-[0.9fr_1.1fr]">
                <aside className="hidden border-r border-[#dbe5ec] bg-white/55 px-10 py-9 xl:flex xl:flex-col xl:px-14">
                    <Link
                        href="/"
                        className="inline-flex w-fit items-center gap-3"
                    >
                        <AppIcon className="h-9 w-9" />
                        <div>
                            <div className="text-sm font-semibold text-[#18324a]">
                                SSO BPS Kota Sawahlunto
                            </div>
                            <div className="mt-0.5 text-xs text-[#8799a7]">
                                Single Sign-On
                            </div>
                        </div>
                    </Link>

                    <div className="my-auto max-w-md py-16">
                        <p className="text-sm font-medium text-sky-300">
                            Sistem autentikasi terpusat
                        </p>
                        <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-[#18324a] xl:text-4xl">
                            Akses aplikasi kerja dengan satu akun.
                        </h1>
                        <p className="mt-5 text-sm leading-7 text-[#6f8495]">
                            SSO digunakan untuk masuk ke aplikasi internal BPS
                            Kota Sawahlunto yang telah terintegrasi.
                        </p>

                        <div className="mt-8 border-t border-[#dbe5ec] pt-6">
                            <dl className="space-y-4 text-sm">
                                <div>
                                    <dt className="font-medium text-[#29465f]">
                                        Akses
                                    </dt>
                                    <dd className="mt-1 text-[#8799a7]">
                                        Aplikasi tersedia sesuai organisasi dan
                                        kewenangan akun.
                                    </dd>
                                </div>
                                <div>
                                    <dt className="font-medium text-[#29465f]">
                                        Keamanan
                                    </dt>
                                    <dd className="mt-1 text-[#8799a7]">
                                        Mendukung verifikasi dua langkah dan
                                        pengelolaan sesi perangkat.
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    <p className="text-xs text-[#9aabb7]">
                        © 2026 BPS Kota Sawahlunto
                    </p>
                </aside>

                <div className="relative grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto]">
                    <div className="absolute right-4 top-5 z-20 sm:right-8">
                        <ThemeToggle compact />
                    </div>
                    <div className="absolute left-4 top-4 z-10 sm:left-8 xl:hidden">
                        <Link href="/" className="flex items-center gap-3">
                            <AppIcon className="h-9 w-9" />
                            <div>
                                <div className="text-sm font-semibold text-[#18324a]">
                                    SSO BPS Kota Sawahlunto
                                </div>
                                <div className="mt-0.5 text-xs text-[#8799a7]">
                                    Single Sign-On
                                </div>
                            </div>
                        </Link>
                    </div>

                    <ScrollArea
                        className="min-h-0"
                        contentClassName="flex min-h-full items-center justify-center px-3 pb-4 pt-20 sm:px-6 sm:pb-6 sm:pt-24 md:px-8 xl:px-12 xl:py-10 2xl:px-16"
                    >
                        <main className="w-full max-w-md sm:max-w-lg">
                            <div className="app-panel-background rounded-2xl border border-[#dbe5ec] px-4 py-5 shadow-xl shadow-black/10 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                                {children}
                            </div>
                        </main>
                    </ScrollArea>

                    <footer className="border-t border-[#dbe5ec] bg-white/75 px-3 py-2.5 sm:px-6 sm:py-3 xl:px-12 2xl:px-16">
                        <div className="mx-auto flex w-full max-w-lg items-center justify-between gap-3 text-[11px] text-[#8799a7] sm:text-xs">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 rounded-lg border border-[#d5e1e9] bg-[#f8fbfd] px-3 py-2 font-medium text-[#6f8495] transition hover:border-[#b8d9ee] hover:bg-[#eef5f9] hover:text-[#347fae]"
                            >
                                <span aria-hidden="true">←</span>
                                Beranda
                            </Link>
                            <span>BPS Kota Sawahlunto</span>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}
