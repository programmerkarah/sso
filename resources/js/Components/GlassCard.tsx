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
                'app-panel-background min-w-0 w-full rounded-2xl border border-[var(--bps-border)] p-5 sm:p-6 ' +
                (hover ? 'ui-hover transition-colors hover:shadow-md ' : '') +
                className
            }
        >
            {children}
        </div>
    );
}
