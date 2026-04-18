import { PropsWithChildren, useEffect, useState } from 'react';

import { Link, usePage } from '@inertiajs/react';

import AnimatedBackground from '@/Components/AnimatedBackground';
import AppIcon from '@/Components/AppIcon';
import ToastViewport, { ToastItem } from '@/Components/ToastViewport';
import { PageProps } from '@/types';

export default function GuestLayout({ children }: PropsWithChildren) {
    const { flash } = usePage<PageProps>().props;
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    useEffect(() => {
        const nextToasts: ToastItem[] = [];

        if (flash.success) {
            nextToasts.push({
                id: `guest-success-${flash.success}`,
                tone: 'success',
                title: 'Berhasil',
                message: flash.success,
            });
        }

        if (flash.info) {
            nextToasts.push({
                id: `guest-info-${flash.info}`,
                tone: 'info',
                title: 'Informasi',
                message: flash.info,
            });
        }

        if (flash.error) {
            nextToasts.push({
                id: `guest-error-${flash.error}`,
                tone: 'error',
                title: 'Terjadi Kendala',
                message: flash.error,
            });
        }

        if (flash.status) {
            nextToasts.push({
                id: `guest-status-${flash.status}`,
                tone: 'status',
                title: 'Pembaruan Status',
                message: flash.status,
            });
        }

        setToasts(nextToasts);
    }, [flash.error, flash.info, flash.status, flash.success]);

    return (
        <>
            <AnimatedBackground />
            <ToastViewport
                items={toasts}
                onDismiss={(id) =>
                    setToasts((current) =>
                        current.filter((item) => item.id !== id),
                    )
                }
                topClassName="top-4"
            />
            <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    {/* Logo Section */}
                    <div className="mb-8 text-center">
                        <Link href="/">
                            <div className="mb-4 inline-block">
                                <div className="relative">
                                    {/* Icon */}
                                    <div className="mb-4 flex justify-center">
                                        <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-xl border border-white/20">
                                            <AppIcon className="h-12 w-12" />
                                        </div>
                                    </div>
                                    {/* Title */}
                                    <div className="absolute -inset-2 animate-pulse rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-30 blur-xl"></div>
                                    <h1 className="relative bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-5xl font-black text-transparent drop-shadow-xl">
                                        Single Sign-On
                                    </h1>
                                </div>
                            </div>
                        </Link>
                        <p className="text-sm text-white/80">
                            Sistem Single Sign-On BPS Kota Sawahlunto
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="relative">
                        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 blur-xl"></div>
                        <div className="relative rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
                            {children}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-white/60">
                            © 2026 BPS Kota Sawahlunto
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
