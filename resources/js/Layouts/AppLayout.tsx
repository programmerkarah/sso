import {
    AppWindow,
    Database,
    LayoutDashboard,
    LogOut,
    Menu,
    MonitorX,
    Shield,
    User,
    Users,
    X,
} from 'lucide-react';

import { PropsWithChildren, useEffect, useRef, useState } from 'react';

import { Link, usePage } from '@inertiajs/react';

import AppIcon from '@/Components/AppIcon';
import NavDropdown from '@/Components/NavDropdown';
import ToastViewport, { ToastItem } from '@/Components/ToastViewport';
import { PageProps } from '@/types';

export default function AppLayout({ children }: PropsWithChildren) {
    const page = usePage<PageProps>();
    const { auth, flash } = page.props;
    const currentUrl = page.url;
    const user = auth?.user;
    const canManageApplications = auth?.can.manageApplications ?? false;
    const canManageUsers = auth?.can.manageUsers ?? false;
    const canManageSystem = auth?.can.manageSystem ?? false;

    const navContainerRef = useRef<HTMLDivElement | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [desktopDropdown, setDesktopDropdown] = useState<
        'account' | 'applications' | null
    >(null);
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const [sessionDisplaced, setSessionDisplaced] = useState(false);

    useEffect(() => {
        if (!user) return;

        const pusherKey = String(
            import.meta.env.VITE_PUSHER_APP_KEY ?? '',
        ).trim();
        const pusherCluster = String(
            import.meta.env.VITE_PUSHER_APP_CLUSTER ?? '',
        ).trim();

        if (!pusherKey || !pusherCluster) return;

        let disconnect: (() => void) | undefined;
        let cancelled = false;

        const connectRealtime = async () => {
            const [{ default: Echo }, { default: Pusher }] = await Promise.all([
                import('laravel-echo'),
                import('pusher-js'),
            ]);

            if (cancelled) return;

            (window as Window & { Pusher?: typeof Pusher }).Pusher = Pusher;

            const echo = new Echo({
                broadcaster: 'pusher',
                key: pusherKey,
                cluster: pusherCluster,
                forceTLS: true,
            });

            echo.private('session.' + user.id).listen(
                '.session.displaced',
                () => {
                    setSessionDisplaced(true);
                },
            );

            disconnect = () => echo.disconnect();
        };

        void connectRealtime();

        return () => {
            cancelled = true;
            disconnect?.();
        };
    }, [user?.id]);

    useEffect(() => {
        const nextToasts: ToastItem[] = [];

        if (flash.success) {
            nextToasts.push({
                id: 'success-' + flash.success,
                tone: 'success',
                title: 'Berhasil',
                message: flash.success,
            });
        }

        if (flash.info) {
            nextToasts.push({
                id: 'info-' + flash.info,
                tone: 'info',
                title: 'Informasi',
                message: flash.info,
            });
        }

        if (flash.error) {
            nextToasts.push({
                id: 'error-' + flash.error,
                tone: 'error',
                title: 'Terjadi Kendala',
                message: flash.error,
            });
        }

        if (flash.status) {
            nextToasts.push({
                id: 'status-' + flash.status,
                tone: 'status',
                title: 'Pembaruan Status',
                message: flash.status,
            });
        }

        setToasts(nextToasts);
    }, [flash.error, flash.info, flash.status, flash.success]);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            const target = event.target as Node;

            if (
                navContainerRef.current &&
                !navContainerRef.current.contains(target)
            ) {
                setDesktopDropdown(null);
                setMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () =>
            document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    useEffect(() => {
        setDesktopDropdown(null);
        setMobileMenuOpen(false);
    }, [currentUrl]);

    const navLinkClass = (active: boolean) =>
        'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ' +
        (active
            ? 'bg-slate-800 text-white'
            : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100');

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <ToastViewport
                items={toasts}
                onDismiss={(id) =>
                    setToasts((current) =>
                        current.filter((item) => item.id !== id),
                    )
                }
                topClassName="top-20"
            />

            {sessionDisplaced && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-300">
                            <MonitorX className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">
                            Sesi berakhir
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                            Akun ini telah digunakan untuk masuk dari perangkat
                            lain. Silakan masuk kembali untuk melanjutkan.
                        </p>
                        <button
                            type="button"
                            onClick={() => (window.location.href = '/login')}
                            className="mt-6 w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
                        >
                            Masuk kembali
                        </button>
                    </div>
                </div>
            )}

            {user && (
                <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95">
                    <div
                        ref={navContainerRef}
                        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
                    >
                        <div className="flex h-16 items-center justify-between gap-4">
                            <Link
                                href="/dashboard"
                                className="flex min-w-0 items-center gap-3"
                            >
                                <AppIcon className="h-8 w-8 shrink-0" />
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-semibold text-white">
                                        SSO BPS Kota Sawahlunto
                                    </div>
                                    <div className="hidden text-xs text-slate-500 sm:block">
                                        Single Sign-On
                                    </div>
                                </div>
                            </Link>

                            <nav className="hidden items-center gap-1 md:flex">
                                <Link
                                    href="/dashboard"
                                    className={navLinkClass(
                                        currentUrl.startsWith('/dashboard'),
                                    )}
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Link>

                                <Link
                                    href="/applications"
                                    className={navLinkClass(
                                        currentUrl === '/applications' ||
                                            currentUrl.startsWith(
                                                '/applications?',
                                            ),
                                    )}
                                >
                                    <AppWindow className="h-4 w-4" />
                                    Aplikasi
                                </Link>

                                <NavDropdown
                                    title="Akun"
                                    icon={<Shield className="h-4 w-4" />}
                                    isOpen={desktopDropdown === 'account'}
                                    onToggle={() =>
                                        setDesktopDropdown((current) =>
                                            current === 'account'
                                                ? null
                                                : 'account',
                                        )
                                    }
                                >
                                    <Link
                                        href="/settings/security"
                                        className="block rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                                    >
                                        Keamanan akun
                                    </Link>
                                    <Link
                                        href="/settings/sessions"
                                        className="block rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                                    >
                                        Sesi & akses
                                    </Link>
                                </NavDropdown>

                                {(canManageApplications ||
                                    canManageUsers ||
                                    canManageSystem) && (
                                    <NavDropdown
                                        title="Admin"
                                        icon={<Database className="h-4 w-4" />}
                                        isOpen={
                                            desktopDropdown === 'applications'
                                        }
                                        onToggle={() =>
                                            setDesktopDropdown((current) =>
                                                current === 'applications'
                                                    ? null
                                                    : 'applications',
                                            )
                                        }
                                    >
                                        {canManageApplications && (
                                            <>
                                                <Link
                                                    href="/admin/applications"
                                                    className="block rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                                                >
                                                    Kelola aplikasi
                                                </Link>
                                                <Link
                                                    href="/admin/organizations"
                                                    className="block rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                                                >
                                                    Organisasi
                                                </Link>
                                            </>
                                        )}
                                        {canManageUsers && (
                                            <Link
                                                href="/admin/users"
                                                className="block rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                                            >
                                                Pengguna
                                            </Link>
                                        )}
                                        {canManageSystem && (
                                            <Link
                                                href="/admin/system"
                                                className="block rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                                            >
                                                Sistem
                                            </Link>
                                        )}
                                    </NavDropdown>
                                )}
                            </nav>

                            <div className="hidden items-center gap-3 md:flex">
                                <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div className="max-w-40">
                                        <div className="truncate text-sm font-medium text-slate-200">
                                            {user.name}
                                        </div>
                                        <div className="text-[11px] text-slate-500">
                                            {canManageApplications
                                                ? 'Administrator'
                                                : 'Pengguna'}
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-900 hover:text-red-300"
                                    title="Keluar"
                                >
                                    <LogOut className="h-4 w-4" />
                                </Link>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setMobileMenuOpen((current) => !current)
                                }
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-300 md:hidden"
                                aria-label="Buka menu"
                            >
                                {mobileMenuOpen ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                            </button>
                        </div>

                        {mobileMenuOpen && (
                            <div className="border-t border-slate-800 py-3 md:hidden">
                                <div className="grid gap-1">
                                    <Link
                                        href="/dashboard"
                                        className={navLinkClass(
                                            currentUrl.startsWith('/dashboard'),
                                        )}
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/applications"
                                        className={navLinkClass(
                                            currentUrl.startsWith(
                                                '/applications',
                                            ),
                                        )}
                                    >
                                        <AppWindow className="h-4 w-4" />
                                        Aplikasi
                                    </Link>
                                    <Link
                                        href="/settings/security"
                                        className={navLinkClass(
                                            currentUrl.startsWith(
                                                '/settings/security',
                                            ),
                                        )}
                                    >
                                        <Shield className="h-4 w-4" />
                                        Keamanan akun
                                    </Link>
                                    <Link
                                        href="/settings/sessions"
                                        className={navLinkClass(
                                            currentUrl.startsWith(
                                                '/settings/sessions',
                                            ),
                                        )}
                                    >
                                        <User className="h-4 w-4" />
                                        Sesi & akses
                                    </Link>

                                    {canManageApplications && (
                                        <Link
                                            href="/admin/applications"
                                            className={navLinkClass(
                                                currentUrl.startsWith(
                                                    '/admin/applications',
                                                ),
                                            )}
                                        >
                                            <AppWindow className="h-4 w-4" />
                                            Kelola aplikasi
                                        </Link>
                                    )}
                                    {canManageApplications && (
                                        <Link
                                            href="/admin/organizations"
                                            className={navLinkClass(
                                                currentUrl.startsWith(
                                                    '/admin/organizations',
                                                ),
                                            )}
                                        >
                                            <Database className="h-4 w-4" />
                                            Organisasi
                                        </Link>
                                    )}
                                    {canManageUsers && (
                                        <Link
                                            href="/admin/users"
                                            className={navLinkClass(
                                                currentUrl.startsWith(
                                                    '/admin/users',
                                                ),
                                            )}
                                        >
                                            <Users className="h-4 w-4" />
                                            Pengguna
                                        </Link>
                                    )}
                                    {canManageSystem && (
                                        <Link
                                            href="/admin/system"
                                            className={navLinkClass(
                                                currentUrl.startsWith(
                                                    '/admin/system',
                                                ),
                                            )}
                                        >
                                            <Database className="h-4 w-4" />
                                            Sistem
                                        </Link>
                                    )}
                                </div>

                                <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-slate-200">
                                            {user.name}
                                        </p>
                                        <p className="truncate text-xs text-slate-500">
                                            {user.email}
                                        </p>
                                    </div>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/10"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Keluar
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </header>
            )}

            <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                {children}
            </main>
        </div>
    );
}
