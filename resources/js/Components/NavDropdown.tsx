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
            <div className="overflow-hidden rounded-lg border border-slate-800">
                <button
                    type="button"
                    onClick={onToggle}
                    className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-slate-300"
                >
                    <span className="inline-flex items-center gap-2">
                        {icon}
                        {title}
                    </span>
                    <ChevronDown
                        className={
                            'h-4 w-4 transition-transform ' +
                            (isOpen ? 'rotate-180' : '')
                        }
                    />
                </button>
                {isOpen && (
                    <div className="grid gap-1 border-t border-slate-800 p-2">
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
                className={
                    'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ' +
                    (isOpen
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100')
                }
            >
                {icon}
                {title}
                <ChevronDown
                    className={
                        'h-3.5 w-3.5 transition-transform ' +
                        (isOpen ? 'rotate-180' : '')
                    }
                />
            </button>
            {isOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-lg border border-slate-700 bg-slate-900 p-1.5 shadow-xl">
                    {children}
                </div>
            )}
        </div>
    );
}
