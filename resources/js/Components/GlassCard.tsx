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
            className={`backdrop-blur-xl rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl transition-all duration-300 ${
                hover
                    ? 'hover:scale-105 hover:border-white/30 hover:bg-white/20 hover:shadow-2xl'
                    : ''
            } ${className}`}
        >
            {children}
        </div>
    );
}
