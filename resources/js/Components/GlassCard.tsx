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
                'app-panel-background min-w-0 w-full rounded-2xl border border-cyan-900/45 p-5 sm:p-6 ' +
                (hover
                    ? 'transition-colors hover:border-cyan-800/70 hover:brightness-105 '
                    : '') +
                className
            }
        >
            {children}
        </div>
    );
}
