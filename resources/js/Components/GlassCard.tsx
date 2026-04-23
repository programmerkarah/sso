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
            className={`min-w-0 w-full rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 ${
                hover
                    ? 'lg:hover:scale-[1.02] lg:hover:border-white/30 lg:hover:bg-white/20 lg:hover:shadow-2xl'
                    : ''
            } ${className}`}
        >
            {children}
        </div>
    );
}
