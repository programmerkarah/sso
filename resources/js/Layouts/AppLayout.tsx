import {
    AppWindow,
    Database,
    LayoutDashboard,
    LogOut,
    Menu,
    Shield,
    User,
    X,
} from 'lucide-react';

import { PropsWithChildren, useEffect, useRef, useState } from 'react';

import { Link, usePage } from '@inertiajs/react';

import AnimatedBackground from '@/Components/AnimatedBackground';
import AppIcon from '@/Components/AppIcon';
import NavDropdown from '@/Components/NavDropdown';
import ToastViewport, { ToastItem } from '@/Components/ToastViewport';
import { PageProps } from '@/types';

export default function AppLayout({ children }: PropsWithChildren) {
    const { auth, flash } = usePage<PageProps>().props;
    const user = auth?.user;
    const canManageApplications = auth?.can.manageApplications ?? false;
    const canManageUsers = auth?.can.manageUsers ?? false;
    const canManageSystem = auth?.can.manageSystem ?? false;

    const navRef = useRef<HTMLElement | null>(null);
    const dropdownContainerRef = useRef<HTMLDivElement | null>(null);

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [desktopDropdown, setDesktopDropdown] = useState<
        'account' | 'applications' | null
    >(null);
    const [mobileDropdown, setMobileDropdown] = useState<
        'account' | 'applications' | null
    >(null);
    const [mainPaddingTop, setMainPaddingTop] = useState(120);
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

    useEffect(() => {
        const updateMainPadding = () => {
            const navHeight = navRef.current?.offsetHeight ?? 100;
            setMainPaddingTop(navHeight + 16);
        };

        updateMainPadding();
        window.addEventListener('resize', updateMainPadding);

        return () => {
            window.removeEventListener('resize', updateMainPadding);
        };
    }, [mobileMenuOpen, desktopDropdown, mobileDropdown]);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            const target = event.target as Node;

            if (
                dropdownContainerRef.current &&
                !dropdownContainerRef.current.contains(target)
            ) {
                setDesktopDropdown(null);
                setMobileDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    const toggleDesktopDropdown = (dropdown: 'account' | 'applications') => {
        setDesktopDropdown((current) =>
            current === dropdown ? null : dropdown,
        );
    };

    const toggleMobileDropdown = (dropdown: 'account' | 'applications') => {
        setMobileDropdown((current) =>
            current === dropdown ? null : dropdown,
        );
    };

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
                    <nav
                        ref={navRef}
                        className="fixed left-0 right-0 top-0 z-50 px-4 pt-4"
                    >
                        <div className="mx-auto max-w-7xl">
                            <div
                                ref={dropdownContainerRef}
                                className="rounded-2xl border border-white/20 bg-white/10 px-6 py-4 shadow-2xl backdrop-blur-xl"
                            >
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
                                        {canManageUsers ||
                                        canManageApplications ? (
                                            <>
                                                <NavDropdown
                                                    title="Akun & Keamanan"
                                                    icon={
                                                        <Shield className="h-4 w-4" />
                                                    }
                                                    isOpen={
                                                        desktopDropdown ===
                                                        'account'
                                                    }
                                                    onToggle={() =>
                                                        toggleDesktopDropdown(
                                                            'account',
                                                        )
                                                    }
                                                >
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
                                                </NavDropdown>

                                                <NavDropdown
                                                    title="Aplikasi"
                                                    icon={
                                                        <AppWindow className="h-4 w-4" />
                                                    }
                                                    isOpen={
                                                        desktopDropdown ===
                                                        'applications'
                                                    }
                                                    onToggle={() =>
                                                        toggleDesktopDropdown(
                                                            'applications',
                                                        )
                                                    }
                                                >
                                                    <Link
                                                        href="/applications"
                                                        className="block rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
                                                    >
                                                        Aplikasi SSO
                                                    </Link>
                                                    {canManageApplications && (
                                                        <Link
                                                            href="/admin/applications"
                                                            className="block rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
                                                        >
                                                            Daftar Aplikasi
                                                        </Link>
                                                    )}
                                                </NavDropdown>
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
                                                    Aplikasi SSO
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
                                            setMobileMenuOpen((current) => {
                                                const nextState = !current;

                                                if (!nextState) {
                                                    setMobileDropdown(null);
                                                }

                                                return nextState;
                                            })
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
                                        {canManageUsers ||
                                        canManageApplications ? (
                                            <>
                                                <NavDropdown
                                                    title="Keamanan"
                                                    icon={
                                                        <Shield className="h-4 w-4" />
                                                    }
                                                    isOpen={
                                                        mobileDropdown ===
                                                        'account'
                                                    }
                                                    onToggle={() =>
                                                        toggleMobileDropdown(
                                                            'account',
                                                        )
                                                    }
                                                    variant="mobile"
                                                >
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
                                                </NavDropdown>

                                                <NavDropdown
                                                    title="Aplikasi SSO"
                                                    icon={
                                                        <AppWindow className="h-4 w-4" />
                                                    }
                                                    isOpen={
                                                        mobileDropdown ===
                                                        'applications'
                                                    }
                                                    onToggle={() =>
                                                        toggleMobileDropdown(
                                                            'applications',
                                                        )
                                                    }
                                                    variant="mobile"
                                                >
                                                    <Link
                                                        href="/applications"
                                                        className="rounded-lg px-3 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
                                                    >
                                                        Aplikasi SSO
                                                    </Link>
                                                    {canManageApplications && (
                                                        <Link
                                                            href="/admin/applications"
                                                            className="rounded-lg px-3 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
                                                        >
                                                            Kelola Aplikasi
                                                        </Link>
                                                    )}
                                                </NavDropdown>
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
                                                    Aplikasi SSO
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

                <main
                    className="px-4 pb-12"
                    style={
                        user ? { paddingTop: `${mainPaddingTop}px` } : undefined
                    }
                >
                    {children}
                </main>
            </div>
        </>
    );
}
