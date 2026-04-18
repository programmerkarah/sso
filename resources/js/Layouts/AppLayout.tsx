import {
    AppWindow,
    ChevronDown,
    Database,
    LayoutDashboard,
    LogOut,
    Menu,
    Shield,
    User,
    Users,
    X,
} from 'lucide-react';

import { PropsWithChildren, useEffect, useState } from 'react';

import { Link, usePage } from '@inertiajs/react';

import AnimatedBackground from '@/Components/AnimatedBackground';
import AppIcon from '@/Components/AppIcon';
import ToastViewport, { ToastItem } from '@/Components/ToastViewport';
import { PageProps } from '@/types';

export default function AppLayout({ children }: PropsWithChildren) {
    const { auth, flash } = usePage<PageProps>().props;
    const user = auth?.user;
    const canManageApplications = auth?.can.manageApplications ?? false;
    const canManageUsers = auth?.can.manageUsers ?? false;
    const canManageSystem = auth?.can.manageSystem ?? false;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    useEffect(() => {
        const nextToasts: ToastItem[] = [];

        if (flash.success) {
            nextToasts.push({
                id: `success-${flash.success}`,
                tone: 'success',
                title: 'Berhasil',
                message: flash.success,
            });
        }

        if (flash.info) {
            nextToasts.push({
                id: `info-${flash.info}`,
                tone: 'info',
                title: 'Informasi',
                message: flash.info,
            });
        }

        if (flash.error) {
            nextToasts.push({
                id: `error-${flash.error}`,
                tone: 'error',
                title: 'Terjadi Kendala',
                message: flash.error,
            });
        }

        if (flash.status) {
            nextToasts.push({
                id: `status-${flash.status}`,
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
            />
            <div className="relative min-h-screen">
                {user && (
                    <nav className="fixed left-0 right-0 top-0 z-50 px-4 pt-4">
                        <div className="mx-auto max-w-7xl">
                            <div className="rounded-2xl border border-white/20 bg-white/10 px-6 py-4 shadow-2xl backdrop-blur-xl">
                                <div className="flex items-center justify-between">
                                    {/* Logo */}
                                    <div className="flex items-center gap-3">
                                        <Link
                                            href="/dashboard"
                                            className="rounded-xl bg-white/10 p-2 backdrop-blur-sm transition hover:bg-white/20"
                                        >
                                            <AppIcon className="h-8 w-8" />
                                        </Link>
                                        <Link
                                            href="/dashboard"
                                            className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-2xl font-black text-transparent drop-shadow-lg transition hover:from-blue-100 hover:to-purple-100"
                                        >
                                            Single Sign-On
                                        </Link>
                                    </div>

                                    {/* Desktop Navigation */}
                                    <div className="hidden items-center gap-6 md:flex">
                                        <Link
                                            href="/dashboard"
                                            className="rounded-xl px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-white"
                                        >
                                            <LayoutDashboard className="inline h-4 w-4 mr-1.5 align-text-bottom" />
                                            Dashboard
                                        </Link>
                                        {(canManageUsers || canManageApplications) ? (
                                            <>
                                                <details className="group relative">
                                                    <summary className="list-none cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-white">
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <Shield className="h-4 w-4" />
                                                            Akun & Keamanan
                                                            <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                                                        </span>
                                                    </summary>
                                                    <div className="absolute left-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-white/20 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl">
                                                        <Link
                                                            href="/settings/security"
                                                            className="block rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
                                                        >
                                                            Keamanan
                                                        </Link>
                                                        {canManageUsers && (
                                                            <Link
                                                                href="/admin/users"
                                                                className="block rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
                                                            >
                                                                Kelola Pengguna
                                                            </Link>
                                                        )}
                                                    </div>
                                                </details>

                                                <details className="group relative">
                                                    <summary className="list-none cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-white">
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <AppWindow className="h-4 w-4" />
                                                            Aplikasi
                                                            <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                                                        </span>
                                                    </summary>
                                                    <div className="absolute left-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-white/20 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl">
                                                        <Link
                                                            href="/applications"
                                                            className="block rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
                                                        >
                                                            Daftar Aplikasi
                                                        </Link>
                                                        {canManageApplications && (
                                                            <Link
                                                                href="/admin/applications"
                                                                className="block rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
                                                            >
                                                                Kelola Aplikasi
                                                            </Link>
                                                        )}
                                                    </div>
                                                </details>
                                            </>
                                        ) : (
                                            <>
                                                <Link
                                                    href="/settings/security"
                                                    className="rounded-xl px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-white"
                                                >
                                                    <Shield className="inline h-4 w-4 mr-1.5 align-text-bottom" />
                                                    Keamanan
                                                </Link>
                                                <Link
                                                    href="/applications"
                                                    className="rounded-xl px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-white"
                                                >
                                                    <AppWindow className="inline h-4 w-4 mr-1.5 align-text-bottom" />
                                                    Aplikasi
                                                </Link>
                                            </>
                                        )}
                                        {canManageSystem && (
                                            <Link
                                                href="/admin/system"
                                                className="rounded-xl px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-white"
                                            >
                                                <Database className="inline h-4 w-4 mr-1.5 align-text-bottom" />
                                                Sistem
                                            </Link>
                                        )}

                                        <div className="ml-4 flex items-center gap-4 border-l border-white/20 pl-4">
                                            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm">
                                                <User className="h-4 w-4 text-white/80" />
                                                <span className="text-sm font-medium text-white">
                                                    {user.name}
                                                </span>
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${canManageApplications ? 'bg-emerald-400/20 text-emerald-100' : 'bg-white/15 text-white/80'}`}
                                                >
                                                    {canManageApplications
                                                        ? 'Admin'
                                                        : 'User'}
                                                </span>
                                            </div>
                                            <Link
                                                href="/logout"
                                                method="post"
                                                as="button"
                                                className="flex items-center gap-2 rounded-xl bg-red-500/80 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-red-600"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Keluar
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Mobile Menu Button */}
                                    <button
                                        onClick={() =>
                                            setMobileMenuOpen(!mobileMenuOpen)
                                        }
                                        className="rounded-xl bg-white/10 p-2 text-white backdrop-blur-sm transition hover:bg-white/20 md:hidden"
                                    >
                                        {mobileMenuOpen ? (
                                            <X className="h-6 w-6" />
                                        ) : (
                                            <Menu className="h-6 w-6" />
                                        )}
                                    </button>
                                </div>

                                {/* Mobile Menu */}
                                {mobileMenuOpen && (
                                    <div className="mt-4 space-y-2 border-t border-white/20 pt-4 md:hidden">
                                        <Link
                                            href="/dashboard"
                                            className="block rounded-xl px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                                        >
                                            <LayoutDashboard className="inline h-4 w-4 mr-1.5 align-text-bottom" />
                                            Dashboard
                                        </Link>
                                        {(canManageUsers || canManageApplications) ? (
                                            <>
                                                <details className="overflow-hidden rounded-xl border border-white/15 bg-white/5">
                                                    <summary className="list-none cursor-pointer px-4 py-2 text-sm font-semibold text-white/90">
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <Shield className="h-4 w-4" />
                                                            Akun & Keamanan
                                                        </span>
                                                    </summary>
                                                    <div className="flex flex-col gap-1 border-t border-white/10 px-2 py-2">
                                                        <Link
                                                            href="/settings/security"
                                                            className="rounded-lg px-3 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
                                                        >
                                                            Keamanan
                                                        </Link>
                                                        {canManageUsers && (
                                                            <Link
                                                                href="/admin/users"
                                                                className="rounded-lg px-3 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
                                                            >
                                                                Kelola Pengguna
                                                            </Link>
                                                        )}
                                                    </div>
                                                </details>

                                                <details className="overflow-hidden rounded-xl border border-white/15 bg-white/5">
                                                    <summary className="list-none cursor-pointer px-4 py-2 text-sm font-semibold text-white/90">
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <AppWindow className="h-4 w-4" />
                                                            Aplikasi
                                                        </span>
                                                    </summary>
                                                    <div className="flex flex-col gap-1 border-t border-white/10 px-2 py-2">
                                                        <Link
                                                            href="/applications"
                                                            className="rounded-lg px-3 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
                                                        >
                                                            Daftar Aplikasi
                                                        </Link>
                                                        {canManageApplications && (
                                                            <Link
                                                                href="/admin/applications"
                                                                className="rounded-lg px-3 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
                                                            >
                                                                Kelola Aplikasi
                                                            </Link>
                                                        )}
                                                    </div>
                                                </details>
                                            </>
                                        ) : (
                                            <>
                                                <Link
                                                    href="/settings/security"
                                                    className="block rounded-xl px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                                                >
                                                    <Shield className="inline h-4 w-4 mr-1.5 align-text-bottom" />
                                                    Keamanan
                                                </Link>
                                                <Link
                                                    href="/applications"
                                                    className="block rounded-xl px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                                                >
                                                    <AppWindow className="inline h-4 w-4 mr-1.5 align-text-bottom" />
                                                    Aplikasi
                                                </Link>
                                            </>
                                        )}
                                        {canManageSystem && (
                                            <Link
                                                href="/admin/system"
                                                className="block rounded-xl px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                                            >
                                                <Database className="inline h-4 w-4 mr-1.5 align-text-bottom" />
                                                Sistem
                                            </Link>
                                        )}
                                        <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2">
                                            <User className="h-4 w-4 text-white/80" />
                                            <span className="text-sm font-medium text-white">
                                                {user.name}
                                            </span>
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${canManageApplications ? 'bg-emerald-400/20 text-emerald-100' : 'bg-white/15 text-white/80'}`}
                                            >
                                                {canManageApplications
                                                    ? 'Admin'
                                                    : 'User'}
                                            </span>
                                        </div>
                                        <Link
                                            href="/logout"
                                            method="post"
                                            as="button"
                                            className="flex w-full items-center gap-2 rounded-xl bg-red-500/80 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-red-600"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Keluar
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </nav>
                )}

                <main className="px-4 pb-12 pt-28">
                    {children}
                </main>
            </div>
        </>
    );
}
