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

import {
    PropsWithChildren,
    ReactNode,
    useEffect,
    useRef,
    useState,
} from 'react';

import { Link, usePage } from '@inertiajs/react';

import AppIcon from '@/Components/AppIcon';
import NavDropdown from '@/Components/NavDropdown';
import ScrollArea from '@/Components/ScrollArea';
import ThemeToggle from '@/Components/ThemeToggle';
import ToastViewport, { ToastItem } from '@/Components/ToastViewport';
import { PageProps } from '@/types';

const iconFor = (icon?: string): ReactNode => {
    switch (icon) {
        case 'dashboard':
            return <LayoutDashboard className="h-4 w-4" />;
        case 'applications':
            return <AppWindow className="h-4 w-4" />;
        default:
            return <Database className="h-4 w-4" />;
    }
};

const isActive = (currentUrl: string, href: string) =>
    currentUrl === href ||
    currentUrl.startsWith(href + '/') ||
    currentUrl.startsWith(href + '?');

export default function AppLayout({ children }: PropsWithChildren) {
    const page = usePage<PageProps>();
    const { app, auth, flash, navigation, ui } = page.props;
    const currentUrl = page.url;
    const user = auth?.user;

    const navContainerRef = useRef<HTMLDivElement | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [desktopDropdown, setDesktopDropdown] = useState<
        'account' | 'admin' | null
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
        if (flash.success)
            nextToasts.push({
                id: 'success-' + flash.success,
                tone: 'success',
                title: 'Berhasil',
                message: flash.success,
            });
        if (flash.info)
            nextToasts.push({
                id: 'info-' + flash.info,
                tone: 'info',
                title: 'Informasi',
                message: flash.info,
            });
        if (flash.error)
            nextToasts.push({
                id: 'error-' + flash.error,
                tone: 'error',
                title: 'Terjadi Kendala',
                message: flash.error,
            });
        if (flash.status)
            nextToasts.push({
                id: 'status-' + flash.status,
                tone: 'status',
                title: 'Pembaruan Status',
                message: flash.status,
            });
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
        'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ' +
        (active
            ? 'ui-selected border-transparent'
            : 'ui-hover border-transparent text-[var(--bps-muted)]');

    return (
        <div className="app-background flex h-dvh flex-col overflow-hidden text-[#18324a]">
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
                <header className="app-header-background z-50 shrink-0 border-b border-[#dbe5ec]">
                    <div
                        ref={navContainerRef}
                        className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 2xl:px-10"
                    >
                        <div className="flex h-14 items-center justify-between gap-3 sm:h-16 sm:gap-4">
                            <Link
                                href="/dashboard"
                                className="flex min-w-0 items-center gap-3"
                            >
                                <AppIcon className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" />
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-semibold text-[#18324a]">
                                        {app.product_name}
                                    </div>
                                    <div className="hidden text-xs text-slate-500 sm:block">
                                        {app.description}
                                    </div>
                                </div>
                            </Link>

                            <nav className="hidden items-center gap-1 md:flex">
                                {navigation.primary.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={navLinkClass(
                                            isActive(currentUrl, item.href),
                                        )}
                                    >
                                        {iconFor(item.icon)}
                                        {item.label}
                                    </Link>
                                ))}

                                {navigation.account.length > 0 && (
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
                                        {navigation.account.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={
                                                    'block rounded-md px-3 py-2 text-sm transition ' +
                                                    (isActive(
                                                        currentUrl,
                                                        item.href,
                                                    )
                                                        ? 'ui-selected'
                                                        : 'ui-hover text-[var(--bps-muted)]')
                                                }
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                    </NavDropdown>
                                )}

                                {navigation.admin.length > 0 && (
                                    <NavDropdown
                                        title="Admin"
                                        icon={<Database className="h-4 w-4" />}
                                        isOpen={desktopDropdown === 'admin'}
                                        onToggle={() =>
                                            setDesktopDropdown((current) =>
                                                current === 'admin'
                                                    ? null
                                                    : 'admin',
                                            )
                                        }
                                    >
                                        {navigation.admin.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={
                                                    'block rounded-md px-3 py-2 text-sm transition ' +
                                                    (isActive(
                                                        currentUrl,
                                                        item.href,
                                                    )
                                                        ? 'ui-selected'
                                                        : 'ui-hover text-[var(--bps-muted)]')
                                                }
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                    </NavDropdown>
                                )}
                            </nav>

                            <div className="hidden items-center gap-3 md:flex">
                                <ThemeToggle compact />
                                <div className="flex items-center gap-2 border-l border-[#dbe5ec] pl-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eaf4fb] text-[#4a9fd7]">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div className="max-w-40">
                                        <div className="truncate text-sm font-medium text-[#29465f]">
                                            {user.name}
                                        </div>
                                        <div className="text-[11px] text-slate-500">
                                            {user.isAdmin
                                                ? 'Administrator'
                                                : 'Pengguna'}
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="ui-danger inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent"
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
                                className="ui-hover inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--bps-border)] text-[var(--bps-muted)] md:hidden"
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
                            <div className="border-t border-[#dbe5ec] py-3 md:hidden">
                                <div className="grid gap-1">
                                    {navigation.primary.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={navLinkClass(
                                                isActive(currentUrl, item.href),
                                            )}
                                        >
                                            {iconFor(item.icon)}
                                            {item.label}
                                        </Link>
                                    ))}
                                    {navigation.account.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={navLinkClass(
                                                isActive(currentUrl, item.href),
                                            )}
                                        >
                                            <Shield className="h-4 w-4" />
                                            {item.label}
                                        </Link>
                                    ))}
                                    {navigation.admin.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={navLinkClass(
                                                isActive(currentUrl, item.href),
                                            )}
                                        >
                                            {item.href.includes('/users') ? (
                                                <Users className="h-4 w-4" />
                                            ) : (
                                                <Database className="h-4 w-4" />
                                            )}
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>

                                <div className="mt-3 flex items-center justify-between border-t border-[#dbe5ec] pt-3">
                                    <ThemeToggle />
                                </div>
                                <div className="mt-3 flex items-center justify-between border-t border-[#dbe5ec] pt-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-[#29465f]">
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

            {ui.page.layout.content_scroll ? (
                <main className="mx-auto flex min-h-0 w-full max-w-[1680px] flex-1 flex-col px-3 py-3 sm:px-6 sm:py-5 lg:px-8 lg:py-6 2xl:px-10">
                    {children}
                </main>
            ) : (
                <ScrollArea
                    className="min-h-0 flex-1"
                    viewportClassName="px-3 py-3 sm:px-6 sm:py-5 lg:px-8 lg:py-6 2xl:px-10"
                >
                    <main className="mx-auto w-full max-w-[1680px]">
                        {children}
                    </main>
                </ScrollArea>
            )}
        </div>
    );
}
