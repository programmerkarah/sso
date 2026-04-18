import { ChevronDown } from 'lucide-react';

import { ReactNode } from 'react';

interface NavDropdownProps {
    title: string;
    icon: ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    children: ReactNode;
    variant?: 'desktop' | 'mobile';
}

export default function NavDropdown({
    title,
    icon,
    isOpen,
    onToggle,
    children,
    variant = 'desktop',
}: NavDropdownProps) {
    if (variant === 'mobile') {
        return (
            <div className="overflow-hidden rounded-xl border border-white/15 bg-white/5">
                <button
                    type="button"
                    onClick={onToggle}
                    className="flex w-full items-center justify-between px-4 py-2 text-sm font-semibold text-white/90"
                >
                    <span className="inline-flex items-center gap-1.5">
                        {icon}
                        {title}
                    </span>
                    <ChevronDown
                        className={`h-4 w-4 transition ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>
                {isOpen && (
                    <div className="flex flex-col gap-1 border-t border-white/10 px-2 py-2">
                        {children}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                type="button"
                onClick={onToggle}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-white"
            >
                <span className="inline-flex items-center gap-1.5">
                    {icon}
                    {title}
                    <ChevronDown
                        className={`h-4 w-4 transition ${isOpen ? 'rotate-180' : ''}`}
                    />
                </span>
            </button>
            {isOpen && (
                <div className="absolute left-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-white/20 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl">
                    {children}
                </div>
            )}
        </div>
    );
}
