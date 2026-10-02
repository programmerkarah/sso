import { PropsWithChildren } from 'react';

interface GlassCardProps {
    className?: string;
    hover?: boolean;
}

export default function GlassCard({
    children,
    className = '',
    hover = false,
}: PropsWithChildren<GlassCardProps>) {
    return (
        <div
            className={
                'min-w-0 w-full rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6 ' +
                (hover
                    ? 'transition-colors hover:border-slate-700 hover:bg-slate-900/80 '
                    : '') +
                className
            }
        >
            {children}
        </div>
    );
}
