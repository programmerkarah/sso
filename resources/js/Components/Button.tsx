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
        primary:
            'bg-sky-600 text-white hover:bg-sky-500 focus:ring-sky-500/30',
        secondary:
            'border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 focus:ring-slate-600/30',
        danger:
            'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500/30',
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
