import { AppWindow, LayoutDashboard, LogOut, Menu, Shield, User, Users, X } from 'lucide-react';

import { PropsWithChildren, useState } from 'react';

import { Link, usePage } from '@inertiajs/react';

import AnimatedBackground from '@/Components/AnimatedBackground';
import AppIcon from '@/Components/AppIcon';
import { PageProps } from '@/types';

export default function AppLayout({ children }: PropsWithChildren) {
    const { auth, flash } = usePage<PageProps>().props;
    const user = auth?.user;
    const canManageApplications = auth?.can.manageApplications ?? false;
    const canManageUsers = auth?.can.manageUsers ?? false;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <AnimatedBackground />
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
                                            SSO Sawahlunto
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
                                        <Link
                                            href="/settings/security"
                                            className="rounded-xl px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-white"
                                        >
                                            <Shield className="inline h-4 w-4 mr-1.5 align-text-bottom" />
                                            Keamanan
                                        </Link>
                                        {canManageApplications && (
                                            <Link
                                                href="/admin/applications"
                                                className="rounded-xl px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-white"
                                            >
                                                <AppWindow className="inline h-4 w-4 mr-1.5 align-text-bottom" />
                                                Aplikasi
                                            </Link>
                                        )}
                                        {canManageUsers && (
                                            <Link
                                                href="/admin/users"
                                                className="rounded-xl px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-white"
                                            >
                                                <Users className="inline h-4 w-4 mr-1.5 align-text-bottom" />
                                                Pengguna
                                            </Link>
                                        )}

                                        <div className="ml-4 flex items-center gap-4 border-l border-white/20 pl-4">
                                            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm">
                                                <User className="h-4 w-4 text-white/80" />
                                                <span className="text-sm font-medium text-white">
                                                    {user.name}
                                                </span>
                                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${canManageApplications ? 'bg-emerald-400/20 text-emerald-100' : 'bg-white/15 text-white/80'}`}>
                                                    {canManageApplications ? 'Admin' : 'User'}
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
                                        <Link
                                            href="/settings/security"
                                            className="block rounded-xl px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                                        >
                                            <Shield className="inline h-4 w-4 mr-1.5 align-text-bottom" />
                                            Keamanan
                                        </Link>
                                        {canManageApplications && (
                                            <Link
                                                href="/admin/applications"
                                                className="block rounded-xl px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                                            >
                                                <AppWindow className="inline h-4 w-4 mr-1.5 align-text-bottom" />
                                                Aplikasi
                                            </Link>
                                        )}
                                        {canManageUsers && (
                                            <Link
                                                href="/admin/users"
                                                className="block rounded-xl px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                                            >
                                                <Users className="inline h-4 w-4 mr-1.5 align-text-bottom" />
                                                Pengguna
                                            </Link>
                                        )}
                                        <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2">
                                            <User className="h-4 w-4 text-white/80" />
                                            <span className="text-sm font-medium text-white">
                                                {user.name}
                                            </span>
                                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${canManageApplications ? 'bg-emerald-400/20 text-emerald-100' : 'bg-white/15 text-white/80'}`}>
                                                {canManageApplications ? 'Admin' : 'User'}
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
                    <div className="mx-auto mb-6 max-w-7xl space-y-3">
                        {flash.success && (
                            <div className="rounded-2xl border border-emerald-300/30 bg-emerald-500/15 px-5 py-4 text-sm text-emerald-50 shadow-xl backdrop-blur-xl">
                                {flash.success}
                            </div>
                        )}
                        {flash.info && (
                            <div className="rounded-2xl border border-blue-300/30 bg-blue-500/15 px-5 py-4 text-sm text-blue-50 shadow-xl backdrop-blur-xl">
                                {flash.info}
                            </div>
                        )}
                        {flash.error && (
                            <div className="rounded-2xl border border-red-300/30 bg-red-500/15 px-5 py-4 text-sm text-red-50 shadow-xl backdrop-blur-xl">
                                {flash.error}
                            </div>
                        )}
                        {flash.status && (
                            <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-sm text-white shadow-xl backdrop-blur-xl">
                                {flash.status}
                            </div>
                        )}
                        {flash.temporaryPassword && (
                            <div className="rounded-2xl border border-amber-300/30 bg-amber-500/15 px-5 py-4 text-sm text-amber-50 shadow-xl backdrop-blur-xl">
                                <div className="font-semibold">
                                    Password sementara untuk {flash.temporaryPasswordFor ?? 'pengguna'}
                                </div>
                                <div className="mt-2 rounded-xl bg-black/20 px-4 py-3 font-mono text-base tracking-wide text-white">
                                    {flash.temporaryPassword}
                                </div>
                                <div className="mt-2 text-xs text-amber-100/90">
                                    Password ini hanya tampil sekali setelah reset password berhasil.
                                </div>
                            </div>
                        )}
                    </div>

                    {children}
                </main>
            </div>
        </>
    );
}
