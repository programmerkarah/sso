import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
}

export default function Button({
    children,
    variant = 'primary',
    className = '',
    ...props
}: ButtonProps) {
    const variants = {
        primary: 'bg-[#0077b6] text-white hover:bg-[#008dcc] focus:ring-[#00aeef]/30',
        secondary:
            'border border-cyan-900/60 bg-[#0b2d46] text-slate-200 hover:bg-[#11364f] focus:ring-[#00aeef]/20',
        danger: 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500/30',
    };

    return (
        <button
            {...props}
            className={
                'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ' +
                variants[variant] +
                ' ' +
                className
            }
        >
            {children}
        </button>
    );
}
