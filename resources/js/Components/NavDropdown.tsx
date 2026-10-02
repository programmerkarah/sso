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
            <div className="overflow-hidden rounded-lg border border-[#dbe5ec]">
                <button
                    type="button"
                    onClick={onToggle}
                    className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-[#49657b]"
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
                    <div className="grid gap-1 border-t border-[#dbe5ec] p-2">
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
                        ? 'bg-[#e7f3fb] text-[#2f6f98]'
                        : 'text-[#6f8495] hover:bg-[#eef5f9] hover:text-[#18324a]')
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
                <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-lg border border-[#d5e1e9] bg-white p-1.5 shadow-xl">
                    {children}
                </div>
            )}
        </div>
    );
}
